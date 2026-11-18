/**
 * Deterministic 3D Simplex Noise and multi-octave cortical gyri/sulci folding fields.
 * Based on Ken Perlin / Stefan Gustavson 3D Simplex algorithm, zero external dependencies.
 */

const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;

const GRAD3: ReadonlyArray<[number, number, number]> = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

// Deterministic 256-entry permutation table (shuffled with fixed seed)
const PERM = new Uint8Array(512);
const PERM_MOD12 = new Uint8Array(512);

(function initPerm() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let seed = 133742;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) {
    PERM[i] = p[i & 255];
    PERM_MOD12[i] = PERM[i] % 12;
  }
})();

function dot3(g: [number, number, number], x: number, y: number, z: number): number {
  return g[0] * x + g[1] * y + g[2] * z;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Returns deterministic 3D Simplex Noise in approximately [-1, 1].
 */
export function simplex3D(xin: number, yin: number, zin: number): number {
  let n0 = 0;
  let n1 = 0;
  let n2 = 0;
  let n3 = 0;

  const s = (xin + yin + zin) * F3;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const k = Math.floor(zin + s);
  const t = (i + j + k) * G3;

  const X0 = i - t;
  const Y0 = j - t;
  const Z0 = k - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;
  const z0 = zin - Z0;

  let i1: number, j1: number, k1: number;
  let i2: number, j2: number, k2: number;

  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    } else if (x0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
    } else {
      i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
    }
  } else {
    if (y0 < z0) {
      i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
    } else if (x0 < z0) {
      i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
    } else {
      i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    }
  }

  const x1 = x0 - i1 + G3;
  const y1 = y0 - j1 + G3;
  const z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2.0 * G3;
  const y2 = y0 - j2 + 2.0 * G3;
  const z2 = z0 - k2 + 2.0 * G3;
  const x3 = x0 - 1.0 + 3.0 * G3;
  const y3 = y0 - 1.0 + 3.0 * G3;
  const z3 = z0 - 1.0 + 3.0 * G3;

  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;

  const gi0 = PERM_MOD12[ii + PERM[jj + PERM[kk]]];
  const gi1 = PERM_MOD12[ii + i1 + PERM[jj + j1 + PERM[kk + k1]]];
  const gi2 = PERM_MOD12[ii + i2 + PERM[jj + j2 + PERM[kk + k2]]];
  const gi3 = PERM_MOD12[ii + 1 + PERM[jj + 1 + PERM[kk + 1]]];

  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 > 0) {
    t0 *= t0;
    n0 = t0 * t0 * dot3(GRAD3[gi0], x0, y0, z0);
  }

  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 > 0) {
    t1 *= t1;
    n1 = t1 * t1 * dot3(GRAD3[gi1], x1, y1, z1);
  }

  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 > 0) {
    t2 *= t2;
    n2 = t2 * t2 * dot3(GRAD3[gi2], x2, y2, z2);
  }

  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 > 0) {
    t3 *= t3;
    n3 = t3 * t3 * dot3(GRAD3[gi3], x3, y3, z3);
  }

  return 32.0 * (n0 + n1 + n2 + n3);
}

export interface CorticalSample {
  /** Signed displacement in [-0.72, +0.32] (negative inside sulcal trenches, positive on gyral crowns) */
  height: number;
  /** Ambient occlusion darkening factor in [0.40, 1.0] for crisp sulcal shadow contrast */
  ao: number;
}

/**
 * Generates broad, plump, winding tubular gyral crowns separated by crisp,
 * narrow, branching sulcal crevices matching anatomical cortex references.
 */
export function corticalSulciSample(x: number, y: number, z: number): CorticalSample {
  // Domain-warp coordinates smoothly so sulci meander in natural S-curves
  const wx = x + 0.26 * simplex3D(x * 1.32 + 3.1, y * 1.32, z * 1.32);
  const wy = y + 0.26 * simplex3D(x * 1.32, y * 1.32 + 7.4, z * 1.32);
  const wz = z + 0.26 * simplex3D(x * 1.32, y * 1.32, z * 1.32 + 11.7);

  // Primary sulci (broad winding gyral tubes separated by well-defined sulcal trenches)
  const n1 = simplex3D(wx * 2.10, wy * 2.10, wz * 2.10);
  const s1 = smoothstep(0.05, 0.44, Math.abs(n1));

  // Secondary tertiary sulcal indentations branching across broad gyral crowns
  const n2 = simplex3D(wx * 3.85 + 19.2, wy * 3.85 - 4.7, wz * 3.85 + 8.3);
  const s2 = smoothstep(0.04, 0.32, Math.abs(n2));

  // Plump rounded crown profile
  const crownCurve = 0.82 + 0.18 * smoothstep(0.36, 0.92, Math.abs(n1));
  const combined = s1 * (0.74 + 0.26 * s2) * crownCurve;

  return {
    height: combined - 0.72,
    ao: 0.24 + 0.76 * Math.min(s1, 0.56 + 0.44 * s2),
  };
}

/**
 * Scalar cortical gyri/sulci folding value in [-0.72, +0.35].
 */
export function corticalGyriField(x: number, y: number, z: number): number {
  return corticalSulciSample(x, y, z).height;
}
