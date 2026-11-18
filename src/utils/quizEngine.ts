import { BrainRegion, BrainRegionId } from '../types/brain';

export type QuizScope = 'all' | 'outer' | 'internal';

export type QuizQuestionStatus = 'answering' | 'correct' | 'revealed';

export type QuizOutcome = 'first-try' | 'corrected' | 'revealed';

export interface QuizHistoryEntry {
  targetId: BrainRegionId;
  outcome: QuizOutcome;
  wrongAttempts: number;
  hintUsed: boolean;
}

export interface QuizState {
  scope: QuizScope;
  targetId: BrainRegionId;
  remainingPool: BrainRegionId[];
  status: QuizQuestionStatus;
  lastGuessedId: BrainRegionId | null;
  wrongAttemptsForCurrent: number;
  hintUsedForCurrent: boolean;
  score: number;
  firstTryCount: number;
  questionsAnswered: number;
  streak: number;
  bestStreak: number;
  history: QuizHistoryEntry[];
}

export function getQuizEligibleRegions(
  regions: BrainRegion[],
  scope: QuizScope,
): BrainRegion[] {
  if (scope === 'outer') {
    return regions.filter((r) => !r.isInternal);
  }
  if (scope === 'internal') {
    return regions.filter((r) => r.isInternal);
  }
  return regions;
}

export function shuffleIds(
  ids: BrainRegionId[],
  rng: () => number = Math.random,
): BrainRegionId[] {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function pickNextQuizTarget(
  regions: BrainRegion[],
  scope: QuizScope,
  previousTargetId: BrainRegionId | null,
  currentPool: BrainRegionId[],
  rng: () => number = Math.random,
): { targetId: BrainRegionId; remainingPool: BrainRegionId[] } {
  const eligible = getQuizEligibleRegions(regions, scope);
  const fallbackList = eligible.length > 0 ? eligible : regions;
  const eligibleIds = fallbackList.map((r) => r.id);

  let pool = currentPool.filter((id) => eligibleIds.includes(id));
  if (pool.length === 0) {
    pool = shuffleIds(eligibleIds, rng);
    if (pool.length > 1 && previousTargetId && pool[0] === previousTargetId) {
      // Avoid repeating the exact same region back-to-back across deck reshuffles
      const swapIdx = 1 + Math.floor(rng() * (pool.length - 1));
      const tmp = pool[0];
      pool[0] = pool[swapIdx];
      pool[swapIdx] = tmp;
    }
  }

  const [targetId, ...remainingPool] = pool;
  return { targetId, remainingPool };
}

export function createInitialQuizState(
  regions: BrainRegion[],
  scope: QuizScope = 'all',
  rng: () => number = Math.random,
  preservedBestStreak = 0,
): QuizState {
  const { targetId, remainingPool } = pickNextQuizTarget(
    regions,
    scope,
    null,
    [],
    rng,
  );
  return {
    scope,
    targetId,
    remainingPool,
    status: 'answering',
    lastGuessedId: null,
    wrongAttemptsForCurrent: 0,
    hintUsedForCurrent: false,
    score: 0,
    firstTryCount: 0,
    questionsAnswered: 0,
    streak: 0,
    bestStreak: preservedBestStreak,
    history: [],
  };
}

export function evaluateQuizGuess(
  state: QuizState,
  guessedId: BrainRegionId,
): { nextState: QuizState; isCorrect: boolean } {
  if (state.status !== 'answering') {
    return { nextState: state, isCorrect: guessedId === state.targetId };
  }

  if (guessedId === state.targetId) {
    const isFirstTry = state.wrongAttemptsForCurrent === 0;
    const nextStreak = state.streak + 1;
    const nextBestStreak = Math.max(state.bestStreak, nextStreak);
    const outcome: QuizOutcome = isFirstTry ? 'first-try' : 'corrected';
    return {
      isCorrect: true,
      nextState: {
        ...state,
        status: 'correct',
        lastGuessedId: guessedId,
        score: state.score + 1,
        firstTryCount: state.firstTryCount + (isFirstTry ? 1 : 0),
        questionsAnswered: state.questionsAnswered + 1,
        streak: nextStreak,
        bestStreak: nextBestStreak,
        history: [
          {
            targetId: state.targetId,
            outcome,
            wrongAttempts: state.wrongAttemptsForCurrent,
            hintUsed: state.hintUsedForCurrent,
          },
          ...state.history,
        ],
      },
    };
  }

  return {
    isCorrect: false,
    nextState: {
      ...state,
      lastGuessedId: guessedId,
      wrongAttemptsForCurrent: state.wrongAttemptsForCurrent + 1,
      streak: 0,
    },
  };
}

export function revealQuizAnswer(state: QuizState): QuizState {
  if (state.status !== 'answering') return state;
  return {
    ...state,
    status: 'revealed',
    lastGuessedId: state.targetId,
    questionsAnswered: state.questionsAnswered + 1,
    streak: 0,
    history: [
      {
        targetId: state.targetId,
        outcome: 'revealed',
        wrongAttempts: state.wrongAttemptsForCurrent,
        hintUsed: state.hintUsedForCurrent,
      },
      ...state.history,
    ],
  };
}

export function useQuizHint(state: QuizState): QuizState {
  if (state.status !== 'answering' || state.hintUsedForCurrent) return state;
  return {
    ...state,
    hintUsedForCurrent: true,
  };
}

export function advanceQuizQuestion(
  state: QuizState,
  regions: BrainRegion[],
  rng: () => number = Math.random,
): QuizState {
  const { targetId, remainingPool } = pickNextQuizTarget(
    regions,
    state.scope,
    state.targetId,
    state.remainingPool,
    rng,
  );
  return {
    ...state,
    targetId,
    remainingPool,
    status: 'answering',
    lastGuessedId: null,
    wrongAttemptsForCurrent: 0,
    hintUsedForCurrent: false,
  };
}

export function calculateQuizAccuracy(state: QuizState): number {
  if (state.questionsAnswered === 0) return 0;
  return Math.round((state.score / state.questionsAnswered) * 100);
}
