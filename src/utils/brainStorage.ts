import { INITIAL_BRAIN_REGIONS } from '../data/initialBrainData';
import {
  BRAIN_CATEGORIES,
  BRAIN_REGION_IDS,
  BrainCategory,
  BrainRegion,
  BrainRegionId,
} from '../types/brain';

export const STORAGE_KEY = 'brain-atlas-regions-v2';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidCategory(value: unknown): value is BrainCategory {
  return typeof value === 'string' && (BRAIN_CATEGORIES as string[]).includes(value);
}

export function isValidRegionId(value: unknown): value is BrainRegionId {
  return typeof value === 'string' && (BRAIN_REGION_IDS as string[]).includes(value);
}

export function normalizeHexColor(value: unknown, fallback: string): string {
  if (typeof value === 'string' && HEX_COLOR_RE.test(value.trim())) {
    return value.trim().toLowerCase();
  }
  return fallback;
}

function sanitizeStringArray(raw: unknown, fallback: string[]): string[] {
  if (!Array.isArray(raw)) return [...fallback];
  return raw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function sanitizeRegion(
  raw: unknown,
  fallback: BrainRegion,
): BrainRegion | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const obj = raw as Record<string, unknown>;

  // Support both new bilingual fields (title_fa / title_en) and legacy single-language fields
  const title_fa =
    typeof obj.title_fa === 'string' && obj.title_fa.trim().length > 0
      ? obj.title_fa.trim()
      : typeof obj.title === 'string' && obj.title.trim().length > 0
        ? obj.title.trim()
        : fallback.title_fa;

  const title_en =
    typeof obj.title_en === 'string' && obj.title_en.trim().length > 0
      ? obj.title_en.trim()
      : fallback.title_en;

  const latinName =
    typeof obj.latinName === 'string' && obj.latinName.trim().length > 0
      ? obj.latinName.trim()
      : fallback.latinName;

  const summary_fa =
    typeof obj.summary_fa === 'string'
      ? obj.summary_fa.trim()
      : typeof obj.summary === 'string'
        ? obj.summary.trim()
        : fallback.summary_fa;

  const summary_en =
    typeof obj.summary_en === 'string'
      ? obj.summary_en.trim()
      : fallback.summary_en;

  const clinicalNotes_fa =
    typeof obj.clinicalNotes_fa === 'string'
      ? obj.clinicalNotes_fa.trim()
      : typeof obj.clinicalNotes === 'string'
        ? obj.clinicalNotes.trim()
        : fallback.clinicalNotes_fa;

  const clinicalNotes_en =
    typeof obj.clinicalNotes_en === 'string'
      ? obj.clinicalNotes_en.trim()
      : fallback.clinicalNotes_en;

  const category = isValidCategory(obj.category)
    ? obj.category
    : fallback.category;

  const color = normalizeHexColor(obj.color, fallback.color);

  const functions_fa = Array.isArray(obj.functions_fa)
    ? sanitizeStringArray(obj.functions_fa, fallback.functions_fa)
    : Array.isArray(obj.functions)
      ? sanitizeStringArray(obj.functions, fallback.functions_fa)
      : [...fallback.functions_fa];

  const functions_en = Array.isArray(obj.functions_en)
    ? sanitizeStringArray(obj.functions_en, fallback.functions_en)
    : [...fallback.functions_en];

  return {
    id: fallback.id,
    category,
    latinName,
    title_fa,
    title_en,
    summary_fa,
    summary_en,
    functions_fa,
    functions_en,
    clinicalNotes_fa,
    clinicalNotes_en,
    color,
    isInternal: fallback.isInternal,
  };
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function cloneDefaultRegions(): BrainRegion[] {
  return INITIAL_BRAIN_REGIONS.map((r) => ({
    ...r,
    functions_fa: [...r.functions_fa],
    functions_en: [...r.functions_en],
  }));
}

export function loadRegionsFromStorage(
  storage: StorageLike | null = typeof window !== 'undefined' ? window.localStorage : null,
): BrainRegion[] {
  if (!storage) return cloneDefaultRegions();

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneDefaultRegions();
    }
    const parsed = parseAndValidateRegionsJson(raw, INITIAL_BRAIN_REGIONS);
    if (parsed.ok) {
      return parsed.regions;
    }
  } catch {
    // Ignore storage access errors and return defaults
  }
  return cloneDefaultRegions();
}

export function saveRegionsToStorage(
  regions: BrainRegion[],
  storage: StorageLike | null = typeof window !== 'undefined' ? window.localStorage : null,
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, serializeRegionsToJson(regions));
  } catch {
    // Ignore quota or private-mode errors
  }
}

export function serializeRegionsToJson(regions: BrainRegion[]): string {
  return JSON.stringify(regions, null, 2);
}

export type ParseRegionsResult =
  | { ok: true; regions: BrainRegion[]; updatedCount: number }
  | { ok: false; error_fa: string; error_en: string };

export function parseAndValidateRegionsJson(
  jsonText: string,
  baseRegions: BrainRegion[] = INITIAL_BRAIN_REGIONS,
): ParseRegionsResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      error_fa: 'فایل JSON معتبر نیست. لطفاً ساختار فایل ورودی را بررسی کنید.',
      error_en: 'Invalid JSON file. Please check the file syntax and try again.',
    };
  }

  const candidateArray = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).regions)
      ? ((parsed as Record<string, unknown>).regions as unknown[])
      : null;

  if (!candidateArray || candidateArray.length === 0) {
    return {
      ok: false,
      error_fa: 'فایل JSON باید شامل آرایه‌ای از نواحی مغز باشد.',
      error_en: 'JSON payload must contain a non-empty array of brain regions.',
    };
  }

  const baseById = new Map<BrainRegionId, BrainRegion>(
    baseRegions.map((region) => [region.id, region]),
  );
  const incomingById = new Map<BrainRegionId, BrainRegion>();

  for (const item of candidateArray) {
    if (!item || typeof item !== 'object') continue;
    const rawId = (item as Record<string, unknown>).id;
    if (!isValidRegionId(rawId)) continue;
    const fallback = baseById.get(rawId);
    if (!fallback) continue;
    const sanitized = sanitizeRegion(item, fallback);
    if (sanitized) {
      incomingById.set(rawId, sanitized);
    }
  }

  if (incomingById.size === 0) {
    return {
      ok: false,
      error_fa: 'هیچ شناسه معتبری از بخش‌های مغز در فایل ورودی یافت نشد.',
      error_en: 'No valid brain region identifiers were found in the imported JSON.',
    };
  }

  const merged = baseRegions.map((base) => {
    const updated = incomingById.get(base.id);
    return updated
      ? updated
      : {
          ...base,
          functions_fa: [...base.functions_fa],
          functions_en: [...base.functions_en],
        };
  });

  return {
    ok: true,
    regions: merged,
    updatedCount: incomingById.size,
  };
}

export function filterBrainRegions(
  regions: BrainRegion[],
  searchQuery: string,
  categoryFilter: BrainCategory | 'ALL' = 'ALL',
): BrainRegion[] {
  const q = searchQuery.trim().toLowerCase();
  return regions.filter((region) => {
    if (categoryFilter !== 'ALL' && region.category !== categoryFilter) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      region.title_fa,
      region.title_en,
      region.latinName,
      region.summary_fa,
      region.summary_en,
      region.clinicalNotes_fa,
      region.clinicalNotes_en,
      ...region.functions_fa,
      ...region.functions_en,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
