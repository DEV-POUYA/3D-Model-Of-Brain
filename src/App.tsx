import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  GraduationCap,
  ListTree,
  PanelLeftOpen,
  X,
  XCircle,
} from 'lucide-react';
import { INITIAL_BRAIN_REGIONS } from './data/initialBrainData';
import { AppMode, BrainRegion, BrainRegionId, Language } from './types/brain';
import {
  loadRegionsFromStorage,
  parseAndValidateRegionsJson,
  saveRegionsToStorage,
  serializeRegionsToJson,
} from './utils/brainStorage';
import {
  QuizScope,
  QuizState,
  advanceQuizQuestion,
  createInitialQuizState,
  evaluateQuizGuess,
  revealQuizAnswer,
  useQuizHint,
} from './utils/quizEngine';
import { HeaderBar } from './components/HeaderBar';
import { RegionSidebar } from './components/RegionSidebar';
import { RegionInspector } from './components/RegionInspector';
import { QuizPanel } from './components/QuizPanel';
import { ViewportDock } from './components/ViewportDock';
import { BrainScene } from './components/BrainScene';

interface BannerNotice {
  type: 'success' | 'error';
  message: string;
}

export default function App() {
  const [regions, setRegions] = useState<BrainRegion[]>(() =>
    loadRegionsFromStorage(),
  );
  const [language, setLanguage] = useState<Language>('fa');
  const [mode, setMode] = useState<AppMode>('view');
  const [selectedId, setSelectedId] = useState<BrainRegionId | null>('frontal');
  const [cortexOpacity, setCortexOpacity] = useState<number>(1);
  const [explodeAmount, setExplodeAmount] = useState<number>(0);
  const [isolated, setIsolated] = useState<boolean>(false);
  const [focusRequestTick, setFocusRequestTick] = useState<number>(0);
  const [resetCameraTick, setResetCameraTick] = useState<number>(0);
  const [notice, setNotice] = useState<BannerNotice | null>(null);
  const [quizState, setQuizState] = useState<QuizState>(() =>
    createInitialQuizState(INITIAL_BRAIN_REGIONS, 'all'),
  );
  const [quizWrongId, setQuizWrongId] = useState<BrainRegionId | null>(null);

  // Mobile drawer state (only used below lg 1024px breakpoint)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true,
  );
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'list' | 'inspector'>('none');

  const isFa = language === 'fa';
  const isQuizMode = mode === 'quiz';

  // Sync HTML dir & lang attributes with active language
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dir = isFa ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isFa, language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setMobileDrawer('none');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Auto-persist to localStorage on every region change
  useEffect(() => {
    saveRegionsToStorage(regions);
  }, [regions]);

  // Clear isolation automatically if nothing is selected
  useEffect(() => {
    if (!selectedId && isolated) {
      setIsolated(false);
    }
  }, [selectedId, isolated]);

  // Auto-dismiss transient feedback notices
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Auto-clear wrong-click highlight in Quiz mode
  useEffect(() => {
    if (!quizWrongId) return;
    const timer = window.setTimeout(() => setQuizWrongId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [quizWrongId]);

  const selectedRegion = useMemo(
    () => (selectedId ? regions.find((r) => r.id === selectedId) ?? null : null),
    [regions, selectedId],
  );

  const quizTargetRegion = useMemo(
    () => regions.find((r) => r.id === quizState.targetId) ?? regions[0],
    [regions, quizState.targetId],
  );

  const handleModeChange = useCallback(
    (nextMode: AppMode) => {
      setMode(nextMode);
      setMobileDrawer('none');
      setQuizWrongId(null);
      if (nextMode === 'quiz') {
        setSelectedId(null);
        setIsolated(false);
        setResetCameraTick((t) => t + 1);
      } else if (!selectedId) {
        setSelectedId('frontal');
      }
    },
    [selectedId],
  );

  const handleSelectRegion = useCallback(
    (id: BrainRegionId) => {
      setSelectedId(id);
      setFocusRequestTick((t) => t + 1);
      if (!isDesktop) {
        setMobileDrawer('inspector');
      }
    },
    [isDesktop],
  );

  const handleSceneSelectRegion = useCallback(
    (id: BrainRegionId) => {
      if (mode !== 'quiz') {
        handleSelectRegion(id);
        return;
      }
      if (quizState.status !== 'answering') return;

      const { nextState, isCorrect } = evaluateQuizGuess(quizState, id);
      setQuizState(nextState);
      if (isCorrect) {
        setQuizWrongId(null);
        setSelectedId(id);
        setFocusRequestTick((t) => t + 1);
      } else {
        setQuizWrongId(id);
      }
    },
    [mode, quizState, handleSelectRegion],
  );

  const handleQuizChangeScope = useCallback(
    (scope: QuizScope) => {
      setQuizWrongId(null);
      setSelectedId(null);
      setIsolated(false);
      setQuizState((prev) =>
        createInitialQuizState(regions, scope, Math.random, prev.bestStreak),
      );
      setResetCameraTick((t) => t + 1);
    },
    [regions],
  );

  const handleQuizReveal = useCallback(() => {
    setQuizWrongId(null);
    setQuizState((prev) => revealQuizAnswer(prev));
    const target = regions.find((r) => r.id === quizState.targetId);
    setSelectedId(quizState.targetId);
    if (target?.isInternal && cortexOpacity > 0.35 && explodeAmount < 0.35) {
      setCortexOpacity(0.15);
    }
    setFocusRequestTick((t) => t + 1);
  }, [regions, quizState.targetId, cortexOpacity, explodeAmount]);

  const handleQuizNext = useCallback(() => {
    setQuizWrongId(null);
    setSelectedId(null);
    setIsolated(false);
    setQuizState((prev) => advanceQuizQuestion(prev, regions));
    setResetCameraTick((t) => t + 1);
  }, [regions]);

  const handleQuizRestart = useCallback(() => {
    setQuizWrongId(null);
    setSelectedId(null);
    setIsolated(false);
    setQuizState((prev) => createInitialQuizState(regions, prev.scope));
    setResetCameraTick((t) => t + 1);
  }, [regions]);

  const handleUpdateRegion = useCallback(
    (id: BrainRegionId, patch: Partial<BrainRegion>) => {
      setRegions((prev) =>
        prev.map((region) =>
          region.id === id ? { ...region, ...patch } : region,
        ),
      );
    },
    [],
  );

  const handleExportJson = useCallback(() => {
    const json = serializeRegionsToJson(regions);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brain-anatomy-bilingual-dataset.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice({
      type: 'success',
      message: isFa
        ? 'فایل JSON دوزبانه مجموعه داده‌های مغز با موفقیت ذخیره شد.'
        : 'Bilingual brain dataset exported to JSON successfully.',
    });
  }, [regions, isFa]);

  const handleImportJsonFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const result = parseAndValidateRegionsJson(text, INITIAL_BRAIN_REGIONS);
        if (!result.ok) {
          setNotice({
            type: 'error',
            message: isFa ? result.error_fa : result.error_en,
          });
          return;
        }
        setRegions(result.regions);
        setNotice({
          type: 'success',
          message: isFa
            ? `اطلاعات ${result.updatedCount} ساختار مغزی با موفقیت بارگذاری و ذخیره شد.`
            : `Loaded and saved ${result.updatedCount} anatomical brain regions.`,
        });
      };
      reader.onerror = () => {
        setNotice({
          type: 'error',
          message: isFa
            ? 'خواندن فایل انتخاب‌شده با خطا مواجه شد.'
            : 'Failed to read the selected JSON file.',
        });
      };
      reader.readAsText(file, 'utf-8');
    },
    [isFa],
  );

  const handleResetDefaults = useCallback(() => {
    const fresh = INITIAL_BRAIN_REGIONS.map((r) => ({
      ...r,
      functions_fa: [...r.functions_fa],
      functions_en: [...r.functions_en],
    }));
    setRegions(fresh);
    setNotice({
      type: 'success',
      message: isFa
        ? 'تمامی ۱۷ بخش به اطلاعات پیش‌فرض دوزبانه بازنشانی شدند.'
        : 'All 17 brain structures were reset to bilingual defaults.',
    });
  }, [isFa]);

  const handleToggleIsolated = useCallback(() => {
    if (!selectedId) return;
    setIsolated((prev) => !prev);
  }, [selectedId]);

  const handleResetCamera = useCallback(() => {
    setResetCameraTick((t) => t + 1);
  }, []);

  // Keyboard shortcuts when not focused in form inputs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Escape') {
        setSelectedId(null);
        setIsolated(false);
      } else if (e.key.toLowerCase() === 'r') {
        handleResetCamera();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleResetCamera]);

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className={`${isFa ? 'font-fa' : 'font-en'} flex h-screen w-screen flex-col overflow-hidden bg-[#0b1018] text-slate-100`}
    >
      <HeaderBar
        language={language}
        onLanguageChange={setLanguage}
        mode={mode}
        onModeChange={handleModeChange}
        onExportJson={handleExportJson}
        onImportJsonFile={handleImportJsonFile}
        onResetDefaults={handleResetDefaults}
      />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`z-40 flex items-center justify-between gap-3 border-b px-4 py-2 text-xs font-medium ${
            notice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
              : 'border-rose-500/30 bg-rose-950/90 text-rose-200'
          }`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label={isFa ? 'بستن پیام' : 'Dismiss notice'}
            className="rounded p-0.5 hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Main Workspace: Directory Sidebar + 3D Stage + Inspector/Editor/Quiz */}
      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Sidebar (Hidden during Anatomy Quiz to prevent directory peeking) */}
        {!isQuizMode && (
          <div className="hidden h-full w-72 shrink-0 lg:block">
            <RegionSidebar
              regions={regions}
              language={language}
              selectedId={selectedId}
              onSelectRegion={handleSelectRegion}
            />
          </div>
        )}

        {/* Central 3D Viewport */}
        <div className="relative h-full min-w-0 flex-1">
          {/* Mobile top overlay controls */}
          {isQuizMode ? (
            <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-2 lg:hidden">
              <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-lg">
                {quizState.status === 'correct' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                ) : quizState.status === 'answering' && quizWrongId ? (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                ) : (
                  <GraduationCap className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-slate-100">
                    {isFa ? quizTargetRegion.title_fa : quizTargetRegion.title_en}
                  </div>
                  <div className="font-mono-nums text-[10px] text-slate-400">
                    {isFa
                      ? `امتیاز ${quizState.score}/${quizState.questionsAnswered}`
                      : `Score ${quizState.score}/${quizState.questionsAnswered}`}
                  </div>
                </div>
                {quizState.status !== 'answering' && (
                  <button
                    type="button"
                    onClick={handleQuizNext}
                    className="shrink-0 whitespace-nowrap rounded-md bg-emerald-400 px-2.5 py-1 text-[11px] font-bold text-slate-950"
                  >
                    {isFa ? 'بعدی' : 'Next'}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileDrawer(mobileDrawer === 'inspector' ? 'none' : 'inspector')
                }
                className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs font-medium text-slate-100 shadow-lg"
              >
                <PanelLeftOpen className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span>{isFa ? 'آزمون' : 'Quiz'}</span>
              </button>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setMobileDrawer(mobileDrawer === 'list' ? 'none' : 'list')}
                className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-lg"
              >
                <ListTree className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                <span>{isFa ? 'فهرست بخش‌ها' : 'Regions'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setMobileDrawer(mobileDrawer === 'inspector' ? 'none' : 'inspector')
                }
                className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-lg"
              >
                <PanelLeftOpen className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span>
                  {selectedRegion
                    ? isFa
                      ? selectedRegion.title_fa
                      : selectedRegion.title_en
                    : isFa
                      ? 'جزئیات بخش'
                      : 'Details'}
                </span>
              </button>
            </div>
          )}

          <BrainScene
            regions={regions}
            language={language}
            selectedId={selectedId}
            onSelectRegion={handleSceneSelectRegion}
            cortexOpacity={cortexOpacity}
            explodeAmount={explodeAmount}
            isolated={isolated}
            focusRequestTick={focusRequestTick}
            resetCameraTick={resetCameraTick}
            quizMode={isQuizMode}
            quizHideLabels={isQuizMode && quizState.status === 'answering'}
            quizWrongId={isQuizMode ? quizWrongId : null}
            quizCorrectId={
              isQuizMode && quizState.status !== 'answering' ? quizState.targetId : null
            }
          />

          <ViewportDock
            language={language}
            cortexOpacity={cortexOpacity}
            onCortexOpacityChange={setCortexOpacity}
            explodeAmount={explodeAmount}
            onExplodeAmountChange={setExplodeAmount}
            isolated={isolated}
            hasSelection={Boolean(selectedId)}
            onToggleIsolated={handleToggleIsolated}
            onResetCamera={handleResetCamera}
          />
        </div>

        {/* Desktop Right Drawer (View/Edit Inspector OR Anatomy Quiz Panel) */}
        <div className="hidden h-full w-80 shrink-0 xl:w-96 lg:block">
          {isQuizMode ? (
            <QuizPanel
              quizState={quizState}
              allRegions={regions}
              language={language}
              cortexOpacity={cortexOpacity}
              explodeAmount={explodeAmount}
              onChangeScope={handleQuizChangeScope}
              onUseHint={() => setQuizState((prev) => useQuizHint(prev))}
              onRevealAnswer={handleQuizReveal}
              onNextQuestion={handleQuizNext}
              onRestartQuiz={handleQuizRestart}
              onEnableXRay={() => setCortexOpacity(0.15)}
              onExplodeAll={() => setExplodeAmount(1)}
            />
          ) : (
            <RegionInspector
              region={selectedRegion}
              allRegions={regions}
              language={language}
              mode={mode}
              cortexOpacity={cortexOpacity}
              isolated={isolated}
              onModeChange={handleModeChange}
              onSelectRegion={handleSelectRegion}
              onUpdateRegion={handleUpdateRegion}
              onFocusRegion={() => setFocusRequestTick((t) => t + 1)}
              onEnableXRay={() => setCortexOpacity(0.15)}
              onToggleIsolated={handleToggleIsolated}
            />
          )}
        </div>

        {/* Mobile Overlay Drawers */}
        {!isDesktop && mobileDrawer !== 'none' && (
          <div className="absolute inset-0 z-30 flex bg-black/60 lg:hidden">
            {mobileDrawer === 'list' && !isQuizMode && (
              <div className="relative h-full w-80 max-w-[85vw] shadow-2xl">
                <button
                  type="button"
                  onClick={() => setMobileDrawer('none')}
                  aria-label={isFa ? 'بستن فهرست' : 'Close regions list'}
                  className="absolute end-3 top-3 z-10 rounded-md border border-slate-700 bg-slate-900 p-1 text-slate-300"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <RegionSidebar
                  regions={regions}
                  language={language}
                  selectedId={selectedId}
                  onSelectRegion={(id) => {
                    handleSelectRegion(id);
                  }}
                />
              </div>
            )}

            {mobileDrawer === 'inspector' && (
              <div className="relative ms-auto h-full w-96 max-w-[90vw] shadow-2xl">
                <button
                  type="button"
                  onClick={() => setMobileDrawer('none')}
                  aria-label={
                    isQuizMode
                      ? isFa
                        ? 'بستن پنل آزمون'
                        : 'Close quiz panel'
                      : isFa
                        ? 'بستن پنل جزئیات'
                        : 'Close inspector panel'
                  }
                  className="absolute end-3 top-3 z-10 rounded-md border border-slate-700 bg-slate-900 p-1 text-slate-300"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                {isQuizMode ? (
                  <QuizPanel
                    quizState={quizState}
                    allRegions={regions}
                    language={language}
                    cortexOpacity={cortexOpacity}
                    explodeAmount={explodeAmount}
                    onChangeScope={handleQuizChangeScope}
                    onUseHint={() => setQuizState((prev) => useQuizHint(prev))}
                    onRevealAnswer={handleQuizReveal}
                    onNextQuestion={handleQuizNext}
                    onRestartQuiz={handleQuizRestart}
                    onEnableXRay={() => {
                      setCortexOpacity(0.15);
                      setMobileDrawer('none');
                    }}
                    onExplodeAll={() => {
                      setExplodeAmount(1);
                      setMobileDrawer('none');
                    }}
                  />
                ) : (
                  <RegionInspector
                    region={selectedRegion}
                    allRegions={regions}
                    language={language}
                    mode={mode}
                    cortexOpacity={cortexOpacity}
                    isolated={isolated}
                    onModeChange={handleModeChange}
                    onSelectRegion={handleSelectRegion}
                    onUpdateRegion={handleUpdateRegion}
                    onFocusRegion={() => {
                      setFocusRequestTick((t) => t + 1);
                      setMobileDrawer('none');
                    }}
                    onEnableXRay={() => {
                      setCortexOpacity(0.15);
                      setMobileDrawer('none');
                    }}
                    onToggleIsolated={handleToggleIsolated}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
