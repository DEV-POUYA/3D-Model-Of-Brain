import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_BRAIN_REGIONS } from '../data/initialBrainData';
import {
  STORAGE_KEY,
  StorageLike,
  filterBrainRegions,
  loadRegionsFromStorage,
  parseAndValidateRegionsJson,
  saveRegionsToStorage,
  serializeRegionsToJson,
} from './brainStorage';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

test('initial dataset contains all 17 anatomical regions with complete FA and EN content', () => {
  assert.equal(INITIAL_BRAIN_REGIONS.length, 17);
  const outerCount = INITIAL_BRAIN_REGIONS.filter((r) => !r.isInternal).length;
  const internalCount = INITIAL_BRAIN_REGIONS.filter((r) => r.isInternal).length;
  assert.equal(outerCount, 8);
  assert.equal(internalCount, 9);
  for (const region of INITIAL_BRAIN_REGIONS) {
    assert.ok(region.title_fa.trim().length > 0);
    assert.ok(region.title_en.trim().length > 0);
    assert.ok(region.latinName.trim().length > 0);
    assert.ok(region.summary_fa.trim().length > 0);
    assert.ok(region.summary_en.trim().length > 0);
    assert.ok(region.functions_fa.length >= 2);
    assert.ok(region.functions_en.length >= 2);
  }
});

test('saveRegionsToStorage and loadRegionsFromStorage round-trip bilingual edits', () => {
  const storage = createMemoryStorage();
  const modified = INITIAL_BRAIN_REGIONS.map((r) =>
    r.id === 'hippocampus'
      ? {
          ...r,
          title_fa: 'هیپوکامپ ویرایش‌شده',
          title_en: 'Custom Hippocampus',
          color: '#10b981',
          functions_fa: ['تثبیت حافظه فضایی'],
          functions_en: ['Spatial memory encoding'],
        }
      : r,
  );

  saveRegionsToStorage(modified, storage);
  assert.ok(storage.getItem(STORAGE_KEY));

  const loaded = loadRegionsFromStorage(storage);
  const hippo = loaded.find((r) => r.id === 'hippocampus');
  assert.equal(hippo?.title_fa, 'هیپوکامپ ویرایش‌شده');
  assert.equal(hippo?.title_en, 'Custom Hippocampus');
  assert.equal(hippo?.color, '#10b981');
  assert.deepEqual(hippo?.functions_fa, ['تثبیت حافظه فضایی']);
  assert.deepEqual(hippo?.functions_en, ['Spatial memory encoding']);
});

test('parseAndValidateRegionsJson rejects malformed JSON and invalid payloads', () => {
  const badSyntax = parseAndValidateRegionsJson('{bad json');
  assert.equal(badSyntax.ok, false);

  const emptyArray = parseAndValidateRegionsJson('[]');
  assert.equal(emptyArray.ok, false);

  const unknownIds = parseAndValidateRegionsJson(
    JSON.stringify([{ id: 'unknown_part', title_en: 'Test' }]),
  );
  assert.equal(unknownIds.ok, false);
});

test('parseAndValidateRegionsJson sanitizes partial updates and preserves all 17 regions', () => {
  const json = serializeRegionsToJson(
    INITIAL_BRAIN_REGIONS.slice(0, 2).map((r) =>
      r.id === 'frontal'
        ? { ...r, title_en: '  Custom Frontal Lobe  ', color: 'invalid-color' }
        : r,
    ),
  );
  const result = parseAndValidateRegionsJson(json);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.regions.length, 17);
    assert.equal(result.updatedCount, 2);
    const frontal = result.regions.find((r) => r.id === 'frontal');
    assert.equal(frontal?.title_en, 'Custom Frontal Lobe');
    assert.equal(frontal?.color, '#38bdf8');
  }
});

test('filterBrainRegions matches Persian, English, Latin, and category filters', () => {
  const byPersian = filterBrainRegions(INITIAL_BRAIN_REGIONS, 'غده صنوبری');
  assert.equal(byPersian.length, 1);
  assert.equal(byPersian[0].id, 'pineal');

  const byEnglish = filterBrainRegions(INITIAL_BRAIN_REGIONS, 'Pineal Gland');
  assert.equal(byEnglish.length, 1);
  assert.equal(byEnglish[0].id, 'pineal');

  const byLatin = filterBrainRegions(INITIAL_BRAIN_REGIONS, 'Ventriculi cerebri');
  assert.equal(byLatin.length, 1);
  assert.equal(byLatin[0].id, 'ventricles');

  const byCategory = filterBrainRegions(INITIAL_BRAIN_REGIONS, '', 'Limbic System');
  assert.equal(byCategory.length, 2);
  assert.deepEqual(
    byCategory.map((r) => r.id).sort(),
    ['amygdala', 'hippocampus'],
  );
});
