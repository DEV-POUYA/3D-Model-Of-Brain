import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  Layers,
  Lightbulb,
  RotateCcw,
  ScanEye,
  XCircle,
} from 'lucide-react';
import {
  BrainRegion,
  CATEGORY_LABELS,
  Language,
} from '../types/brain';
import {
  QuizScope,
  QuizState,
  calculateQuizAccuracy,
} from '../utils/quizEngine';

interface QuizPanelProps {
  quizState: QuizState;
  allRegions: BrainRegion[];
  language: Language;
  cortexOpacity: number;
  explodeAmount: number;
  onChangeScope: (scope: QuizScope) => void;
  onUseHint: () => void;
  onRevealAnswer: () => void;
  onNextQuestion: () => void;
  onRestartQuiz: () => void;
  onEnableXRay: () => void;
  onExplodeAll: () => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({
  quizState,
  allRegions,
  language,
  cortexOpacity,
  explodeAmount,
  onChangeScope,
  onUseHint,
  onRevealAnswer,
  onNextQuestion,
  onRestartQuiz,
  onEnableXRay,
  onExplodeAll,
}) => {
  const isFa = language === 'fa';
  const targetRegion =
    allRegions.find((r) => r.id === quizState.targetId) ?? allRegions[0];
  const lastGuessedRegion = quizState.lastGuessedId
    ? allRegions.find((r) => r.id === quizState.lastGuessedId) ?? null
    : null;

  const accuracy = calculateQuizAccuracy(quizState);
  const targetTitle = isFa ? targetRegion.title_fa : targetRegion.title_en;
  const targetSummary = isFa ? targetRegion.summary_fa : targetRegion.summary_en;
  const targetHintFn = (
    isFa ? targetRegion.functions_fa : targetRegion.functions_en
  )[0];
  const needsDepthAid =
    targetRegion.isInternal && cortexOpacity > 0.35 && explodeAmount < 0.35;

  const NextIcon = isFa ? ArrowLeft : ArrowRight;

  const scopeOptions: Array<{ value: QuizScope; labelFa: string; labelEn: string }> = [
    { value: 'all', labelFa: 'همه (۱۷)', labelEn: 'All (17)' },
    { value: 'outer', labelFa: 'بیرونی و ساقه (۸)', labelEn: 'Outer & Stem (8)' },
    { value: 'internal', labelFa: 'ساختار عمقی (۹)', labelEn: 'Deep Internal (9)' },
  ];

  return (
    <aside
      aria-label={isFa ? 'پنل آزمون آناتومی مغز' : 'Anatomy Quiz panel'}
      data-testid="quiz-panel"
      data-quiz-target={quizState.targetId}
      data-quiz-status={quizState.status}
      className="flex h-full flex-col border-s border-slate-800 bg-[#0d131f]"
    >
      {/* Header & Tabular Scoreboard */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center justify-between gap-3 pe-10 lg:pe-0">
          <div>
            <h2 className="text-base font-bold text-slate-50">
              {isFa ? 'آزمون تشخیص آناتومی' : 'Anatomy Quiz'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {isFa
                ? 'ساختار خواسته‌شده را روی مدل سه‌بعدی کلیک کنید.'
                : 'Click the requested structure on the 3D brain model.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRestartQuiz}
            aria-label={isFa ? 'شروع مجدد آزمون' : 'Restart quiz'}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>{isFa ? 'شروع مجدد' : 'Restart'}</span>
          </button>
        </div>

        {/* Clean Tabular Metrics Strip (Zero-pill discipline) */}
        <div className="mt-3.5 grid grid-cols-3 divide-x divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/60 rtl:divide-x-reverse">
          <div className="px-3 py-2 text-center">
            <div className="text-[11px] text-slate-400">
              {isFa ? 'امتیاز' : 'Score'}
            </div>
            <div
              data-testid="quiz-score"
              className="font-mono-nums mt-0.5 text-sm font-bold text-emerald-300"
              dir="ltr"
            >
              {quizState.score}/{quizState.questionsAnswered}
            </div>
          </div>
          <div className="px-3 py-2 text-center">
            <div className="text-[11px] text-slate-400">
              {isFa ? 'دقت' : 'Accuracy'}
            </div>
            <div
              className="font-mono-nums mt-0.5 text-sm font-bold text-cyan-300"
              dir="ltr"
            >
              {accuracy}%
            </div>
          </div>
          <div className="px-3 py-2 text-center">
            <div className="text-[11px] text-slate-400">
              {isFa ? 'زنجیره (بهترین)' : 'Streak (Best)'}
            </div>
            <div
              className="font-mono-nums mt-0.5 text-sm font-bold text-amber-300"
              dir="ltr"
            >
              {quizState.streak} ({quizState.bestStreak})
            </div>
          </div>
        </div>

        {/* Quiz Scope Segmented Control */}
        <div className="mt-3">
          <div
            role="group"
            aria-label={isFa ? 'محدوده سوالات آزمون' : 'Quiz region scope'}
            className="grid grid-cols-3 gap-1 rounded-lg border border-slate-800 bg-slate-900/90 p-1"
          >
            {scopeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeScope(opt.value)}
                aria-pressed={quizState.scope === opt.value}
                className={`whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  quizState.scope === opt.value
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {isFa ? opt.labelFa : opt.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Active Prompt, Feedback & Session Log */}
      <div className="atlas-scroll flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {/* Active Question Prompt */}
        <section className="rounded-xl border border-slate-700/80 bg-slate-900/75 p-4">
          <div className="text-xs font-medium text-emerald-300">
            {isFa ? 'بخش مورد نظر را پیدا کنید' : 'Find this brain region'}
          </div>
          <h3
            data-testid="quiz-target-title"
            className="mt-1.5 text-lg font-bold text-white"
          >
            {targetTitle}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span className="font-latin" dir="ltr">
              {targetRegion.latinName}
            </span>
            {quizState.status !== 'answering' && (
              <>
                <span aria-hidden="true">·</span>
                <span>{CATEGORY_LABELS[targetRegion.category][language]}</span>
              </>
            )}
          </div>

          {/* Helper tip for deep structures hidden behind opaque cortex */}
          {quizState.status === 'answering' && needsDepthAid && (
            <div className="mt-3.5 border-t border-slate-800 pt-3">
              <p className="text-[11px] leading-5 text-slate-400">
                {isFa
                  ? 'این ساختار در عمق مغز قرار دارد. برای مشاهده و کلیک، حالت اشعه ایکس یا نمای انفجاری را فعال کنید:'
                  : 'This is a deep internal structure. Enable X-Ray or Exploded View to inspect and click inside:'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onEnableXRay}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-cyan-500/40 bg-cyan-500/12 px-2.5 py-1.5 text-[11px] font-medium text-cyan-200 hover:bg-cyan-500/20"
                >
                  <ScanEye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isFa ? 'اشعه ایکس (۱۵٪)' : 'X-Ray (15%)'}</span>
                </button>
                <button
                  type="button"
                  onClick={onExplodeAll}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-500/40 bg-emerald-500/12 px-2.5 py-1.5 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/20"
                >
                  <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isFa ? 'جداسازی ۱۰۰٪' : 'Explode 100%'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons while Answering */}
          {quizState.status === 'answering' && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={onUseHint}
                disabled={quizState.hintUsedForCurrent}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:border-amber-400/40 hover:bg-slate-800 disabled:cursor-default disabled:opacity-50"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>
                  {quizState.hintUsedForCurrent
                    ? isFa
                      ? 'راهنما نمایش داده شد'
                      : 'Hint Shown'
                    : isFa
                      ? 'نمایش راهنما'
                      : 'Show Hint'}
                </span>
              </button>

              <button
                type="button"
                onClick={onRevealAnswer}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800"
              >
                <Eye className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                <span>{isFa ? 'نمایش پاسخ' : 'Reveal Answer'}</span>
              </button>
            </div>
          )}

          {/* Hint Callout */}
          {quizState.hintUsedForCurrent && quizState.status === 'answering' && (
            <div
              data-testid="quiz-hint-box"
              className="mt-3 rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs leading-6 text-amber-100"
            >
              <div className="font-semibold text-amber-300">
                {CATEGORY_LABELS[targetRegion.category][language]} ·{' '}
                {targetRegion.isInternal
                  ? isFa
                    ? 'ساختار عمقی و داخلی'
                    : 'Deep Internal Structure'
                  : isFa
                    ? 'ساختار بیرونی / ساقه'
                    : 'Outer Cortex / Stem'}
              </div>
              {targetHintFn && <p className="mt-1 text-slate-200">{targetHintFn}</p>}
            </div>
          )}
        </section>

        {/* Live Feedback Banner */}
        {quizState.status === 'answering' && lastGuessedRegion && (
          <div
            role="status"
            aria-live="polite"
            data-testid="quiz-feedback-wrong"
            className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs leading-6 text-rose-100"
          >
            <XCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-rose-200">
                {isFa ? 'پاسخ نادرست — دوباره تلاش کنید' : 'Incorrect — Try Again'}
              </div>
              <p className="mt-0.5 text-rose-100/90">
                {isFa
                  ? `شما روی «${lastGuessedRegion.title_fa}» کلیک کردید. (تلاش ناموفق: ${quizState.wrongAttemptsForCurrent})`
                  : `You clicked "${lastGuessedRegion.title_en}". (Wrong attempts: ${quizState.wrongAttemptsForCurrent})`}
              </p>
            </div>
          </div>
        )}

        {quizState.status === 'correct' && (
          <div
            role="status"
            aria-live="polite"
            data-testid="quiz-feedback-correct"
            className="space-y-3 rounded-xl border border-emerald-500/45 bg-emerald-950/40 p-4 text-xs leading-6 text-emerald-50"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                aria-hidden="true"
              />
              <div>
                <div className="text-sm font-bold text-emerald-200">
                  {quizState.wrongAttemptsForCurrent === 0
                    ? isFa
                      ? 'آفرین! پاسخ کاملاً صحیح در اولین تلاش'
                      : 'Correct on First Try!'
                    : isFa
                      ? 'صحیح! ساختار را پیدا کردید'
                      : 'Correct! Structure Identified'}
                </div>
                <p className="mt-1 text-slate-200">{targetSummary}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNextQuestion}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-300"
            >
              <span>{isFa ? 'سوال بعدی' : 'Next Question'}</span>
              <NextIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {quizState.status === 'revealed' && (
          <div
            role="status"
            aria-live="polite"
            data-testid="quiz-feedback-revealed"
            className="space-y-3 rounded-xl border border-cyan-500/40 bg-slate-900/90 p-4 text-xs leading-6 text-slate-200"
          >
            <div className="flex items-start gap-2.5">
              <Compass
                className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400"
                aria-hidden="true"
              />
              <div>
                <div className="text-sm font-bold text-cyan-200">
                  {isFa ? `پاسخ: ${targetTitle}` : `Answer Revealed: ${targetTitle}`}
                </div>
                <p className="mt-1 text-slate-300">{targetSummary}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNextQuestion}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-300"
            >
              <span>{isFa ? 'سوال بعدی' : 'Next Question'}</span>
              <NextIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Session Log */}
        <section className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>{isFa ? 'تاریخچه این جلسه' : 'Session History'}</span>
            <span className="font-mono-nums text-slate-400">
              {quizState.history.length}
            </span>
          </div>

          {quizState.history.length === 0 ? (
            <p className="mt-2.5 text-xs text-slate-500">
              {isFa
                ? 'پس از پاسخ به هر سوال، نتیجه آن در اینجا ثبت می‌شود.'
                : 'Answered structures will appear here as you progress.'}
            </p>
          ) : (
            <ul className="mt-2.5 space-y-1.5">
              {quizState.history.slice(0, 12).map((entry, idx) => {
                const region = allRegions.find((r) => r.id === entry.targetId);
                if (!region) return null;
                const name = isFa ? region.title_fa : region.title_en;
                const statusLabel =
                  entry.outcome === 'first-try'
                    ? isFa
                      ? 'تلاش اول'
                      : '1st try'
                    : entry.outcome === 'corrected'
                      ? isFa
                        ? `${entry.wrongAttempts + 1} تلاش`
                        : `${entry.wrongAttempts + 1} tries`
                      : isFa
                        ? 'نمایش پاسخ'
                        : 'Revealed';

                return (
                  <li
                    key={`${entry.targetId}-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-900/50 px-3 py-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {entry.outcome === 'revealed' ? (
                        <Compass
                          className="h-3.5 w-3.5 shrink-0 text-cyan-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 ${
                            entry.outcome === 'first-try'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate font-medium text-slate-200">
                        {name}
                      </span>
                    </div>
                    <span className="font-mono-nums shrink-0 text-[11px] text-slate-400">
                      {statusLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
};
