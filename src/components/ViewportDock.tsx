import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Focus,
  Layers,
  RotateCcw,
  ScanEye,
} from 'lucide-react';
import { Language } from '../types/brain';

interface ViewportDockProps {
  language: Language;
  cortexOpacity: number;
  onCortexOpacityChange: (value: number) => void;
  explodeAmount: number;
  onExplodeAmountChange: (value: number) => void;
  isolated: boolean;
  hasSelection: boolean;
  onToggleIsolated: () => void;
  onResetCamera: () => void;
}

export const ViewportDock: React.FC<ViewportDockProps> = ({
  language,
  cortexOpacity,
  onCortexOpacityChange,
  explodeAmount,
  onExplodeAmountChange,
  isolated,
  hasSelection,
  onToggleIsolated,
  onResetCamera,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const isFa = language === 'fa';
  const opacityPercent = Math.round(cortexOpacity * 100);
  const explodePercent = Math.round(explodeAmount * 100);
  const isXRayActive = cortexOpacity <= 0.3;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex flex-col items-center px-3">
      {/* Collapse / Expand toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        className="pointer-events-auto mb-1 flex items-center gap-1 rounded-t-lg border border-b-0 border-slate-700/80 bg-slate-900/95 px-3 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:text-white"
      >
        {collapsed ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isFa ? 'نمایش ابزارهای نما' : 'Show Controls'}</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isFa ? 'پنهان کردن ابزارها' : 'Hide Controls'}</span>
          </>
        )}
      </button>

      {!collapsed && (
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2.5 rounded-xl border border-slate-700/80 bg-slate-900/95 px-4 py-2.5 shadow-xl">
          {/* Cortex Opacity Slider (X-Ray Mode) */}
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="cortex-opacity-slider"
              className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-200"
            >
              <ScanEye className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <span>{isFa ? 'شفافیت قشر' : 'Cortex Opacity'}</span>
            </label>

            <input
              id="cortex-opacity-slider"
              type="range"
              min={0.08}
              max={1}
              step={0.01}
              value={cortexOpacity}
              onChange={(e) => onCortexOpacityChange(parseFloat(e.target.value))}
              aria-label={isFa ? 'شفافیت قشر بیرونی مغز' : 'Cortex opacity slider'}
              className="atlas-slider w-24 sm:w-28"
            />

            <span
              className="font-mono-nums w-9 text-center text-xs font-semibold text-cyan-300"
              dir="ltr"
            >
              {opacityPercent}%
            </span>

            <button
              type="button"
              onClick={() => onCortexOpacityChange(isXRayActive ? 1 : 0.15)}
              aria-pressed={isXRayActive}
              className={`whitespace-nowrap rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                isXRayActive
                  ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              {isFa ? 'اشعه ایکس' : 'X-Ray'}
            </button>
          </div>

          <div className="hidden h-5 w-px bg-slate-700 xl:block" aria-hidden="true" />

          {/* Continuous Exploded View Slider (0% to 100%) */}
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="explode-view-slider"
              className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-200"
            >
              <Layers className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              <span>{isFa ? 'نمای انفجاری' : 'Exploded View'}</span>
            </label>

            <input
              id="explode-view-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={explodeAmount}
              onChange={(e) => onExplodeAmountChange(parseFloat(e.target.value))}
              aria-label={isFa ? 'لغزنده نمای انفجاری مغز' : 'Exploded view slider'}
              className="atlas-slider w-24 sm:w-28"
            />

            <span
              className="font-mono-nums w-9 text-center text-xs font-semibold text-emerald-300"
              dir="ltr"
            >
              {explodePercent}%
            </span>

            <button
              type="button"
              onClick={() => onExplodeAmountChange(explodeAmount >= 0.5 ? 0 : 1)}
              aria-pressed={explodeAmount > 0.05}
              className={`whitespace-nowrap rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                explodeAmount > 0.05
                  ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              {explodeAmount >= 0.5
                ? isFa
                  ? 'جمع‌کردن'
                  : 'Assemble'
                : isFa
                  ? 'جداسازی ۱۰۰٪'
                  : 'Explode 100%'}
            </button>
          </div>

          <div className="hidden h-5 w-px bg-slate-700 2xl:block" aria-hidden="true" />

          {/* Isolate Selected Part & Reset Camera */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleIsolated}
              disabled={!hasSelection}
              aria-pressed={isolated && hasSelection}
              title={
                !hasSelection
                  ? isFa
                    ? 'ابتدا یک بخش را انتخاب کنید'
                    : 'Select a brain region first'
                  : undefined
              }
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-45 ${
                isolated && hasSelection
                  ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                  : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <Focus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isFa ? 'ایزوله‌سازی بخش' : 'Isolate Part'}</span>
            </button>

            <button
              type="button"
              onClick={onResetCamera}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isFa ? 'بازنشانی دوربین' : 'Reset Camera'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
