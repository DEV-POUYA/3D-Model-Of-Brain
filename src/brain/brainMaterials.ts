import * as THREE from 'three';
import { corticalSulciSample, simplex3D } from './noise3d';

/**
 * Probes the browser WebGL2 context renderer string for software WebGL
 * (SwiftShader, llvmpipe, WARP) so rendering cost stays balanced without
 * changing scene geometry, layout, or UI.
 */
export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

/**
 * Generates a tileable procedural cortical gyri/sulci bump map (grayscale)
 * matching the smooth gyral crown / narrow sulcal groove aesthetic.
 */
export function createCorticalBumpTexture(maxAnisotropy = 4): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let py = 0; py < size; py++) {
    const v = (py / size) * Math.PI * 2;
    const cy = Math.cos(v);
    const sy = Math.sin(v);
    for (let px = 0; px < size; px++) {
      const u = (px / size) * Math.PI * 2;
      const cx = Math.cos(u);
      const sx = Math.sin(u);

      const sample = corticalSulciSample(cx * 0.9 + sy * 0.22, sx * 0.9, cy * 0.9);
      const micro = simplex3D(cx * 2.8, sx * 2.8, cy * 2.8 + sy * 2.8) * 0.08;
      const val = THREE.MathUtils.clamp((sample.height + 0.68 + micro) * 235, 16, 250);
      const idx = (py * size + px) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 2.2);
  tex.anisotropy = Math.max(1, Math.min(maxAnisotropy, 8));
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates fine parallel cerebellar folia striations for realistic cerebellum micro-relief.
 */
export function createFoliaBumpTexture(maxAnisotropy = 4): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let py = 0; py < size; py++) {
    const band = Math.pow(0.5 + 0.5 * Math.sin((py / size) * Math.PI * 2 * 22), 0.5);
    for (let px = 0; px < size; px++) {
      const ripple = Math.sin((px / size) * Math.PI * 2 * 3 + py * 0.06) * 0.06;
      const val = THREE.MathUtils.clamp((band * 0.88 + 0.10 + ripple) * 248, 18, 252);
      const idx = (py * size + px) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2.5);
  tex.anisotropy = Math.max(1, Math.min(maxAnisotropy, 8));
  tex.needsUpdate = true;
  return tex;
}
