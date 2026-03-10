/**
 * NFL Minefield — Data model types
 * Use with data-model.md for full schema and semantics.
 */

// --- Enums / literals ---------------------------------------------------------

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K';

export type QuestionType = 'player' | 'team';

export type GameStatus = 'playing' | 'eliminated' | 'completed';

/** Category slug for questions (fantasy, cross-filters, draft, etc.) */
export type QuestionCategory =
  | 'fantasy_top_rank'
  | 'fantasy_high_point_game'
  | 'fantasy_decade_top5'
  | 'fantasy_adp_first'
  | 'fantasy_team_all_time'
  | 'fantasy_division_all_time'
  | 'fantasy_college_all_time'
  | 'cross_filters'
  | 'draft'
  | 'super_bowl'
  | 'other';

// --- Minefield config (fixed per round index) ---------------------------------

export const MINEFIELD_CONFIG: Readonly<{ correct: number; incorrect: number }[]> = [
  { correct: 8, incorrect: 1 }, // round 0
  { correct: 6, incorrect: 3 }, // round 1
  { correct: 4, incorrect: 5 }, // round 2
  { correct: 2, incorrect: 7 }, // round 3
  { correct: 1, incorrect: 8 }, // round 4
] as const;

export const MAX_STRIKES = 3;
export const ROUNDS_PER_GAME = 5;
export const BOXES_PER_ROUND = 9;

// --- Box (one cell in the 9-box grid) -----------------------------------------

export interface PlayerBox {
  kind: 'player';
  id: string;
  boxIndex: number;
  isCorrect: boolean;
  playerId?: string;
  headshotUrl: string;
  teamLogoUrl: string;
  teamNickname?: string;
  playerName: string;
  position: Position;
  pickRatePercent: number | null;
}

export interface TeamBox {
  kind: 'team';
  id: string;
  boxIndex: number;
  isCorrect: boolean;
  teamId?: string;
  teamLogoUrl: string;
  teamNickname: string;
  pickRatePercent: number | null;
}

export type Box = PlayerBox | TeamBox;

export function isPlayerBox(box: Box): box is PlayerBox {
  return box.kind === 'player';
}

export function isTeamBox(box: Box): box is TeamBox {
  return box.kind === 'team';
}

// --- Round (one question / one minefield) -------------------------------------

export interface Round {
  id: string;
  roundIndex: number;
  questionType: QuestionType;
  questionText: string;
  category: QuestionCategory | string;
  boxes: Box[];
  correctCount: number;
  incorrectCount: number;
}

// --- Game (one day's game, 5 rounds) -----------------------------------------

export interface Game {
  id: string;
  date: string; // YYYY-MM-DD
  rounds: Round[];
}

// --- Game session (runtime progress) -------------------------------------------

export interface GameSession {
  gameId: string;
  currentRoundIndex: number;
  strikesUsed: number;
  revealedBoxIds: string[];
  status: GameStatus;
  startedAt?: string; // ISO
  completedAt?: string | null; // ISO
  /** When true, round was just cleared; auto-advance after brief delay (no continue button). */
  roundCompletePending?: boolean;
}

export function createInitialSession(gameId: string): GameSession {
  return {
    gameId,
    currentRoundIndex: 0,
    strikesUsed: 0,
    revealedBoxIds: [],
    status: 'playing',
    startedAt: new Date().toISOString(),
  };
}

// --- Reference data (optional, for normalized player/team) --------------------

export interface PlayerRef {
  id: string;
  name: string;
  position: Position;
  headshotUrl: string;
  teamLogoUrl: string;
  externalId?: string;
}

export interface TeamRef {
  id: string;
  nickname: string;
  logoUrl: string;
  abbreviation?: string;
}

// --- Question metadata (for authoring / building rounds) ----------------------

export interface QuestionMeta {
  id: string;
  questionType: QuestionType;
  category: QuestionCategory | string;
  questionText: string;
  correctAnswerIds: string[];
  incorrectAnswerIds: string[];
  yearRange?: [number, number];
  decade?: number;
  teamId?: string;
  divisionId?: string;
  collegeId?: string;
}

// --- API / server response shapes ---------------------------------------------

export interface GameResponse {
  game: Game;
}

export interface PickRatesResponse {
  pickRates: Record<string, number>; // boxId -> 0..100
}
