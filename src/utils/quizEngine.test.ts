import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_BRAIN_REGIONS } from '../data/initialBrainData';
import {
  advanceQuizQuestion,
  calculateQuizAccuracy,
  createInitialQuizState,
  evaluateQuizGuess,
  getQuizEligibleRegions,
  revealQuizAnswer,
  useQuizHint,
} from './quizEngine';

function makeSeededRng(seed = 42): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test('getQuizEligibleRegions filters outer, internal, and all 17 regions accurately', () => {
  const all = getQuizEligibleRegions(INITIAL_BRAIN_REGIONS, 'all');
  const outer = getQuizEligibleRegions(INITIAL_BRAIN_REGIONS, 'outer');
  const internal = getQuizEligibleRegions(INITIAL_BRAIN_REGIONS, 'internal');

  assert.equal(all.length, 17);
  assert.equal(outer.length, 8);
  assert.equal(internal.length, 9);
  assert.equal(
    outer.every((r) => !r.isInternal),
    true,
  );
  assert.equal(
    internal.every((r) => r.isInternal),
    true,
  );
});

test('quiz visits every region in a scope once before repeating', () => {
  const rng = makeSeededRng(123);
  let state = createInitialQuizState(INITIAL_BRAIN_REGIONS, 'outer', rng);
  const seen = new Set<string>([state.targetId]);

  for (let i = 1; i < 8; i++) {
    state = advanceQuizQuestion(state, INITIAL_BRAIN_REGIONS, rng);
    seen.add(state.targetId);
  }
  assert.equal(seen.size, 8);

  // 9th question reshuffles without repeating the 8th target immediately
  const prevTarget = state.targetId;
  state = advanceQuizQuestion(state, INITIAL_BRAIN_REGIONS, rng);
  assert.notEqual(state.targetId, prevTarget);
});

test('evaluateQuizGuess tracks first-try score, wrong attempts, streak, and bestStreak', () => {
  const rng = makeSeededRng(7);
  let state = createInitialQuizState(INITIAL_BRAIN_REGIONS, 'all', rng);
  const firstTarget = state.targetId;

  // Correct on first try
  const firstResult = evaluateQuizGuess(state, firstTarget);
  assert.equal(firstResult.isCorrect, true);
  state = firstResult.nextState;
  assert.equal(state.status, 'correct');
  assert.equal(state.score, 1);
  assert.equal(state.firstTryCount, 1);
  assert.equal(state.streak, 1);
  assert.equal(state.bestStreak, 1);
  assert.equal(state.questionsAnswered, 1);
  assert.equal(calculateQuizAccuracy(state), 100);

  // Duplicate clicks after answering do not double-score
  const dupResult = evaluateQuizGuess(state, firstTarget);
  assert.equal(dupResult.nextState.score, 1);

  // Advance to 2nd question, guess wrong once, then guess right
  state = advanceQuizQuestion(state, INITIAL_BRAIN_REGIONS, rng);
  const secondTarget = state.targetId;
  const wrongId =
    INITIAL_BRAIN_REGIONS.find((r) => r.id !== secondTarget)?.id ?? 'pons';

  const wrongResult = evaluateQuizGuess(state, wrongId);
  assert.equal(wrongResult.isCorrect, false);
  state = wrongResult.nextState;
  assert.equal(state.status, 'answering');
  assert.equal(state.wrongAttemptsForCurrent, 1);
  assert.equal(state.streak, 0);
  assert.equal(state.bestStreak, 1);
  assert.equal(state.lastGuessedId, wrongId);

  const correctedResult = evaluateQuizGuess(state, secondTarget);
  assert.equal(correctedResult.isCorrect, true);
  state = correctedResult.nextState;
  assert.equal(state.status, 'correct');
  assert.equal(state.score, 2);
  assert.equal(state.firstTryCount, 1);
  assert.equal(state.streak, 1);
  assert.equal(state.history[0]?.outcome, 'corrected');
});

test('revealQuizAnswer and useQuizHint update quiz state without awarding score', () => {
  const rng = makeSeededRng(99);
  let state = createInitialQuizState(INITIAL_BRAIN_REGIONS, 'internal', rng);
  state = useQuizHint(state);
  assert.equal(state.hintUsedForCurrent, true);

  state = revealQuizAnswer(state);
  assert.equal(state.status, 'revealed');
  assert.equal(state.score, 0);
  assert.equal(state.questionsAnswered, 1);
  assert.equal(state.streak, 0);
  assert.equal(calculateQuizAccuracy(state), 0);
  assert.equal(state.history[0]?.outcome, 'revealed');
  assert.equal(state.history[0]?.hintUsed, true);
});
