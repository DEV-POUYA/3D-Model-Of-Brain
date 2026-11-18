import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  BRAIN_CATEGORIES,
  BrainCategory,
  BrainRegion,
  BrainRegionId,
  CATEGORY_LABELS,
  Language,
} from '../types/brain';
import { filterBrainRegions } from '../utils/brainStorage';

interface RegionSidebarProps {
  regions: BrainRegion[];
  language: Language;
  selectedId: BrainRegionId | null;
  onSelectRegion: (id: BrainRegionId) => void;
}

export const RegionSidebar: React.FC<RegionSidebarProps> = ({
  regions,
  language,
  selectedId,
  onSelectRegion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BrainCategory | 'ALL'>('ALL');
  const isFa = language === 'fa';

  const filtered = useMemo(
    () => filterBrainRegions(regions, searchQuery, categoryFilter),
    [regions, searchQuery, categoryFilter],
  );

  const outerRegions = useMemo(
    () => filtered.filter((r) => !r.isInternal),
    [filtered],
  );
  const internalRegions = useMemo(
    () => filtered.filter((r) => r.isInternal),
    [filtered],
  );

  const renderRegionRow = (region: BrainRegion) => {
    const isSelected = selectedId === region.id;
    const displayTitle = isFa ? region.title_fa : region.title_en;
    return (
      <li key={region.id}>
        <button
          type="button"
          onClick={() => onSelectRegion(region.id)}
          aria-current={isSelected ? 'true' : undefined}
          className={`group flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-start transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 ${
            isSelected
              ? 'border-cyan-500/60 bg-cyan-500/12 text-white'
              : 'border-transparent bg-slate-900/40 text-slate-200 hover:border-slate-700/70 hover:bg-slate-800/70'
          }`}
        >
          <span
            className="mt-1.5 h-3 w-3 shrink-0 rounded-full border border-white/20"
            style={{ backgroundColor: region.color }}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold">
                {displayTitle}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-latin truncate" dir="ltr">
                {region.latinName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">
                {CATEGORY_LABELS[region.category][language]}
              </span>
            </div>
          </div>
        </button>
      </li>
    );
  };

  return (
    <aside
      aria-label={isFa ? 'فهرست ساختارهای مغز' : 'Brain regions directory'}
      className="flex h-full flex-col border-e border-slate-800 bg-[#0d131f]"
    >
      <div className="border-b border-slate-800 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold text-slate-300">
            {isFa ? 'ساختارهای مغز' : 'Brain Structures'}
          </h2>
          <span className="font-mono-nums text-xs text-slate-400">
            {isFa
              ? `${filtered.length} از ${regions.length}`
              : `${filtered.length} of ${regions.length}`}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mt-2.5">
          <Search
            className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isFa
                ? 'جستجوی نام فارسی، انگلیسی یا لاتین...'
                : 'Search English, Persian, or Latin...'
            }
            aria-label={isFa ? 'جستجو در ساختارهای مغز' : 'Search brain structures'}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-900 py-2 ps-8 pe-7 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label={isFa ? 'پاک کردن جستجو' : 'Clear search'}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div
          className="mt-2.5 flex flex-wrap gap-1"
          role="group"
          aria-label={isFa ? 'فیلتر دسته‌بندی' : 'Category filter'}
        >
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {isFa ? 'همه' : 'All'}
          </button>
          {BRAIN_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {CATEGORY_LABELS[cat][language]}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Region List */}
      <div className="atlas-scroll flex-1 space-y-5 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 px-4 py-8 text-center">
            <p className="text-xs font-medium text-slate-300">
              {isFa
                ? 'ساختاری مطابق با جستجو یافت نشد.'
                : 'No matching brain structures found.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
              }}
              className="mt-3 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-cyan-300 hover:bg-slate-800"
            >
              {isFa ? 'نمایش همه بخش‌ها' : 'Show all regions'}
            </button>
          </div>
        ) : (
          <>
            {outerRegions.length > 0 && (
              <section>
                <h3 className="mb-2 px-1 text-[11px] font-semibold text-slate-400">
                  {isFa
                    ? `ساختارهای بیرونی و ساقه (${outerRegions.length})`
                    : `Outer Cortex & Stem (${outerRegions.length})`}
                </h3>
                <ul className="space-y-1">{outerRegions.map(renderRegionRow)}</ul>
              </section>
            )}

            {internalRegions.length > 0 && (
              <section>
                <h3 className="mb-2 px-1 text-[11px] font-semibold text-slate-400">
                  {isFa
                    ? `ساختارهای عمقی و داخلی (${internalRegions.length})`
                    : `Deep Internal Structures (${internalRegions.length})`}
                </h3>
                <ul className="space-y-1">{internalRegions.map(renderRegionRow)}</ul>
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
