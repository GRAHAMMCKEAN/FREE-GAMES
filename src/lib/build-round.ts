/**
 * Builds a Round with 9 boxes from correct/incorrect answer lists.
 * Shuffles and assigns box indices; sets correctCount/incorrectCount from MINEFIELD_CONFIG.
 */

import {
  type Box,
  type Round,
  type PlayerBox,
  type TeamBox,
  MINEFIELD_CONFIG,
  ROUNDS_PER_GAME,
} from '../types/nfl-minefield-types';

export type CorrectOrIncorrect<T> = { isCorrect: true; data: T } | { isCorrect: false; data: T };

/** Seeded PRNG (mulberry32) for deterministic shuffle when building daily games. */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(array: T[], random = Math.random): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface BuildRoundInput {
  roundIndex: number;
  questionType: Round['questionType'];
  questionText: string;
  category: string;
  correctBoxes: Omit<Box, 'id' | 'boxIndex' | 'isCorrect' | 'pickRatePercent'>[];
  incorrectBoxes: Omit<Box, 'id' | 'boxIndex' | 'isCorrect' | 'pickRatePercent'>[];
  roundId?: string;
  /** Optional seed for deterministic box order (e.g. from date for daily games). */
  seed?: number;
}

function addBoxFields(
  box: Omit<Box, 'id' | 'boxIndex' | 'isCorrect' | 'pickRatePercent'>,
  boxIndex: number,
  isCorrect: boolean,
  id: string
): Box {
  const base = { id, boxIndex, isCorrect, pickRatePercent: null };
  if (box.kind === 'player') {
    return { ...base, ...box } as PlayerBox;
  }
  return { ...base, ...box } as TeamBox;
}

/**
 * Builds a Round with 9 boxes. Length of correctBoxes/incorrectBoxes must match
 * MINEFIELD_CONFIG for the given roundIndex.
 */
export function buildRound(input: BuildRoundInput): Round {
  const { roundIndex, questionType, questionText, category, correctBoxes, incorrectBoxes, roundId, seed } = input;

  if (roundIndex < 0 || roundIndex >= ROUNDS_PER_GAME) {
    throw new Error(`roundIndex must be 0..${ROUNDS_PER_GAME - 1}`);
  }

  const config = MINEFIELD_CONFIG[roundIndex];
  if (correctBoxes.length !== config.correct || incorrectBoxes.length !== config.incorrect) {
    throw new Error(
      `Round ${roundIndex}: expected ${config.correct} correct and ${config.incorrect} incorrect, ` +
        `got ${correctBoxes.length} and ${incorrectBoxes.length}`
    );
  }

  const combined: { isCorrect: boolean; data: Omit<Box, 'id' | 'boxIndex' | 'isCorrect' | 'pickRatePercent'> }[] = [
    ...correctBoxes.map((data) => ({ isCorrect: true, data })),
    ...incorrectBoxes.map((data) => ({ isCorrect: false, data })),
  ];
  const random = seed !== undefined ? seededRandom(seed) : Math.random;
  const shuffled = shuffle(combined, random);

  const boxes: Box[] = shuffled.map((item, i) => {
    const id = roundId ? `${roundId}_box_${i}` : `box_${i}`;
    return addBoxFields(item.data, i, item.isCorrect, id);
  });

  return {
    id: roundId ?? `round_${roundIndex}`,
    roundIndex,
    questionType,
    questionText,
    category,
    boxes,
    correctCount: config.correct,
    incorrectCount: config.incorrect,
  };
}

/**
 * Today's date in YYYY-MM-DD (game key).
 */
export function todayGameDate(): string {
  return new Date().toISOString().slice(0, 10);
}
