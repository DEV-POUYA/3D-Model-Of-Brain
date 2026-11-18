import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  BrainRegion,
  BrainRegionId,
  CATEGORY_LABELS,
  Language,
} from '../types/brain';
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  RegionGeometryBundle,
  buildAllBrainGeometries,
  disposeBrainGeometries,
} from '../brain/brainGeometry';
import {
  createCorticalBumpTexture,
  createFoliaBumpTexture,
  detectSoftwareWebGL,
} from '../brain/brainMaterials';

const OUTER_CORTICAL_LOBES = new Set<BrainRegionId>([
  'frontal',
  'parietal',
  'temporal',
  'occipital',
]);

const EXPLODED_CAMERA_POSITION: [number, number, number] = [8.0, 2.0, 5.8];
const EXPLODED_CAMERA_TARGET: [number, number, number] = [0, -0.22, -0.05];

const _targetVec = new THREE.Vector3();
const _camGoal = new THREE.Vector3();
const _targetGoal = new THREE.Vector3();
const _projVec = new THREE.Vector3();

interface ProjectedLabelState {
  regionId: BrainRegionId;
  xPercent: number;
  yPercent: number;
  visible: boolean;
}

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envTarget = pmrem.fromScene(room, 0.04);
    scene.environment = envTarget.texture;
    room.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      envTarget.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      <color attach="background" args={['#0b1018']} />
      <fog attach="fog" args={['#0b1018', 11, 26]} />
      <hemisphereLight args={['#cbd5e1', '#0f172a', 0.34]} />
      <directionalLight
        position={[4.8, 5.8, 4.2]}
        intensity={1.24}
        color="#fff7ed"
      />
      <directionalLight
        position={[-4.5, 2.2, -4.0]}
        intensity={0.56}
        color="#bae6fd"
      />
      <directionalLight
        position={[0, -4.2, 2.5]}
        intensity={0.28}
        color="#94a3b8"
      />
    </>
  );
}

function GroundShadowDisc() {
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(2, 6, 14, 0.72)');
    grad.addColorStop(0.55, 'rgba(2, 6, 14, 0.28)');
    grad.addColorStop(1, 'rgba(2, 6, 14, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh position={[0, -1.55, -0.05]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <circleGeometry args={[2.55, 48]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </mesh>
  );
}

interface BrainAssemblyProps {
  regions: BrainRegion[];
  selectedId: BrainRegionId | null;
  hoveredId: BrainRegionId | null;
  onSelect: (id: BrainRegionId) => void;
  onHover: (id: BrainRegionId | null) => void;
  cortexOpacity: number;
  explodeAmount: number;
  isolated: boolean;
  focusRequestTick: number;
  resetCameraTick: number;
  isSoftwareGl: boolean;
  onLabelProjection: (state: ProjectedLabelState | null) => void;
  quizHideLabels: boolean;
  quizWrongId: BrainRegionId | null;
  quizCorrectId: BrainRegionId | null;
}

function BrainAssembly({
  regions,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  cortexOpacity,
  explodeAmount,
  isolated,
  focusRequestTick,
  resetCameraTick,
  isSoftwareGl,
  onLabelProjection,
  quizHideLabels,
  quizWrongId,
  quizCorrectId,
}: BrainAssemblyProps) {
  const { camera, gl, invalidate } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const wireRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const cameraAnimatingRef = useRef(false);
  const explodeAnimatingRef = useRef(false);
  const prevExplodeMajorRef = useRef<boolean>(explodeAmount >= 0.5);
  const lastProjRef = useRef<string>('');

  const bundles = useMemo<Record<BrainRegionId, RegionGeometryBundle>>(
    () => buildAllBrainGeometries(),
    [],
  );

  const corticalBump = useMemo(
    () => createCorticalBumpTexture(gl.capabilities.getMaxAnisotropy()),
    [gl],
  );
  const foliaBump = useMemo(
    () => createFoliaBumpTexture(gl.capabilities.getMaxAnisotropy()),
    [gl],
  );

  useEffect(() => {
    return () => {
      disposeBrainGeometries(bundles);
      corticalBump?.dispose();
      foliaBump?.dispose();
    };
  }, [bundles, corticalBump, foliaBump]);

  // Show anatomical leader line & projected label for hovered part, or selected part
  // Suppressed while an Anatomy Quiz question is actively waiting for an answer
  const activeLabelId = quizHideLabels ? null : hoveredId ?? selectedId;
  const activeLabelRegion = useMemo(
    () => (activeLabelId ? regions.find((r) => r.id === activeLabelId) ?? null : null),
    [activeLabelId, regions],
  );

  const leaderPoints = useMemo(() => {
    if (!activeLabelRegion) return null;
    const bundle = bundles[activeLabelRegion.id];
    const partOffset = bundle.parts[0]?.explodeOffset ?? [0, 0, 0];
    const start: [number, number, number] = [
      bundle.leaderStart[0] + partOffset[0] * explodeAmount,
      bundle.leaderStart[1] + partOffset[1] * explodeAmount,
      bundle.leaderStart[2] + partOffset[2] * explodeAmount,
    ];
    const end: [number, number, number] = [
      start[0] + bundle.leaderEndOffset[0] * (1 + explodeAmount * 0.2),
      start[1] + bundle.leaderEndOffset[1] * (1 + explodeAmount * 0.2),
      start[2] + bundle.leaderEndOffset[2] * (1 + explodeAmount * 0.2),
    ];
    return { start, end };
  }, [activeLabelRegion, bundles, explodeAmount]);

  const updateProjectedLabel = useCallback(() => {
    if (!activeLabelRegion || !leaderPoints) {
      if (lastProjRef.current !== 'null') {
        lastProjRef.current = 'null';
        onLabelProjection(null);
      }
      return;
    }

    _projVec.set(leaderPoints.end[0], leaderPoints.end[1], leaderPoints.end[2]);
    _projVec.project(camera);

    const visible = _projVec.z >= -1 && _projVec.z <= 1;
    const xPercent = THREE.MathUtils.clamp((_projVec.x * 0.5 + 0.5) * 100, 26, 74);
    const yPercent = THREE.MathUtils.clamp((-_projVec.y * 0.5 + 0.5) * 100, 16, 78);
    const sig = `${activeLabelRegion.id}:${xPercent.toFixed(1)}:${yPercent.toFixed(1)}:${visible}`;
    if (sig !== lastProjRef.current) {
      lastProjRef.current = sig;
      onLabelProjection({
        regionId: activeLabelRegion.id,
        xPercent,
        yPercent,
        visible,
      });
    }
  }, [activeLabelRegion, leaderPoints, camera, onLabelProjection]);

  // Trigger render whenever props affecting visuals change
  useEffect(() => {
    explodeAnimatingRef.current = true;
    invalidate();
    updateProjectedLabel();
  }, [
    explodeAmount,
    cortexOpacity,
    isolated,
    regions,
    selectedId,
    hoveredId,
    quizHideLabels,
    quizWrongId,
    quizCorrectId,
    invalidate,
    updateProjectedLabel,
  ]);

  // Automatically frame full brain when toggling between assembled and exploded 100%
  useEffect(() => {
    const isMajorExplode = explodeAmount >= 0.5;
    if (isMajorExplode === prevExplodeMajorRef.current) return;
    prevExplodeMajorRef.current = isMajorExplode;

    if (isMajorExplode) {
      _targetGoal.set(...EXPLODED_CAMERA_TARGET);
      _camGoal.set(...EXPLODED_CAMERA_POSITION);
    } else {
      _targetGoal.set(...DEFAULT_CAMERA_TARGET);
      _camGoal.set(...DEFAULT_CAMERA_POSITION);
    }

    if (isSoftwareGl) {
      camera.position.copy(_camGoal);
      if (controlsRef.current) {
        controlsRef.current.target.copy(_targetGoal);
        controlsRef.current.update();
      }
      cameraAnimatingRef.current = false;
      invalidate();
      updateProjectedLabel();
    } else {
      cameraAnimatingRef.current = true;
      invalidate();
    }
  }, [explodeAmount, camera, invalidate, isSoftwareGl, updateProjectedLabel]);

  const explodeAmountRef = useRef(explodeAmount);
  explodeAmountRef.current = explodeAmount;

  // Smoothly focus camera only when user explicitly selects or focuses a region
  useEffect(() => {
    if (focusRequestTick === 0 || !selectedId) return;
    const bundle = bundles[selectedId];
    if (!bundle) return;

    const currentExplode = explodeAmountRef.current;
    const firstPart = bundle.parts[0];
    const ox = firstPart ? firstPart.explodeOffset[0] * currentExplode : 0;
    const oy = firstPart ? firstPart.explodeOffset[1] * currentExplode : 0;
    const oz = firstPart ? firstPart.explodeOffset[2] * currentExplode : 0;

    const distScale = 1 + currentExplode * 0.45;
    _targetGoal.set(
      bundle.focusTarget[0] + ox * 0.85,
      bundle.focusTarget[1] + oy * 0.85,
      bundle.focusTarget[2] + oz * 0.85,
    );
    _camGoal.set(
      _targetGoal.x + bundle.focusCameraOffset[0] * distScale,
      _targetGoal.y + bundle.focusCameraOffset[1] * distScale,
      _targetGoal.z + bundle.focusCameraOffset[2] * distScale,
    );

    if (isSoftwareGl) {
      camera.position.copy(_camGoal);
      if (controlsRef.current) {
        controlsRef.current.target.copy(_targetGoal);
        controlsRef.current.update();
      }
      cameraAnimatingRef.current = false;
      invalidate();
      updateProjectedLabel();
    } else {
      cameraAnimatingRef.current = true;
      invalidate();
    }
  }, [
    selectedId,
    focusRequestTick,
    bundles,
    camera,
    invalidate,
    isSoftwareGl,
    updateProjectedLabel,
  ]);

  // Initialize target on mount and reset camera when requested
  useEffect(() => {
    if (controlsRef.current && resetCameraTick === 0) {
      controlsRef.current.target.set(...DEFAULT_CAMERA_TARGET);
      controlsRef.current.update();
      invalidate();
      updateProjectedLabel();
      return;
    }
    if (resetCameraTick === 0) return;

    if (explodeAmount >= 0.5) {
      _targetGoal.set(...EXPLODED_CAMERA_TARGET);
      _camGoal.set(...EXPLODED_CAMERA_POSITION);
    } else {
      _targetGoal.set(...DEFAULT_CAMERA_TARGET);
      _camGoal.set(...DEFAULT_CAMERA_POSITION);
    }

    if (isSoftwareGl) {
      camera.position.copy(_camGoal);
      if (controlsRef.current) {
        controlsRef.current.target.copy(_targetGoal);
        controlsRef.current.update();
      }
      cameraAnimatingRef.current = false;
      invalidate();
      updateProjectedLabel();
    } else {
      cameraAnimatingRef.current = true;
      invalidate();
    }
  }, [
    resetCameraTick,
    explodeAmount,
    camera,
    invalidate,
    isSoftwareGl,
    updateProjectedLabel,
  ]);

  useEffect(() => {
    document.body.style.cursor = hoveredId ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hoveredId]);

  // Exponential damping for continuous Exploded View slider & camera focus
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    let needsMoreFrames = false;

    if (explodeAnimatingRef.current) {
      let maxDiff = 0;
      for (const region of regions) {
        const bundle = bundles[region.id];
        for (const part of bundle.parts) {
          const tx = part.basePosition[0] + part.explodeOffset[0] * explodeAmount;
          const ty = part.basePosition[1] + part.explodeOffset[1] * explodeAmount;
          const tz = part.basePosition[2] + part.explodeOffset[2] * explodeAmount;
          _targetVec.set(tx, ty, tz);

          const mesh = meshRefs.current.get(part.key);
          if (mesh) {
            if (isSoftwareGl) {
              mesh.position.copy(_targetVec);
            } else {
              mesh.position.x = THREE.MathUtils.damp(mesh.position.x, _targetVec.x, 9, dt);
              mesh.position.y = THREE.MathUtils.damp(mesh.position.y, _targetVec.y, 9, dt);
              mesh.position.z = THREE.MathUtils.damp(mesh.position.z, _targetVec.z, 9, dt);
            }
            const diff = mesh.position.distanceTo(_targetVec);
            if (diff > maxDiff) maxDiff = diff;
          }

          const wireMesh = wireRefs.current.get(part.key);
          if (wireMesh && mesh) {
            wireMesh.position.copy(mesh.position);
          }
        }
      }
      if (maxDiff < 0.002) {
        explodeAnimatingRef.current = false;
      } else {
        needsMoreFrames = true;
      }
    }

    if (cameraAnimatingRef.current && controlsRef.current) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoal.x, 6.5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoal.y, 6.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoal.z, 6.5, dt);

      controlsRef.current.target.x = THREE.MathUtils.damp(
        controlsRef.current.target.x,
        _targetGoal.x,
        6.5,
        dt,
      );
      controlsRef.current.target.y = THREE.MathUtils.damp(
        controlsRef.current.target.y,
        _targetGoal.y,
        6.5,
        dt,
      );
      controlsRef.current.target.z = THREE.MathUtils.damp(
        controlsRef.current.target.z,
        _targetGoal.z,
        6.5,
        dt,
      );
      controlsRef.current.update();

      const camDiff = camera.position.distanceTo(_camGoal);
      const targetDiff = controlsRef.current.target.distanceTo(_targetGoal);
      if (camDiff < 0.01 && targetDiff < 0.01) {
        cameraAnimatingRef.current = false;
      } else {
        needsMoreFrames = true;
      }
    }

    updateProjectedLabel();

    if (needsMoreFrames) {
      invalidate();
    }
  });

  const isIsolationActive = isolated && selectedId !== null;

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping={!isSoftwareGl}
        dampingFactor={0.07}
        minDistance={1.9}
        maxDistance={12.0}
        enablePan={true}
        onStart={() => {
          cameraAnimatingRef.current = false;
        }}
        onChange={() => {
          updateProjectedLabel();
          invalidate();
        }}
      />

      <group name="human-brain-assembly">
        {regions.map((region) => {
          const bundle = bundles[region.id];
          const isOuterLobe = OUTER_CORTICAL_LOBES.has(region.id);
          const isVentricle = region.id === 'ventricles';
          const isCerebellum = region.id === 'cerebellum';
          const isSelected = selectedId === region.id;
          const isHovered = hoveredId === region.id;
          const isQuizWrong = quizWrongId === region.id;
          const isQuizCorrect = quizCorrectId === region.id;
          const isGhostedByIsolation = isIsolationActive && !isSelected;

          let effectiveOpacity = 1;
          if (isGhostedByIsolation) {
            effectiveOpacity = 0.09;
          } else if (isOuterLobe) {
            effectiveOpacity = cortexOpacity;
          } else if (isVentricle && !isSelected && !isHovered) {
            effectiveOpacity = 0.45;
          }

          const isTransparent = effectiveOpacity < 0.99;
          const shouldPassThroughToInternal =
            (isOuterLobe && cortexOpacity <= 0.55) || isGhostedByIsolation;

          const baseEmissive = isQuizWrong
            ? 0.34
            : isQuizCorrect
              ? 0.28
              : isSelected && isHovered
                ? 0.14
                : isSelected
                  ? 0.045
                  : isHovered
                    ? 0.12
                    : 0;
          const emissiveColor = isQuizWrong
            ? '#f43f5e'
            : isQuizCorrect
              ? '#34d399'
              : region.color;
          const emissiveIntensity = isGhostedByIsolation
            ? 0
            : isOuterLobe
              ? baseEmissive * Math.max(0.18, effectiveOpacity)
              : baseEmissive;

          const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
            if (isGhostedByIsolation) {
              const hitsSelected = e.intersections.some(
                (hit) => hit.object.userData.regionId === selectedId,
              );
              if (hitsSelected) return;
            } else if (
              shouldPassThroughToInternal &&
              e.intersections.some((hit) => hit.object.userData.isInternal)
            ) {
              return;
            }
            e.stopPropagation();
            onHover(region.id);
          };

          const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
            if (isGhostedByIsolation) {
              const hitsSelected = e.intersections.some(
                (hit) => hit.object.userData.regionId === selectedId,
              );
              if (hitsSelected) return;
            } else if (
              shouldPassThroughToInternal &&
              e.intersections.some((hit) => hit.object.userData.isInternal)
            ) {
              return;
            }
            e.stopPropagation();
            if (hoveredId !== region.id) {
              onHover(region.id);
            }
          };

          const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (hoveredId === region.id) {
              onHover(null);
            }
          };

          const handleClick = (e: ThreeEvent<MouseEvent>) => {
            if (isGhostedByIsolation) {
              const hitsSelected = e.intersections.some(
                (hit) => hit.object.userData.regionId === selectedId,
              );
              if (hitsSelected) return;
            } else if (
              shouldPassThroughToInternal &&
              e.intersections.some((hit) => hit.object.userData.isInternal)
            ) {
              return;
            }
            e.stopPropagation();
            onSelect(region.id);
          };

          return (
            <group key={region.id} name={`region-${region.id}`}>
              {bundle.parts.map((part) => (
                <React.Fragment key={part.key}>
                  <mesh
                    ref={(node) => {
                      if (node) meshRefs.current.set(part.key, node);
                      else meshRefs.current.delete(part.key);
                    }}
                    geometry={part.geometry}
                    position={[
                      part.basePosition[0] + part.explodeOffset[0] * explodeAmount,
                      part.basePosition[1] + part.explodeOffset[1] * explodeAmount,
                      part.basePosition[2] + part.explodeOffset[2] * explodeAmount,
                    ]}
                    renderOrder={isTransparent ? 2 : 0}
                    userData={{
                      regionId: region.id,
                      isInternal: region.isInternal,
                    }}
                    onPointerOver={handlePointerOver}
                    onPointerMove={handlePointerMove}
                    onPointerOut={handlePointerOut}
                    onClick={handleClick}
                  >
                    <meshStandardMaterial
                      key={`${part.key}-${isTransparent ? 'trans' : 'opaque'}`}
                      color={region.color}
                      vertexColors={isOuterLobe || isCerebellum}
                      roughness={
                        isVentricle
                          ? 0.16
                          : region.isInternal
                            ? 0.36
                            : isOuterLobe
                              ? 0.48
                              : isCerebellum
                                ? 0.46
                                : 0.48
                      }
                      metalness={isVentricle ? 0.08 : 0.03}
                      bumpMap={
                        isOuterLobe ? corticalBump : isCerebellum ? foliaBump : null
                      }
                      bumpScale={isOuterLobe ? 0.044 : isCerebellum ? 0.032 : 0}
                      emissive={emissiveColor}
                      emissiveIntensity={emissiveIntensity}
                      transparent={isTransparent}
                      opacity={effectiveOpacity}
                      depthWrite={!isTransparent}
                      envMapIntensity={0.52}
                    />
                  </mesh>

                  {isGhostedByIsolation && (
                    <mesh
                      ref={(node) => {
                        if (node) wireRefs.current.set(part.key, node);
                        else wireRefs.current.delete(part.key);
                      }}
                      geometry={part.geometry}
                      position={[
                        part.basePosition[0] + part.explodeOffset[0] * explodeAmount,
                        part.basePosition[1] + part.explodeOffset[1] * explodeAmount,
                        part.basePosition[2] + part.explodeOffset[2] * explodeAmount,
                      ]}
                      renderOrder={3}
                    >
                      <meshBasicMaterial
                        color={region.color}
                        wireframe
                        transparent
                        opacity={0.14}
                        depthWrite={false}
                      />
                    </mesh>
                  )}
                </React.Fragment>
              ))}
            </group>
          );
        })}

        {/* Anatomical 3D Leader Line Anchor & Pointer Segment */}
        {activeLabelRegion && leaderPoints && (
          <group name="anatomical-leader-line">
            <Line
              points={[leaderPoints.start, leaderPoints.end]}
              color={activeLabelRegion.color}
              lineWidth={1.6}
              transparent
              opacity={0.9}
            />
            <mesh position={leaderPoints.start}>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshBasicMaterial color={activeLabelRegion.color} />
            </mesh>
          </group>
        )}
      </group>

      <GroundShadowDisc />
    </>
  );
}

export interface BrainSceneProps {
  regions: BrainRegion[];
  language: Language;
  selectedId: BrainRegionId | null;
  onSelectRegion: (id: BrainRegionId) => void;
  cortexOpacity: number;
  explodeAmount: number;
  isolated: boolean;
  focusRequestTick: number;
  resetCameraTick: number;
  quizMode?: boolean;
  quizHideLabels?: boolean;
  quizWrongId?: BrainRegionId | null;
  quizCorrectId?: BrainRegionId | null;
}

export const BrainScene: React.FC<BrainSceneProps> = ({
  regions,
  language,
  selectedId,
  onSelectRegion,
  cortexOpacity,
  explodeAmount,
  isolated,
  focusRequestTick,
  resetCameraTick,
  quizMode = false,
  quizHideLabels = false,
  quizWrongId = null,
  quizCorrectId = null,
}) => {
  const [hoveredId, setHoveredId] = useState<BrainRegionId | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [labelProj, setLabelProj] = useState<ProjectedLabelState | null>(null);
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);

  const labelRegion = useMemo(
    () =>
      !quizHideLabels && labelProj?.visible
        ? regions.find((r) => r.id === labelProj.regionId) ?? null
        : null,
    [quizHideLabels, labelProj, regions],
  );

  return (
    <div
      data-testid="brain-canvas-container"
      data-selected-id={selectedId ?? ''}
      data-hovered-id={hoveredId ?? ''}
      data-explode={explodeAmount.toFixed(2)}
      data-isolated={String(isolated)}
      data-opacity={cortexOpacity.toFixed(2)}
      data-language={language}
      data-quiz-mode={String(quizMode)}
      className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,_#162033_0%,_#0b1018_72%)]"
    >
      {contextLost ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-medium text-slate-200">
            {language === 'fa'
              ? 'زمینه گرافیکی WebGL موقتاً قطع شد.'
              : 'WebGL graphics context was interrupted.'}
          </p>
          <button
            type="button"
            onClick={() => setContextLost(false)}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-200 hover:bg-cyan-500/25"
          >
            {language === 'fa' ? 'تلاش مجدد' : 'Reload 3D Viewport'}
          </button>
        </div>
      ) : (
        <>
          <Canvas
            frameloop="demand"
            dpr={isSoftwareGl ? 1 : [1, 2]}
            camera={{
              position: DEFAULT_CAMERA_POSITION,
              fov: 38,
              near: 0.1,
              far: 50,
            }}
            gl={{
              antialias: !isSoftwareGl,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.0,
            }}
            onCreated={({ gl }) => {
              const canvas = gl.domElement;
              const onLost = (e: Event) => {
                e.preventDefault();
                setContextLost(true);
              };
              const onRestored = () => {
                setContextLost(false);
              };
              canvas.addEventListener('webglcontextlost', onLost, false);
              canvas.addEventListener('webglcontextrestored', onRestored, false);
            }}
            onPointerMissed={() => setHoveredId(null)}
          >
            <StudioEnvironment />
            <BrainAssembly
              regions={regions}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={onSelectRegion}
              onHover={setHoveredId}
              cortexOpacity={cortexOpacity}
              explodeAmount={explodeAmount}
              isolated={isolated}
              focusRequestTick={focusRequestTick}
              resetCameraTick={resetCameraTick}
              isSoftwareGl={isSoftwareGl}
              onLabelProjection={setLabelProj}
              quizHideLabels={quizHideLabels}
              quizWrongId={quizWrongId}
              quizCorrectId={quizCorrectId}
            />
          </Canvas>

          {/* Projected 3D Anatomical Floating Label Overlay (React 19 safe, zero portal unmount errors) */}
          {labelRegion && labelProj && (
            <div
              dir={language === 'fa' ? 'rtl' : 'ltr'}
              style={{
                left: `${labelProj.xPercent}%`,
                top: `${labelProj.yPercent}%`,
              }}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap rounded-lg border border-slate-700/90 bg-slate-950/95 px-2.5 py-1.5 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: labelRegion.color }}
                />
                <span className="text-xs font-semibold text-slate-100">
                  {language === 'fa' ? labelRegion.title_fa : labelRegion.title_en}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="font-latin" dir="ltr">
                  {labelRegion.latinName}
                </span>
                <span aria-hidden="true">·</span>
                <span>{CATEGORY_LABELS[labelRegion.category][language]}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
