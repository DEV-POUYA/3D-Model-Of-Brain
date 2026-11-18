import test from 'node:test';
import assert from 'node:assert/strict';
import { BRAIN_REGION_IDS } from '../types/brain';
import { buildAllBrainGeometries, disposeBrainGeometries } from './brainGeometry';

test('all 17 anatomical brain geometries build cleanly with finite vertices and leader anchors', () => {
  const bundles = buildAllBrainGeometries();

  assert.equal(Object.keys(bundles).length, BRAIN_REGION_IDS.length);

  for (const id of BRAIN_REGION_IDS) {
    const bundle = bundles[id];
    assert.ok(bundle, `Missing bundle for ${id}`);
    assert.ok(bundle.parts.length >= 1, `No parts for ${id}`);
    assert.equal(bundle.leaderStart.length, 3);
    assert.equal(bundle.leaderEndOffset.length, 3);

    for (const part of bundle.parts) {
      const pos = part.geometry.attributes.position;
      assert.ok(pos.count > 20, `Too few vertices for ${part.key}`);
      for (let i = 0; i < pos.count; i++) {
        assert.ok(Number.isFinite(pos.getX(i)), `NaN X in ${part.key}`);
        assert.ok(Number.isFinite(pos.getY(i)), `NaN Y in ${part.key}`);
        assert.ok(Number.isFinite(pos.getZ(i)), `NaN Z in ${part.key}`);
      }
      assert.ok(part.geometry.boundingBox !== null, `Missing boundingBox for ${part.key}`);
      const explodeDist = Math.hypot(...part.explodeOffset);
      assert.ok(explodeDist > 0.15, `Explode offset too small for ${part.key}`);
    }
  }

  disposeBrainGeometries(bundles);
});
