import test from 'node:test';
import assert from 'node:assert/strict';
import { corticalGyriField, simplex3D } from './noise3d';

test('simplex3D produces deterministic finite values within [-1.1, 1.1]', () => {
  for (let i = -5; i <= 5; i++) {
    const a = simplex3D(i * 0.37, i * 0.51, i * -0.29);
    const b = simplex3D(i * 0.37, i * 0.51, i * -0.29);
    assert.equal(a, b);
    assert.ok(Number.isFinite(a));
    assert.ok(a >= -1.1 && a <= 1.1, `Out of range noise: ${a}`);
  }
});

test('corticalGyriField produces smooth bounded folding variations', () => {
  const samples = [
    corticalGyriField(0.4, 0.5, 0.8),
    corticalGyriField(0.45, 0.52, 0.82),
    corticalGyriField(-0.6, 0.2, -0.7),
    corticalGyriField(0.7, -0.1, 0.1),
  ];

  for (const val of samples) {
    assert.ok(Number.isFinite(val));
    assert.ok(val >= -0.8 && val <= 0.6, `Out of range gyri field: ${val}`);
  }
  assert.notEqual(samples[0], samples[2]);
});
