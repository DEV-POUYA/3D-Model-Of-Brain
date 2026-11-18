import React, { useRef, useState } from 'react';
import {
  Brain,
  Download,
  Eye,
  GraduationCap,
  Languages,
  Pencil,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { AppMode, Language } from '../types/brain';

interface HeaderBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onExportJson: () => void;
  onImportJsonFile: (file: File) => void;
  onResetDefaults: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  language,
  onLanguageChange,
  mode,
  onModeChange,
  onExportJson,
  onImportJsonFile,
  onResetDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const isFa = language === 'fa';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJsonFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-1.5 border-b border-slate-800 bg-[#0d131f] px-2.5 sm:gap-4 sm:px-4 lg:px-6">
      {/* Zone 1: Brand Title */}
      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 min-[420px]:flex">
          <Brain className="h-4 w-4" aria-hidden="true" />
        </div>
        <h1 className="hidden truncate whitespace-nowrap text-xs font-bold tracking-tight text-slate-100 sm:block sm:text-base">
          {isFa ? 'اطلس سه‌بعدی مغز انسان' : '3D Human Brain Explorer'}
        </h1>
        <span className="sr-only sm:hidden">
          {isFa ? 'اطلس سه‌بعدی مغز انسان' : '3D Human Brain Explorer'}
        </span>
      </div>

      {/* Zone 2: Mode Switch & Language Switcher */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div
          role="group"
          aria-label={isFa ? 'تغییر حالت نمایش و ویرایش' : 'Toggle View and Edit mode'}
          className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 sm:gap-1 sm:p-1"
        >
          <button
            type="button"
            onClick={() => onModeChange('view')}
            aria-pressed={mode === 'view'}
            className={`flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs ${
              mode === 'view'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {isFa ? 'حالت نمایش' : 'View Mode'}
            </span>
            <span className="sm:hidden">{isFa ? 'نمایش' : 'View'}</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('edit')}
            aria-pressed={mode === 'edit'}
            className={`flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs ${
              mode === 'edit'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {isFa ? 'حالت ویرایش' : 'Edit Mode'}
            </span>
            <span className="sm:hidden">{isFa ? 'ویرایش' : 'Edit'}</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('quiz')}
            aria-pressed={mode === 'quiz'}
            className={`flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs ${
              mode === 'quiz'
                ? 'bg-emerald-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {isFa ? 'آزمون آناتومی' : 'Anatomy Quiz'}
            </span>
            <span className="sm:hidden">{isFa ? 'آزمون' : 'Quiz'}</span>
          </button>
        </div>

        {/* Language Switcher (FA / EN) */}
        <div
          role="group"
          aria-label={isFa ? 'تغییر زبان رابط کاربری' : 'Switch language'}
          className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 sm:p-1"
        >
          <Languages
            className="mx-1 hidden h-3.5 w-3.5 text-slate-400 md:block"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => onLanguageChange('fa')}
            aria-pressed={language === 'fa'}
            className={`whitespace-nowrap rounded-md px-1.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 sm:px-2 ${
              language === 'fa'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FA
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            aria-pressed={language === 'en'}
            className={`whitespace-nowrap rounded-md px-1.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-cyan-400 sm:px-2 ${
              language === 'en'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Zone 3: Export / Import / Reset Dataset */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onExportJson}
          aria-label={isFa ? 'خروجی JSON' : 'Export JSON'}
          title={isFa ? 'خروجی JSON' : 'Export JSON'}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-cyan-400 sm:px-3"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
          <span className="hidden md:inline">
            {isFa ? 'خروجی JSON' : 'Export JSON'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={isFa ? 'ورودی JSON' : 'Import JSON'}
          title={isFa ? 'ورودی JSON' : 'Import JSON'}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-cyan-400 sm:px-3"
        >
          <Upload className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          <span className="hidden md:inline">
            {isFa ? 'ورودی JSON' : 'Import JSON'}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          aria-label={isFa ? 'انتخاب فایل JSON' : 'Choose JSON file'}
          onChange={handleFileChange}
          className="hidden"
        />

        {confirmReset ? (
          <div className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-950/80 px-2 py-1">
            <button
              type="button"
              onClick={() => {
                onResetDefaults();
                setConfirmReset(false);
              }}
              className="whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold text-rose-200 hover:bg-rose-500/20"
            >
              {isFa ? 'تایید' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] text-slate-300 hover:bg-slate-800"
            >
              {isFa ? 'لغو' : 'Cancel'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            aria-label={isFa ? 'بازنشانی داده‌ها' : 'Reset Dataset'}
            title={isFa ? 'بازنشانی به داده‌های پیش‌فرض' : 'Reset to default dataset'}
            className="hidden lg:flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isFa ? 'بازنشانی' : 'Reset'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
