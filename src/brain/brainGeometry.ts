import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BrainRegionId } from '../types/brain';
import { corticalSulciSample } from './noise3d';

export interface SubMeshSpec {
  key: string;
  geometry: THREE.BufferGeometry;
  basePosition: [number, number, number];
  explodeOffset: [number, number, number];
}

export interface RegionGeometryBundle {
  id: BrainRegionId;
  parts: SubMeshSpec[];
  /** Point on/near the region surface where the 3D leader line starts */
  leaderStart: [number, number, number];
  /** Offset outward from leaderStart where the floating 3D label sits */
  leaderEndOffset: [number, number, number];
  focusTarget: [number, number, number];
  focusCameraOffset: [number, number, number];
}

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [4.75, 1.08, 3.35];
export const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, -0.14, -0.04];

interface PerimeterKnot {
  z: number;
  y: number;
  isSeam: boolean;
}

interface SampledPerimeter {
  z: number;
  y: number;
  isSeam: boolean;
}

/**
 * Computes a smooth periodic ray-lookup around a star-shaped 2D lobe polygon in (z, y)
 * from its interior centroid (cz, cy), preserving seam vs. outer-silhouette flags.
 */
function createLobePerimeterSampler(
  cz: number,
  cy: number,
  knots: PerimeterKnot[],
  samplesPerSegment = 14,
): (theta: number) => SampledPerimeter {
  // Build dense spline-interpolated loop with seam flags
  const points: THREE.Vector2[] = [];
  const seamFlags: boolean[] = [];

  for (let i = 0; i < knots.length; i++) {
    const p0 = knots[(i - 1 + knots.length) % knots.length];
    const p1 = knots[i];
    const p2 = knots[(i + 1) % knots.length];
    const p3 = knots[(i + 2) % knots.length];
    const segIsSeam = p1.isSeam && p2.isSeam;

    for (let s = 0; s < samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      // Catmull-Rom interpolation in (z, y)
      const z =
        0.5 *
        (2 * p1.z +
          (-p0.z + p2.z) * t +
          (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
          (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3);
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
      points.push(new THREE.Vector2(z, y));
      seamFlags.push(segIsSeam);
    }
  }

  // Convert loop points to sorted polar angles around (cz, cy)
  const polar = points.map((pt, idx) => {
    const dz = pt.x - cz;
    const dy = pt.y - cy;
    let angle = Math.atan2(dy, dz);
    if (angle < 0) angle += Math.PI * 2;
    return { angle, z: pt.x, y: pt.y, isSeam: seamFlags[idx] };
  });
  polar.sort((a, b) => a.angle - b.angle);

  return (rawTheta: number): SampledPerimeter => {
    let theta = rawTheta;
    if (theta < 0) theta += Math.PI * 2;
    if (theta >= Math.PI * 2) theta -= Math.PI * 2;

    // Binary search surrounding angle entries
    let lo = 0;
    let hi = polar.length - 1;
    if (theta <= polar[0].angle || theta >= polar[hi].angle) {
      const a = polar[hi];
      const b = polar[0];
      const span = b.angle + Math.PI * 2 - a.angle;
      const t = span > 1e-6 ? ((theta >= a.angle ? theta - a.angle : theta + Math.PI * 2 - a.angle) / span) : 0;
      return {
        z: THREE.MathUtils.lerp(a.z, b.z, t),
        y: THREE.MathUtils.lerp(a.y, b.y, t),
        isSeam: a.isSeam || b.isSeam,
      };
    }

    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (polar[mid].angle <= theta) lo = mid;
      else hi = mid;
    }
    const a = polar[lo];
    const b = polar[hi];
    const span = b.angle - a.angle;
    const t = span > 1e-6 ? (theta - a.angle) / span : 0;
    return {
      z: THREE.MathUtils.lerp(a.z, b.z, t),
      y: THREE.MathUtils.lerp(a.y, b.y, t),
      isSeam: a.isSeam || b.isSeam,
    };
  };
}

/**
 * Shared lateral outer envelope width X(z, y) for one cerebral hemisphere.
 * Gives the iconic wider parieto-temporal waist, tapered frontal pole, and tapered occipital pole.
 */
function cerebralOuterWidth(z: number, y: number): number {
  const nz = (z + 0.04) / 1.32;
  const ny = (y - 0.34) / 0.80;
  // Slight posterior-inferior broadening at parieto-temporal junction
  const apWidth = 1.0 - 0.16 * Math.max(0, nz) - 0.10 * Math.max(0, -nz);
  const r2 = nz * nz * 0.86 + ny * ny * 0.88;
  const dome = Math.sqrt(Math.max(0.02, 1.0 - Math.min(0.96, r2 * 0.74)));
  return Math.max(0.14, 0.98 * apWidth * dome);
}

/**
 * Shared medial sagittal surface X(z, y) facing the longitudinal fissure,
 * with a subtle central concavity cradling the Corpus Callosum & Thalamus.
 */
function cerebralMedialWall(z: number, y: number): number {
  const dz = (z + 0.02) / 0.56;
  const dy = (y - 0.14) / 0.44;
  const d2 = dz * dz + dy * dy;
  const recess = d2 < 1 ? 0.11 * Math.pow(1 - d2, 1.3) : 0;
  return 0.032 + recess;
}

interface LobeSpec {
  cz: number;
  cy: number;
  knots: PerimeterKnot[];
  innerWidth?: (z: number, y: number) => number;
  outerWidth?: (z: number, y: number) => number;
  foldAmplitude?: number;
  detail?: number;
}

/**
 * Builds one watertight cerebral lobe mesh mapped onto the unified C-shaped hemisphere,
 * complete with recessed lobe seam bevels, smooth 3D gyri/sulci folding, and vertex AO shading.
 */
function buildPartitionedCorticalLobe(side: 1 | -1, spec: LobeSpec): THREE.BufferGeometry {
  const detail = spec.detail ?? 5;
  const foldAmp = spec.foldAmplitude ?? 0.088;
  const sampleEdge = createLobePerimeterSampler(spec.cz, spec.cy, spec.knots);

  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i);
    const sz = pos.getZ(i);

    const rDisk = Math.min(1, Math.hypot(sy, sz));
    const theta = Math.atan2(sy, sz);
    const edge = sampleEdge(theta);

    let z = THREE.MathUtils.lerp(spec.cz, edge.z, rDisk);
    let y = THREE.MathUtils.lerp(spec.cy, edge.y, rDisk);

    const xInner = spec.innerWidth ? spec.innerWidth(z, y) : cerebralMedialWall(z, y);
    const xOuterRaw = spec.outerWidth ? spec.outerWidth(z, y) : cerebralOuterWidth(z, y);
    const xOuter = Math.max(xInner + 0.06, xOuterRaw);

    let x: number;
    let aoShade = 1.0;

    if (sx >= 0) {
      // Lateral cortical dome: smooth curve down to xInner along lobe boundary seams
      const dome = Math.pow(sx, 0.28);
      // Slight rounded sulcal rim tuck along internal lobe seams
      const seamGroove = edge.isSeam
        ? 0.032 * (1.0 - THREE.MathUtils.smoothstep(sx, 0.04, 0.34))
        : 0;
      x = THREE.MathUtils.lerp(xInner, xOuter, dome) - seamGroove;

      // World-space cortical gyri/sulci sampling so folds look continuous & winding
      const sample = corticalSulciSample(x * side * 1.15, y * 1.15, z * 1.15);
      // Damp displacement gently near sharp lobe seam edges so boundaries stay crisp
      const seamDamp = edge.isSeam
        ? THREE.MathUtils.smoothstep(sx, 0.05, 0.26)
        : THREE.MathUtils.smoothstep(sx, 0.02, 0.16);
      const disp = sample.height * foldAmp * seamDamp;

      // Displace primarily outward along cortical surface direction
      const nx = 0.68 + 0.32 * sx;
      const ny = (y - spec.cy) * 0.42;
      const nz = (z - spec.cz) * 0.42;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      x += (nx / nLen) * disp;
      y += (ny / nLen) * disp * 0.85;
      z += (nz / nLen) * disp * 0.85;

      const seamAO = edge.isSeam
        ? 0.56 + 0.44 * THREE.MathUtils.smoothstep(sx, 0.02, 0.28)
        : 0.78 + 0.22 * THREE.MathUtils.smoothstep(sx, 0.0, 0.18);
      aoShade = THREE.MathUtils.lerp(1.0, sample.ao, seamDamp) * seamAO;
    } else {
      // Medial cortical wall facing the longitudinal fissure (visible in sagittal/X-Ray view)
      const medialDamp = THREE.MathUtils.smoothstep(-sx, 0.10, 0.35);
      const sample = corticalSulciSample(xInner * side * 1.2, y * 1.25, z * 1.25);
      x = xInner + sample.height * 0.015 * medialDamp;
      aoShade = THREE.MathUtils.lerp(0.86, 0.68 + 0.32 * sample.ao, medialDamp);
    }

    pos.setXYZ(i, x * side, y, z);
    colors[i * 3] = aoShade;
    colors[i * 3 + 1] = aoShade;
    colors[i * 3 + 2] = aoShade;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  if (side === -1) {
    const count = pos.count;
    for (let i = 0; i < count; i += 3) {
      const x1 = pos.getX(i + 1);
      const y1 = pos.getY(i + 1);
      const z1 = pos.getZ(i + 1);
      pos.setXYZ(i + 1, pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2));
      pos.setXYZ(i + 2, x1, y1, z1);

      for (let c = 0; c < 3; c++) {
        const tmp = colors[(i + 1) * 3 + c];
        colors[(i + 1) * 3 + c] = colors[(i + 2) * 3 + c];
        colors[(i + 2) * 3 + c] = tmp;
      }
    }
  }

  pos.needsUpdate = true;
  (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;

  const smooth = mergeVertices(geo, 1e-4);
  geo.dispose();
  smooth.computeVertexNormals();
  smooth.computeBoundingBox();
  smooth.computeBoundingSphere();
  return smooth;
}

// Shared anatomical seam knots in sagittal (z, y) plane matching Reference Image 1
const P_CENTRAL_TOP: PerimeterKnot = { z: 0.02, y: 1.09, isSeam: true };
const P_CENTRAL_MID: PerimeterKnot = { z: 0.11, y: 0.56, isSeam: true };
const P_CENTRAL_SYLV: PerimeterKnot = { z: 0.18, y: 0.04, isSeam: true };

const P_SYLV_ANT: PerimeterKnot = { z: 0.44, y: -0.10, isSeam: true };
const P_SYLV_POST: PerimeterKnot = { z: -0.60, y: 0.25, isSeam: true };

const P_OCC_TOP: PerimeterKnot = { z: -0.82, y: 0.85, isSeam: true };
const P_OCC_BOT: PerimeterKnot = { z: -0.57, y: -0.25, isSeam: true };

function createFrontalHemisphere(side: 1 | -1): THREE.BufferGeometry {
  return buildPartitionedCorticalLobe(side, {
    cz: 0.62,
    cy: 0.38,
    knots: [
      P_CENTRAL_TOP,
      { z: 0.46, y: 1.01, isSeam: false },
      { z: 0.90, y: 0.78, isSeam: false },
      { z: 1.20, y: 0.44, isSeam: false },
      { z: 1.28, y: 0.06, isSeam: false },
      { z: 1.12, y: -0.11, isSeam: false },
      { z: 0.78, y: -0.14, isSeam: false },
      P_SYLV_ANT,
      P_CENTRAL_SYLV,
      P_CENTRAL_MID,
    ],
    foldAmplitude: 0.115,
  });
}

function createParietalHemisphere(side: 1 | -1): THREE.BufferGeometry {
  return buildPartitionedCorticalLobe(side, {
    cz: -0.32,
    cy: 0.58,
    knots: [
      P_OCC_TOP,
      { z: -0.54, y: 1.02, isSeam: false },
      { z: -0.24, y: 1.10, isSeam: false },
      P_CENTRAL_TOP,
      P_CENTRAL_MID,
      P_CENTRAL_SYLV,
      { z: -0.22, y: 0.15, isSeam: true },
      P_SYLV_POST,
    ],
    foldAmplitude: 0.112,
  });
}

function createTemporalHemisphere(side: 1 | -1): THREE.BufferGeometry {
  return buildPartitionedCorticalLobe(side, {
    cz: -0.06,
    cy: -0.10,
    knots: [
      P_SYLV_ANT,
      P_CENTRAL_SYLV,
      { z: -0.22, y: 0.15, isSeam: true },
      P_SYLV_POST,
      P_OCC_BOT,
      { z: -0.20, y: -0.34, isSeam: false },
      { z: 0.18, y: -0.36, isSeam: false },
      { z: 0.44, y: -0.24, isSeam: false },
    ],
    innerWidth: (z, y) => {
      // Hollow medially so Hippocampus, Amygdala, and Putamen nest cleanly inside
      const dy = (y + 0.10) / 0.30;
      const dz = (z + 0.05) / 0.54;
      const r2 = Math.min(1, dz * dz * 0.65 + dy * dy * 0.65);
      return 0.38 - 0.12 * r2;
    },
    outerWidth: (z, y) => {
      // Prominent plump lateral temporal convexity
      const base = cerebralOuterWidth(z, y);
      const dz = (z + 0.06) / 0.52;
      const dy = (y + 0.12) / 0.28;
      const bulge = 0.88 * Math.sqrt(Math.max(0.08, 1 - Math.min(0.92, dz * dz * 0.72 + dy * dy * 0.72)));
      return Math.max(base, bulge);
    },
    foldAmplitude: 0.092,
  });
}

function createOccipitalHemisphere(side: 1 | -1): THREE.BufferGeometry {
  return buildPartitionedCorticalLobe(side, {
    cz: -0.92,
    cy: 0.22,
    knots: [
      P_OCC_TOP,
      P_SYLV_POST,
      P_OCC_BOT,
      { z: -0.96, y: -0.17, isSeam: false },
      { z: -1.24, y: -0.06, isSeam: false },
      { z: -1.32, y: 0.15, isSeam: false },
      { z: -1.18, y: 0.54, isSeam: false },
    ],
    outerWidth: (z, y) => {
      const base = cerebralOuterWidth(z, y);
      const dz = (z + 0.92) / 0.44;
      const dy = (y - 0.22) / 0.56;
      const occ = 0.76 * Math.sqrt(Math.max(0.06, 1 - Math.min(0.94, dz * dz * 0.76 + dy * dy * 0.76)));
      return Math.max(base, occ);
    },
    foldAmplitude: 0.098,
  });
}

/**
 * Extrudes a smooth circular cross-section along a 3D CatmullRomCurve3 with
 * variable anatomical radius r(t) along t in [0, 1] and smooth spherical end caps.
 */
function createTaperedTube(
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radialSegments: number,
  radiusAt: (t: number) => number,
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const p = new THREE.Vector3();
  const v = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    curve.getPointAt(t, p);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radiusAt(t);

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(theta);
      const cos = -Math.cos(theta);

      v.x = p.x + r * (cos * N.x + sin * B.x);
      v.y = p.y + r * (cos * N.y + sin * B.y);
      v.z = p.z + r * (cos * N.z + sin * B.z);

      positions.push(v.x, v.y, v.z);
      uvs.push(t, j / radialSegments);
    }
  }

  const stride = radialSegments + 1;
  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  // End caps (start & end center vertices)
  const startCenterIdx = positions.length / 3;
  const pStart = curve.getPointAt(0);
  positions.push(pStart.x, pStart.y, pStart.z);
  uvs.push(0, 0.5);
  for (let j = 0; j < radialSegments; j++) {
    indices.push(startCenterIdx, j + 1, j);
  }

  const endCenterIdx = positions.length / 3;
  const pEnd = curve.getPointAt(1);
  positions.push(pEnd.x, pEnd.y, pEnd.z);
  uvs.push(1, 0.5);
  const lastRow = tubularSegments * stride;
  for (let j = 0; j < radialSegments; j++) {
    indices.push(endCenterIdx, lastRow + j, lastRow + j + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);

  const nonIndexed = geo.toNonIndexed();
  geo.dispose();
  const smooth = mergeVertices(nonIndexed, 1e-4);
  nonIndexed.dispose();
  smooth.computeVertexNormals();
  smooth.computeBoundingBox();
  smooth.computeBoundingSphere();
  return smooth;
}

function createCerebellumGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  for (const side of [-1, 1] as const) {
    const hemi = new THREE.IcosahedronGeometry(1, 4);
    const pos = hemi.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const sx = pos.getX(i);
      const sy = pos.getY(i);
      const sz = pos.getZ(i);

      // Horizontal curved cerebellar folia ridges & grooves
      const phase = (sy + 0.14 * sz) * 42.0;
      const foliaWave = Math.sin(phase);
      const groove = THREE.MathUtils.smoothstep(Math.abs(foliaWave), 0.0, 0.45);
      const foliaDisp = (groove - 0.55) * 0.022;

      // Anterior cerebellar notch facing the pons/4th ventricle
      const antFlat = sz > 0.25 ? 1.0 - 0.18 * (sz - 0.25) : 1.0;
      const x = side * 0.28 + sx * (0.34 + foliaDisp * 0.5) * antFlat;
      const y = -0.46 + sy * (0.24 + foliaDisp * 0.4);
      const z = -0.78 + sz * (0.33 + foliaDisp) * antFlat;

      pos.setXYZ(i, x, y, z);
      const shade = 0.54 + 0.46 * groove;
      colors[i * 3] = shade;
      colors[i * 3 + 1] = shade;
      colors[i * 3 + 2] = shade;
    }
    pos.needsUpdate = true;
    hemi.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    parts.push(hemi);
  }

  const vermis = new THREE.IcosahedronGeometry(1, 3);
  const vPos = vermis.attributes.position;
  const vColors = new Float32Array(vPos.count * 3);
  for (let i = 0; i < vPos.count; i++) {
    const sx = vPos.getX(i);
    const sy = vPos.getY(i);
    const sz = vPos.getZ(i);
    const foliaWave = Math.sin(sy * 42.0);
    const groove = THREE.MathUtils.smoothstep(Math.abs(foliaWave), 0.0, 0.45);
    const foliaDisp = (groove - 0.55) * 0.018;
    vPos.setXYZ(i, sx * 0.14, -0.45 + sy * 0.22, -0.76 + sz * (0.28 + foliaDisp));
    const shade = 0.58 + 0.42 * groove;
    vColors[i * 3] = shade;
    vColors[i * 3 + 1] = shade;
    vColors[i * 3 + 2] = shade;
  }
  vPos.needsUpdate = true;
  vermis.setAttribute('color', new THREE.BufferAttribute(vColors, 3));
  parts.push(vermis);

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const merged = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function createBrainstemSegment(
  profile: THREE.Vector2[],
  zCenterAtY: (y: number, z: number) => number,
  xScaleAtY: (y: number) => number,
): THREE.BufferGeometry {
  const geo = new THREE.LatheGeometry(profile, 32);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    pos.setXYZ(i, x * xScaleAtY(y), y, zCenterAtY(y, z));
  }
  pos.needsUpdate = true;
  const smooth = mergeVertices(geo, 1e-4);
  geo.dispose();
  smooth.computeVertexNormals();
  smooth.computeBoundingBox();
  smooth.computeBoundingSphere();
  return smooth;
}

function createMidbrainGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const body = createBrainstemSegment(
    [
      new THREE.Vector2(0.0, -0.26),
      new THREE.Vector2(0.155, -0.25),
      new THREE.Vector2(0.165, -0.14),
      new THREE.Vector2(0.185, -0.04),
      new THREE.Vector2(0.0, -0.02),
    ],
    (_y, z) => z * 0.92 - 0.14,
    () => 1.05,
  );
  parts.push(body.toNonIndexed());
  body.dispose();

  for (const side of [-1, 1] as const) {
    for (const [cy, cz] of [
      [-0.09, -0.29],
      [-0.18, -0.29],
    ] as const) {
      const col = new THREE.IcosahedronGeometry(0.044, 2);
      col.translate(side * 0.055, cy, cz);
      parts.push(col);
    }
  }

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const merged = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function createPonsGeometry(): THREE.BufferGeometry {
  return createBrainstemSegment(
    [
      new THREE.Vector2(0.0, -0.58),
      new THREE.Vector2(0.155, -0.57),
      new THREE.Vector2(0.23, -0.47),
      new THREE.Vector2(0.245, -0.39),
      new THREE.Vector2(0.20, -0.30),
      new THREE.Vector2(0.155, -0.25),
      new THREE.Vector2(0.0, -0.24),
    ],
    (y, z) => {
      const ponsBulge = Math.exp(-Math.pow((y + 0.41) / 0.13, 2));
      return z * 0.95 - 0.16 + (z > 0 ? ponsBulge * 0.10 : 0);
    },
    (y) => 1.04 + 0.09 * Math.exp(-Math.pow((y + 0.41) / 0.13, 2)),
  );
}

function createMedullaGeometry(): THREE.BufferGeometry {
  return createBrainstemSegment(
    [
      new THREE.Vector2(0.0, -1.24),
      new THREE.Vector2(0.092, -1.22),
      new THREE.Vector2(0.108, -0.98),
      new THREE.Vector2(0.125, -0.76),
      new THREE.Vector2(0.145, -0.62),
      new THREE.Vector2(0.155, -0.57),
      new THREE.Vector2(0.0, -0.56),
    ],
    (y, z) => {
      const tDown = THREE.MathUtils.clamp((-0.56 - y) / 0.68, 0, 1);
      return z * 0.92 - 0.18 - tDown * 0.11;
    },
    (y) => {
      const tDown = THREE.MathUtils.clamp((-0.56 - y) / 0.68, 0, 1);
      return 1.02 - tDown * 0.10;
    },
  );
}

/**
 * C-shaped Corpus Callosum (rostrum -> bulbous genu -> arching body -> thick splenium)
 * built along a smooth sagittal spline & curved lateral wings matching Reference Image 3.
 */
function createCorpusCallosumGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  // Rostrum -> Genu -> Body -> Splenium -> inner arch
  shape.moveTo(0.26, 0.07);
  shape.bezierCurveTo(0.49, 0.10, 0.52, 0.34, 0.28, 0.43);
  shape.bezierCurveTo(0.04, 0.51, -0.25, 0.47, -0.44, 0.32);
  shape.bezierCurveTo(-0.55, 0.23, -0.52, 0.08, -0.37, 0.09);
  shape.bezierCurveTo(-0.29, 0.10, -0.26, 0.22, -0.14, 0.28);
  shape.bezierCurveTo(0.02, 0.36, 0.20, 0.33, 0.30, 0.23);
  shape.bezierCurveTo(0.36, 0.16, 0.22, 0.07, 0.26, 0.07);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.30,
    bevelEnabled: true,
    bevelThickness: 0.042,
    bevelSize: 0.036,
    bevelSegments: 5,
    curveSegments: 32,
  });

  geo.translate(0, 0, -0.15);
  geo.rotateY(Math.PI / 2);

  // Subtle upward-lateral forceps sweep on lateral edges
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const latFlare = Math.abs(x) * 0.18;
    pos.setXYZ(i, x * (1.0 + 0.16 * Math.abs(z)), y - latFlare * 0.22, z);
  }
  pos.needsUpdate = true;

  const smooth = mergeVertices(geo, 1e-4);
  geo.dispose();
  smooth.computeVertexNormals();
  smooth.computeBoundingBox();
  smooth.computeBoundingSphere();
  return smooth;
}

/**
 * Paired C-shaped Lateral Ventricles (anterior horn -> body -> atrium -> occipital spur & inferior horn)
 * plus central Third Ventricle built with tapered CatmullRomCurve3 splines.
 */
function createVentriclesGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  for (const side of [-1, 1] as const) {
    const latCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.07, 0.17, 0.36), // Frontal horn tip
      new THREE.Vector3(side * 0.08, 0.26, 0.16), // Anterior body
      new THREE.Vector3(side * 0.12, 0.25, -0.12), // Posterior body
      new THREE.Vector3(side * 0.21, 0.13, -0.34), // Trigone / atrium
      new THREE.Vector3(side * 0.31, -0.05, -0.24), // Descending horn
      new THREE.Vector3(side * 0.31, -0.16, 0.08), // Inferior temporal horn
    ]);
    parts.push(
      createTaperedTube(latCurve, 40, 14, (t) => {
        if (t < 0.12) return THREE.MathUtils.lerp(0.022, 0.048, t / 0.12);
        if (t < 0.65) return 0.046 + 0.012 * Math.sin(((t - 0.12) / 0.53) * Math.PI);
        return THREE.MathUtils.lerp(0.046, 0.020, (t - 0.65) / 0.35);
      }).toNonIndexed(),
    );

    const occCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.21, 0.13, -0.34),
      new THREE.Vector3(side * 0.18, 0.09, -0.54),
    ]);
    parts.push(
      createTaperedTube(occCurve, 14, 10, (t) =>
        THREE.MathUtils.lerp(0.036, 0.012, t),
      ).toNonIndexed(),
    );
  }

  // Central slit-like Third Ventricle between the two thalami
  const thirdVentricle = new THREE.IcosahedronGeometry(0.11, 2);
  thirdVentricle.scale(0.28, 1.05, 1.25);
  thirdVentricle.translate(0, 0.02, -0.02);
  parts.push(thirdVentricle);

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const merged = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function createThalamusHalf(side: 1 | -1): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const geo = new THREE.IcosahedronGeometry(1, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i);
    const sz = pos.getZ(i);
    const antTaper = 1 - 0.16 * sz;
    const x = side * 0.14 + sx * 0.112 * antTaper;
    const y = 0.045 + sy * 0.125;
    const z = -0.06 + sz * 0.215;
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  parts.push(geo);

  // Subtle medial interthalamic adhesion bump (visible in Reference Image 3!)
  const adhesion = new THREE.IcosahedronGeometry(0.042, 2);
  adhesion.scale(0.7, 0.9, 1.05);
  adhesion.translate(side * 0.038, 0.055, -0.02);
  parts.push(adhesion);

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const smooth = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  smooth.computeVertexNormals();
  smooth.computeBoundingBox();
  smooth.computeBoundingSphere();
  return smooth;
}

function createHypothalamusGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const side of [-1, 1] as const) {
    const cone = new THREE.IcosahedronGeometry(1, 2);
    const pos = cone.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const sx = pos.getX(i);
      const sy = pos.getY(i);
      const sz = pos.getZ(i);
      const funnel = 0.70 + 0.30 * sy;
      pos.setXYZ(
        i,
        side * 0.052 + sx * 0.060 * funnel,
        -0.095 + sy * 0.075,
        0.145 + sz * 0.095 * funnel,
      );
    }
    pos.needsUpdate = true;
    parts.push(cone);
  }

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const merged = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function createPituitaryGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const stalkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.15, 0.16),
    new THREE.Vector3(0, -0.24, 0.19),
    new THREE.Vector3(0, -0.32, 0.21),
  ]);
  parts.push(
    createTaperedTube(stalkCurve, 16, 10, (t) =>
      THREE.MathUtils.lerp(0.026, 0.018, t),
    ).toNonIndexed(),
  );

  const antLobe = new THREE.IcosahedronGeometry(0.068, 2);
  antLobe.scale(1.15, 0.88, 0.95);
  antLobe.translate(0, -0.35, 0.22);
  parts.push(antLobe);

  const postLobe = new THREE.IcosahedronGeometry(0.048, 2);
  postLobe.translate(0, -0.34, 0.17);
  parts.push(postLobe);

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const merged = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function createPinealGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i);
    const sz = pos.getZ(i);
    const taper = 1 - 0.25 * Math.max(0, -sz);
    pos.setXYZ(i, sx * 0.048 * taper, 0.02 + sy * 0.045 * taper, -0.31 + sz * 0.072);
  }
  pos.needsUpdate = true;
  const smooth = mergeVertices(geo, 1e-4);
  geo.dispose();
  smooth.computeVertexNormals();
  smooth.computeBoundingBox();
  smooth.computeBoundingSphere();
  return smooth;
}

/**
 * Striatum / Basal Ganglia: Lentiform Nucleus (Putamen + Globus Pallidus) plus a
 * sweeping C-shaped Caudate Nucleus spline (thick head tapering into arching tail).
 */
function createBasalGangliaHalf(side: 1 | -1): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const putamen = new THREE.IcosahedronGeometry(1, 3);
  const pPos = putamen.attributes.position;
  for (let i = 0; i < pPos.count; i++) {
    const sx = pPos.getX(i);
    const sy = pPos.getY(i);
    const sz = pPos.getZ(i);
    pPos.setXYZ(
      i,
      side * 0.30 + sx * 0.072,
      0.03 + sy * 0.125,
      0.06 + sz * 0.195,
    );
  }
  pPos.needsUpdate = true;
  parts.push(putamen);

  // Tapered C-shaped Caudate Nucleus wrapping around the Thalamus
  const caudateCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.17, 0.14, 0.30), // Bulbous head
    new THREE.Vector3(side * 0.18, 0.24, 0.10), // Arching body
    new THREE.Vector3(side * 0.24, 0.18, -0.16), // Posterior bend
    new THREE.Vector3(side * 0.32, 0.01, -0.25), // Descending tail
    new THREE.Vector3(side * 0.33, -0.15, -0.05), // Temporal tail tip
  ]);
  parts.push(
    createTaperedTube(caudateCurve, 34, 12, (t) =>
      THREE.MathUtils.lerp(0.068, 0.018, Math.pow(t, 0.72)),
    ).toNonIndexed(),
  );

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const merged = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

/**
 * Paired C-shaped Limbic Hippocampus + Fornix Arch wrapping around the Thalamus
 * from the medial temporal floor up into the fornix column and mammillary body.
 */
function createHippocampusHalf(side: 1 | -1): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Full C-arch: Pes Hippocampi (anterior temporal) -> Hippocampal tail -> Crus & Body of Fornix -> Anterior Column
  const limbicArch = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.31, -0.22, 0.18), // Anterior hippocampal head (pes)
    new THREE.Vector3(side * 0.37, -0.18, 0.01), // Medial temporal body
    new THREE.Vector3(side * 0.36, -0.06, -0.21), // Ascending curve
    new THREE.Vector3(side * 0.25, 0.09, -0.34), // Tail / Crus of fornix
    new THREE.Vector3(side * 0.10, 0.20, -0.22), // Ascending crus beneath splenium
    new THREE.Vector3(side * 0.04, 0.24, 0.02), // Body of fornix beneath corpus callosum
    new THREE.Vector3(side * 0.04, 0.13, 0.19), // Anterior column descending
    new THREE.Vector3(side * 0.045, -0.08, 0.12), // Terminating toward mammillary body
  ]);

  const archTube = createTaperedTube(limbicArch, 54, 14, (t) => {
    // Thick hippocampal head/body (t < 0.42), smoothly tapering into slender fornix arch (t >= 0.42)
    if (t < 0.15) return THREE.MathUtils.lerp(0.056, 0.066, t / 0.15);
    if (t < 0.46) return THREE.MathUtils.lerp(0.066, 0.036, (t - 0.15) / 0.31);
    return THREE.MathUtils.lerp(0.036, 0.022, (t - 0.46) / 0.54);
  });
  parts.push(archTube.toNonIndexed());
  archTube.dispose();

  // Mammillary body knob at the base of the fornix column (matching Reference Image 3!)
  const mammillary = new THREE.IcosahedronGeometry(0.032, 2);
  mammillary.translate(side * 0.045, -0.10, 0.11);
  parts.push(mammillary);

  const mergedRaw = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  const merged = mergeVertices(mergedRaw, 1e-4);
  mergedRaw.dispose();
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

function createAmygdalaHalf(side: 1 | -1): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i);
    const sz = pos.getZ(i);
    pos.setXYZ(i, side * 0.31 + sx * 0.075, -0.20 + sy * 0.068, 0.25 + sz * 0.088);
  }
  pos.needsUpdate = true;
  const smooth = mergeVertices(geo, 1e-4);
  geo.dispose();
  smooth.computeVertexNormals();
  smooth.computeBoundingBox();
  smooth.computeBoundingSphere();
  return smooth;
}

export function buildAllBrainGeometries(): Record<BrainRegionId, RegionGeometryBundle> {
  return {
    frontal: {
      id: 'frontal',
      parts: [
        {
          key: 'frontal-R',
          geometry: createFrontalHemisphere(1),
          basePosition: [0, 0, 0],
          explodeOffset: [0.55, 0.44, 1.15],
        },
        {
          key: 'frontal-L',
          geometry: createFrontalHemisphere(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-0.55, 0.44, 1.15],
        },
      ],
      leaderStart: [0.42, 0.56, 0.72],
      leaderEndOffset: [0.35, 0.40, 0.35],
      focusTarget: [0, 0.34, 0.62],
      focusCameraOffset: [3.0, 1.05, 2.9],
    },
    parietal: {
      id: 'parietal',
      parts: [
        {
          key: 'parietal-R',
          geometry: createParietalHemisphere(1),
          basePosition: [0, 0, 0],
          explodeOffset: [0.55, 0.92, -0.22],
        },
        {
          key: 'parietal-L',
          geometry: createParietalHemisphere(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-0.55, 0.92, -0.22],
        },
      ],
      leaderStart: [0.42, 0.86, -0.32],
      leaderEndOffset: [0.32, 0.42, -0.15],
      focusTarget: [0, 0.56, -0.32],
      focusCameraOffset: [2.9, 1.55, -2.1],
    },
    temporal: {
      id: 'temporal',
      parts: [
        {
          key: 'temporal-R',
          geometry: createTemporalHemisphere(1),
          basePosition: [0, 0, 0],
          explodeOffset: [1.32, -0.32, 0.14],
        },
        {
          key: 'temporal-L',
          geometry: createTemporalHemisphere(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-1.32, -0.32, 0.14],
        },
      ],
      leaderStart: [0.80, -0.10, 0.02],
      leaderEndOffset: [0.44, 0.24, 0.12],
      focusTarget: [0.55, -0.10, 0.0],
      focusCameraOffset: [3.2, 0.50, 1.5],
    },
    occipital: {
      id: 'occipital',
      parts: [
        {
          key: 'occipital-R',
          geometry: createOccipitalHemisphere(1),
          basePosition: [0, 0, 0],
          explodeOffset: [0.46, 0.22, -1.18],
        },
        {
          key: 'occipital-L',
          geometry: createOccipitalHemisphere(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-0.46, 0.22, -1.18],
        },
      ],
      leaderStart: [0.32, 0.28, -1.08],
      leaderEndOffset: [0.25, 0.35, -0.38],
      focusTarget: [0, 0.22, -0.94],
      focusCameraOffset: [2.4, 0.9, -3.0],
    },
    cerebellum: {
      id: 'cerebellum',
      parts: [
        {
          key: 'cerebellum-main',
          geometry: createCerebellumGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, -0.68, -1.12],
        },
      ],
      leaderStart: [0.36, -0.46, -0.82],
      leaderEndOffset: [0.38, -0.25, -0.38],
      focusTarget: [0, -0.46, -0.76],
      focusCameraOffset: [2.6, -0.1, -2.7],
    },
    midbrain: {
      id: 'midbrain',
      parts: [
        {
          key: 'midbrain-main',
          geometry: createMidbrainGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, -0.44, -0.22],
        },
      ],
      leaderStart: [0.15, -0.14, -0.15],
      leaderEndOffset: [0.45, 0.12, -0.18],
      focusTarget: [0, -0.14, -0.16],
      focusCameraOffset: [2.4, 0.25, 1.9],
    },
    pons: {
      id: 'pons',
      parts: [
        {
          key: 'pons-main',
          geometry: createPonsGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, -0.82, -0.16],
        },
      ],
      leaderStart: [0.18, -0.40, -0.05],
      leaderEndOffset: [0.46, 0.08, 0.16],
      focusTarget: [0, -0.40, -0.14],
      focusCameraOffset: [2.5, 0.0, 2.0],
    },
    medulla: {
      id: 'medulla',
      parts: [
        {
          key: 'medulla-main',
          geometry: createMedullaGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, -1.24, -0.22],
        },
      ],
      leaderStart: [0.10, -0.90, -0.22],
      leaderEndOffset: [0.44, -0.12, 0.12],
      focusTarget: [0, -0.90, -0.22],
      focusCameraOffset: [2.5, -0.4, 2.1],
    },
    corpusCallosum: {
      id: 'corpusCallosum',
      parts: [
        {
          key: 'corpus-callosum-main',
          geometry: createCorpusCallosumGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, 0.72, 0.08],
        },
      ],
      leaderStart: [0.12, 0.42, 0.06],
      leaderEndOffset: [0.35, 0.36, 0.15],
      focusTarget: [0, 0.26, 0.02],
      focusCameraOffset: [2.5, 0.75, 1.5],
    },
    ventricles: {
      id: 'ventricles',
      parts: [
        {
          key: 'ventricles-main',
          geometry: createVentriclesGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, 0.38, 0.02],
        },
      ],
      leaderStart: [0.14, 0.24, -0.12],
      leaderEndOffset: [0.42, 0.34, -0.18],
      focusTarget: [0, 0.12, -0.06],
      focusCameraOffset: [2.5, 0.65, 1.7],
    },
    thalamus: {
      id: 'thalamus',
      parts: [
        {
          key: 'thalamus-R',
          geometry: createThalamusHalf(1),
          basePosition: [0, 0, 0],
          explodeOffset: [0.24, 0.08, -0.02],
        },
        {
          key: 'thalamus-L',
          geometry: createThalamusHalf(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-0.24, 0.08, -0.02],
        },
      ],
      leaderStart: [0.18, 0.12, -0.05],
      leaderEndOffset: [0.40, 0.28, 0.14],
      focusTarget: [0, 0.05, -0.05],
      focusCameraOffset: [2.3, 0.65, 1.8],
    },
    hypothalamus: {
      id: 'hypothalamus',
      parts: [
        {
          key: 'hypothalamus-main',
          geometry: createHypothalamusGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, -0.16, 0.28],
        },
      ],
      leaderStart: [0.08, -0.09, 0.18],
      leaderEndOffset: [0.42, 0.08, 0.26],
      focusTarget: [0, -0.10, 0.15],
      focusCameraOffset: [2.2, 0.2, 1.9],
    },
    pituitary: {
      id: 'pituitary',
      parts: [
        {
          key: 'pituitary-main',
          geometry: createPituitaryGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, -0.52, 0.44],
        },
      ],
      leaderStart: [0.04, -0.34, 0.22],
      leaderEndOffset: [0.38, -0.16, 0.30],
      focusTarget: [0, -0.28, 0.20],
      focusCameraOffset: [2.1, -0.1, 2.0],
    },
    pineal: {
      id: 'pineal',
      parts: [
        {
          key: 'pineal-main',
          geometry: createPinealGeometry(),
          basePosition: [0, 0, 0],
          explodeOffset: [0, 0.12, -0.52],
        },
      ],
      leaderStart: [0.03, 0.02, -0.33],
      leaderEndOffset: [0.36, 0.24, -0.34],
      focusTarget: [0, 0.02, -0.31],
      focusCameraOffset: [2.2, 0.4, -2.0],
    },
    basalGanglia: {
      id: 'basalGanglia',
      parts: [
        {
          key: 'basalGanglia-R',
          geometry: createBasalGangliaHalf(1),
          basePosition: [0, 0, 0],
          explodeOffset: [0.74, 0.14, 0.22],
        },
        {
          key: 'basalGanglia-L',
          geometry: createBasalGangliaHalf(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-0.74, 0.14, 0.22],
        },
      ],
      leaderStart: [0.32, 0.10, 0.10],
      leaderEndOffset: [0.44, 0.34, 0.18],
      focusTarget: [0.22, 0.08, 0.06],
      focusCameraOffset: [2.6, 0.6, 1.8],
    },
    hippocampus: {
      id: 'hippocampus',
      parts: [
        {
          key: 'hippocampus-R',
          geometry: createHippocampusHalf(1),
          basePosition: [0, 0, 0],
          explodeOffset: [0.64, -0.28, -0.26],
        },
        {
          key: 'hippocampus-L',
          geometry: createHippocampusHalf(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-0.64, -0.28, -0.26],
        },
      ],
      leaderStart: [0.36, -0.09, -0.14],
      leaderEndOffset: [0.46, -0.14, -0.22],
      focusTarget: [0, -0.06, -0.10],
      focusCameraOffset: [2.5, 0.45, 1.7],
    },
    amygdala: {
      id: 'amygdala',
      parts: [
        {
          key: 'amygdala-R',
          geometry: createAmygdalaHalf(1),
          basePosition: [0, 0, 0],
          explodeOffset: [0.62, -0.30, 0.48],
        },
        {
          key: 'amygdala-L',
          geometry: createAmygdalaHalf(-1),
          basePosition: [0, 0, 0],
          explodeOffset: [-0.62, -0.30, 0.48],
        },
      ],
      leaderStart: [0.33, -0.20, 0.26],
      leaderEndOffset: [0.44, -0.18, 0.26],
      focusTarget: [0, -0.20, 0.25],
      focusCameraOffset: [2.3, 0.35, 2.0],
    },
  };
}

export function disposeBrainGeometries(
  bundles: Record<BrainRegionId, RegionGeometryBundle>,
): void {
  Object.values(bundles).forEach((bundle) => {
    bundle.parts.forEach((part) => part.geometry.dispose());
  });
}
