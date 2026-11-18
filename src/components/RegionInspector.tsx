import React, { useEffect, useState } from 'react';
import {
  Crosshair,
  Eye,
  Focus,
  Pencil,
  Plus,
  ScanEye,
  Trash2,
} from 'lucide-react';
import {
  AppMode,
  BRAIN_CATEGORIES,
  BrainCategory,
  BrainRegion,
  BrainRegionId,
  CATEGORY_LABELS,
  Language,
} from '../types/brain';

const PRESET_COLORS = [
  '#38bdf8',
  '#818cf8',
  '#2dd4bf',
  '#fb923c',
  '#f472b6',
  '#94a3b8',
  '#64748b',
  '#475569',
  '#fde047',
  '#22d3ee',
  '#a78bfa',
  '#fb7185',
  '#f59e0b',
  '#facc15',
  '#60a5fa',
  '#34d399',
  '#f87171',
];

interface RegionInspectorProps {
  region: BrainRegion | null;
  allRegions: BrainRegion[];
  language: Language;
  mode: AppMode;
  cortexOpacity: number;
  isolated: boolean;
  onModeChange: (mode: AppMode) => void;
  onSelectRegion: (id: BrainRegionId) => void;
  onUpdateRegion: (id: BrainRegionId, patch: Partial<BrainRegion>) => void;
  onFocusRegion: () => void;
  onEnableXRay: () => void;
  onToggleIsolated: () => void;
}

export const RegionInspector: React.FC<RegionInspectorProps> = ({
  region,
  allRegions,
  language,
  mode,
  cortexOpacity,
  isolated,
  onModeChange,
  onSelectRegion,
  onUpdateRegion,
  onFocusRegion,
  onEnableXRay,
  onToggleIsolated,
}) => {
  const [editLang, setEditLang] = useState<Language>(language);
  const [newFunctionText, setNewFunctionText] = useState('');

  useEffect(() => {
    setEditLang(language);
  }, [language]);

  const isFa = language === 'fa';
  const outerCount = allRegions.filter((r) => !r.isInternal).length;
  const internalCount = allRegions.length - outerCount;

  if (!region) {
    return (
      <aside
        aria-label={isFa ? 'پنل جزئیات بخش انتخاب‌شده' : 'Region inspector panel'}
        className="flex h-full flex-col justify-between border-s border-slate-800 bg-[#0d131f] p-5"
      >
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {isFa ? 'راهنمای کاوشگر آناتومی' : 'Anatomy Explorer Guide'}
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              {isFa
                ? 'برای مشاهده مشخصات تشریحی، عملکردها و نکات بالینی، روی یکی از بخش‌های مدل سه‌بعدی مغز کلیک کنید یا ساختار مورد نظر را از فهرست انتخاب نمایید.'
                : 'Click any structure on the 3D brain model or pick from the directory to inspect anatomical details, key functions, and clinical notes.'}
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold text-slate-300">
              {isFa ? 'دسترسی سریع به ساختارها' : 'Quick Structure Access'}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {allRegions.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectRegion(item.id)}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-2 text-start text-xs text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {isFa ? item.title_fa : item.title_en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 text-xs leading-6 text-slate-400">
            <p className="font-semibold text-slate-200">
              {isFa ? 'نکته مشاهده بخش‌های عمقی' : 'Inspecting Deep Structures'}
            </p>
            <p className="mt-1">
              {isFa
                ? 'برای دیدن و انتخاب مستقیم ساختارهای عمقی مانند هیپوکامپ، آمیگدال، بطن‌ها و عقده‌های قاعده‌ای، از لغزنده شفافیت قشر (اشعه ایکس)، نمای انفجاری تدریجی یا ایزوله‌سازی استفاده کنید.'
                : 'Use the Cortex Opacity (X-Ray) slider, progressive Exploded View slider, or Isolate Part button to inspect and click deep structures such as the Hippocampus, Thalamus, Basal Ganglia, and Ventricles.'}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500">
          {isFa
            ? `${allRegions.length} ساختار آناتومیک · ${outerCount} بیرونی و ساقه · ${internalCount} ساختار عمقی`
            : `${allRegions.length} Anatomical Regions · ${outerCount} Outer & Stem · ${internalCount} Deep Internal`}
        </div>
      </aside>
    );
  }

  const displayTitle = isFa ? region.title_fa : region.title_en;
  const displaySummary = isFa ? region.summary_fa : region.summary_en;
  const displayFunctions = isFa ? region.functions_fa : region.functions_en;
  const displayClinical = isFa ? region.clinicalNotes_fa : region.clinicalNotes_en;

  const isEditFa = editLang === 'fa';
  const editTitle = isEditFa ? region.title_fa : region.title_en;
  const editSummary = isEditFa ? region.summary_fa : region.summary_en;
  const editFunctions = isEditFa ? region.functions_fa : region.functions_en;
  const editClinical = isEditFa ? region.clinicalNotes_fa : region.clinicalNotes_en;

  const handleAddFunction = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFunctionText.trim();
    if (!trimmed) return;
    if (isEditFa) {
      onUpdateRegion(region.id, {
        functions_fa: [...region.functions_fa, trimmed],
      });
    } else {
      onUpdateRegion(region.id, {
        functions_en: [...region.functions_en, trimmed],
      });
    }
    setNewFunctionText('');
  };

  const handleFunctionChange = (index: number, value: string) => {
    const next = [...editFunctions];
    next[index] = value;
    onUpdateRegion(
      region.id,
      isEditFa ? { functions_fa: next } : { functions_en: next },
    );
  };

  const handleRemoveFunction = (index: number) => {
    const next = editFunctions.filter((_, i) => i !== index);
    onUpdateRegion(
      region.id,
      isEditFa ? { functions_fa: next } : { functions_en: next },
    );
  };

  return (
    <aside
      aria-label={
        mode === 'view'
          ? isFa
            ? 'مشخصات بخش انتخاب‌شده'
            : 'Selected region details'
          : isFa
            ? 'فرم ویرایش بخش انتخاب‌شده'
            : 'Edit selected region'
      }
      className="flex h-full flex-col border-s border-slate-800 bg-[#0d131f]"
    >
      {/* Header */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/25"
                style={{ backgroundColor: region.color }}
                aria-hidden="true"
              />
              <h2 className="truncate text-lg font-bold text-slate-50">
                {displayTitle}
              </h2>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-latin font-medium text-cyan-300" dir="ltr">
                {region.latinName}
              </span>
              <span aria-hidden="true">·</span>
              <span>{CATEGORY_LABELS[region.category][language]}</span>
              <span aria-hidden="true">·</span>
              <span>
                {region.isInternal
                  ? isFa
                    ? 'ساختار عمقی'
                    : 'Deep Internal'
                  : isFa
                    ? 'ساختار بیرونی'
                    : 'Outer / Stem'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onModeChange(mode === 'view' ? 'edit' : 'view')}
            aria-label={
              mode === 'view'
                ? isFa
                  ? 'ویرایش این بخش'
                  : 'Edit this region'
                : isFa
                  ? 'بازگشت به حالت نمایش'
                  : 'Back to view mode'
            }
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800"
          >
            {mode === 'view' ? (
              <>
                <Pencil className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>{isFa ? 'ویرایش' : 'Edit'}</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                <span>{isFa ? 'نمایش' : 'View'}</span>
              </>
            )}
          </button>
        </div>

        {/* Viewport quick helpers */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onFocusRegion}
            className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-800"
          >
            <Crosshair className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>{isFa ? 'تمرکز دوربین' : 'Focus Camera'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleIsolated}
            aria-pressed={isolated}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              isolated
                ? 'border-amber-400/60 bg-amber-500/18 text-amber-200'
                : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Focus className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>{isFa ? 'ایزوله‌سازی بخش' : 'Isolate Part'}</span>
          </button>

          {region.isInternal && cortexOpacity > 0.35 && (
            <button
              type="button"
              onClick={onEnableXRay}
              className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-500/12 px-2.5 py-1.5 text-[11px] font-medium text-cyan-200 hover:bg-cyan-500/20"
            >
              <ScanEye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isFa ? 'دید اشعه ایکس (۱۵٪)' : 'X-Ray View (15%)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="atlas-scroll flex-1 overflow-y-auto px-5 py-4">
        {mode === 'view' ? (
          <div className="space-y-6">
            {/* Summary */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400">
                {isFa ? 'معرفی و موقعیت آناتومیک' : 'Anatomical Overview'}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                {displaySummary ||
                  (isFa
                    ? 'توضیحی برای این بخش ثبت نشده است.'
                    : 'No description recorded for this region.')}
              </p>
            </section>

            {/* Key Functions */}
            <section className="border-t border-slate-800/80 pt-5">
              <h3 className="text-xs font-semibold text-slate-400">
                {isFa ? 'عملکردهای کلیدی' : 'Key Functions'}
              </h3>
              {displayFunctions.length > 0 ? (
                <ul className="mt-3 space-y-2.5">
                  {displayFunctions.map((fn, idx) => (
                    <li
                      key={`${region.id}-fn-${language}-${idx}`}
                      className="flex items-start gap-2.5 text-sm leading-6 text-slate-200"
                    >
                      <span
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: region.color }}
                        aria-hidden="true"
                      />
                      <span>{fn}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  {isFa
                    ? 'هنوز عملکردی برای این ناحیه ثبت نشده است.'
                    : 'No functions added for this region yet.'}
                </p>
              )}
            </section>

            {/* Clinical Notes */}
            <section className="border-t border-slate-800/80 pt-5">
              <h3 className="text-xs font-semibold text-slate-400">
                {isFa ? 'نکات بالینی و اختلالات مرتبط' : 'Clinical Relevance & Disorders'}
              </h3>
              <div className="mt-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5">
                <p className="text-xs leading-6 text-slate-300">
                  {displayClinical ||
                    (isFa ? 'نکته بالینی ثبت نشده است.' : 'No clinical notes recorded.')}
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bilingual Editor Content Language Switcher */}
            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
              <span className="text-[11px] font-medium text-slate-400">
                {isFa ? 'زبان محتوای ویرایش:' : 'Editing language:'}
              </span>
              <div
                role="group"
                aria-label={isFa ? 'انتخاب زبان محتوا برای ویرایش' : 'Select content language to edit'}
                className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950 p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setEditLang('fa')}
                  aria-pressed={editLang === 'fa'}
                  className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                    editLang === 'fa'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  فارسی (FA)
                </button>
                <button
                  type="button"
                  onClick={() => setEditLang('en')}
                  aria-pressed={editLang === 'en'}
                  className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                    editLang === 'en'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>

            {/* Title (FA or EN) */}
            <div>
              <label
                htmlFor="edit-region-title"
                className="block text-xs font-medium text-slate-300"
              >
                {isEditFa
                  ? isFa
                    ? 'عنوان فارسی بخش'
                    : 'Persian Title (FA)'
                  : isFa
                    ? 'عنوان انگلیسی بخش'
                    : 'English Title (EN)'}
              </label>
              <input
                id="edit-region-title"
                type="text"
                dir={isEditFa ? 'rtl' : 'ltr'}
                value={editTitle}
                onChange={(e) =>
                  onUpdateRegion(
                    region.id,
                    isEditFa ? { title_fa: e.target.value } : { title_en: e.target.value },
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
              {!editTitle.trim() && (
                <p className="mt-1 text-[11px] text-rose-400">
                  {isFa ? 'عنوان بخش نمی‌تواند خالی باشد.' : 'Region title cannot be empty.'}
                </p>
              )}
            </div>

            {/* Latin Name & Category */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-region-latin"
                  className="block text-xs font-medium text-slate-300"
                >
                  {isFa ? 'نام لاتین' : 'Latin Name'}
                </label>
                <input
                  id="edit-region-latin"
                  type="text"
                  dir="ltr"
                  value={region.latinName}
                  onChange={(e) =>
                    onUpdateRegion(region.id, { latinName: e.target.value })
                  }
                  className="font-latin mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-region-category"
                  className="block text-xs font-medium text-slate-300"
                >
                  {isFa ? 'دسته‌بندی آناتومیک' : 'Anatomical Category'}
                </label>
                <select
                  id="edit-region-category"
                  value={region.category}
                  onChange={(e) =>
                    onUpdateRegion(region.id, {
                      category: e.target.value as BrainCategory,
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                >
                  {BRAIN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {isFa
                        ? `${CATEGORY_LABELS[cat].fa} (${cat})`
                        : CATEGORY_LABELS[cat].en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label
                htmlFor="edit-region-color"
                className="block text-xs font-medium text-slate-300"
              >
                {isFa ? 'رنگ مش سه‌بعدی' : '3D Mesh Color'}
              </label>
              <div className="mt-1.5 flex items-center gap-2.5">
                <input
                  id="edit-region-color"
                  type="color"
                  value={region.color}
                  onChange={(e) =>
                    onUpdateRegion(region.id, { color: e.target.value })
                  }
                  className="h-9 w-12 cursor-pointer rounded-md border border-slate-700 bg-slate-900 p-0.5"
                />
                <span className="font-mono-nums text-xs text-slate-300" dir="ltr">
                  {region.color.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onUpdateRegion(region.id, { color: hex })}
                    aria-label={isFa ? `انتخاب رنگ ${hex}` : `Select color ${hex}`}
                    className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
                      region.color.toLowerCase() === hex.toLowerCase()
                        ? 'border-white ring-2 ring-amber-400/60'
                        : 'border-white/20'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="edit-region-summary"
                className="block text-xs font-medium text-slate-300"
              >
                {isEditFa
                  ? isFa
                    ? 'خلاصه و توضیحات (فارسی)'
                    : 'Summary (FA)'
                  : isFa
                    ? 'خلاصه و توضیحات (انگلیسی)'
                    : 'Summary (EN)'}
              </label>
              <textarea
                id="edit-region-summary"
                rows={3}
                dir={isEditFa ? 'rtl' : 'ltr'}
                value={editSummary}
                onChange={(e) =>
                  onUpdateRegion(
                    region.id,
                    isEditFa ? { summary_fa: e.target.value } : { summary_en: e.target.value },
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs leading-6 text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Dynamic Functions List */}
            <div>
              <span className="block text-xs font-medium text-slate-300">
                {isEditFa
                  ? isFa
                    ? 'فهرست عملکردها (فارسی)'
                    : 'Key Functions (FA)'
                  : isFa
                    ? 'فهرست عملکردها (انگلیسی)'
                    : 'Key Functions (EN)'}
              </span>
              <div className="mt-2 space-y-2">
                {editFunctions.map((fn, idx) => (
                  <div
                    key={`${region.id}-edit-fn-${editLang}-${idx}`}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      dir={isEditFa ? 'rtl' : 'ltr'}
                      value={fn}
                      aria-label={
                        isFa ? `عملکرد شماره ${idx + 1}` : `Function ${idx + 1}`
                      }
                      onChange={(e) => handleFunctionChange(idx, e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFunction(idx)}
                      aria-label={
                        isFa ? `حذف عملکرد "${fn}"` : `Remove function "${fn}"`
                      }
                      className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:border-rose-500/40 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddFunction} className="mt-2.5 flex items-center gap-1.5">
                <input
                  type="text"
                  dir={isEditFa ? 'rtl' : 'ltr'}
                  value={newFunctionText}
                  onChange={(e) => setNewFunctionText(e.target.value)}
                  placeholder={
                    isFa ? 'افزودن عملکرد جدید...' : 'Add new function...'
                  }
                  aria-label={isFa ? 'متن عملکرد جدید' : 'New function text'}
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/15 px-2.5 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-400/25"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isFa ? 'افزودن' : 'Add'}</span>
                </button>
              </form>
            </div>

            {/* Clinical Notes */}
            <div>
              <label
                htmlFor="edit-region-clinical"
                className="block text-xs font-medium text-slate-300"
              >
                {isEditFa
                  ? isFa
                    ? 'نکات بالینی و اختلالات (فارسی)'
                    : 'Clinical Notes (FA)'
                  : isFa
                    ? 'نکات بالینی و اختلالات (انگلیسی)'
                    : 'Clinical Notes (EN)'}
              </label>
              <textarea
                id="edit-region-clinical"
                rows={3}
                dir={isEditFa ? 'rtl' : 'ltr'}
                value={editClinical}
                onChange={(e) =>
                  onUpdateRegion(
                    region.id,
                    isEditFa
                      ? { clinicalNotes_fa: e.target.value }
                      : { clinicalNotes_en: e.target.value },
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs leading-6 text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <p className="border-t border-slate-800 pt-3 text-[11px] text-slate-400">
              {isFa
                ? 'تمامی تغییرات به‌صورت خودکار در حافظه مرورگر (localStorage) ذخیره می‌شوند.'
                : 'All edits are automatically saved to browser localStorage.'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
