import type { Position } from '../types/nfl-minefield-types';
import { buildRound, todayGameDate } from '../lib/build-round';
import type { Game } from '../types/nfl-minefield-types';
import { getTeamLogoUrl, getPlayerHeadshotUrl } from '../espn-assets';

function playerBox(name: string, position: Position, teamNickname: string) {
  return {
    kind: 'player' as const,
    playerName: name,
    position,
    teamNickname,
    headshotUrl: getPlayerHeadshotUrl(name),
    teamLogoUrl: getTeamLogoUrl(teamNickname),
  };
}

function teamBox(nickname: string) {
  return {
    kind: 'team' as const,
    teamNickname: nickname,
    teamLogoUrl: getTeamLogoUrl(nickname),
  };
}

/** Deterministic hash from date string for picking round variant and seeding shuffle. */
function hashDate(date: string): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) {
    h = (h << 5) - h + date.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}

/** Yesterday's date in YYYY-MM-DD (for no-repeat variant selection). */
function yesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Returns which variant index was used for each slot on the given date (same logic as getGameForDate). */
function getVariantIndices(date: string): number[] {
  const seedBase = hashDate(date);
  const indices: number[] = [];
  for (let roundIndex = 0; roundIndex < ROUND_POOLS.length; roundIndex++) {
    const pool = ROUND_POOLS[roundIndex];
    let idx: number;
    if (roundIndex === 2) {
      const historicalStart = 2;
      const historicalCount = 3;
      idx = historicalStart + Math.abs(seedBase + roundIndex * 31) % historicalCount;
    } else if (roundIndex === 3) {
      idx = Math.abs(seedBase + roundIndex * 31) % pool.length;
    } else {
      idx = Math.abs(seedBase + roundIndex * 31) % pool.length;
    }
    indices.push(idx);
  }
  return indices;
}

/** Pick a variant index different from prevIndex (no repeat from previous day). */
function pickDifferentIndex(poolLength: number, prevIndex: number, seed: number): number {
  if (poolLength <= 1) return 0;
  const offset = Math.abs(seed) % (poolLength - 1);
  return (prevIndex + 1 + offset) % poolLength;
}

/** One round definition: question + boxes for a given slot (correct/incorrect counts fixed by slot). */
type RoundDef = {
  questionType: 'player' | 'team';
  questionText: string;
  category: string;
  correctBoxes: ReturnType<typeof playerBox>[] | ReturnType<typeof teamBox>[];
  incorrectBoxes: ReturnType<typeof playerBox>[] | ReturnType<typeof teamBox>[];
  /** When true, counts toward "multiple historical every day". */
  historical?: boolean;
  /** When true, counts as fantasy (max 1 fantasy round per game). */
  fantasy?: boolean;
  /** When true, question is from 2025 season/draft — limit to 1 per game (too easy). */
  recentYear?: boolean;
};

/** Round pools per slot. Same date always gets same game; different dates cycle through variants. */
const ROUND_POOLS: RoundDef[][] = [
  // Slot 0: 8 correct, 1 incorrect
  [
    {
      fantasy: true,
      recentYear: true,
      questionType: 'player',
      questionText: 'QBs who finished in the top 10 in fantasy points in 2025 (standard PPR scoring)',
      category: 'fantasy_top_rank',
      correctBoxes: [
        playerBox('Josh Allen', 'QB', 'Bills'),
        playerBox('Jalen Hurts', 'QB', 'Eagles'),
        playerBox('Lamar Jackson', 'QB', 'Ravens'),
        playerBox('Patrick Mahomes', 'QB', 'Chiefs'),
        playerBox('Dak Prescott', 'QB', 'Cowboys'),
        playerBox('Brock Purdy', 'QB', '49ers'),
        playerBox('Jordan Love', 'QB', 'Packers'),
        playerBox('Tua Tagovailoa', 'QB', 'Dolphins'),
      ],
      incorrectBoxes: [playerBox('Zach Wilson', 'QB', 'Jets')],
    },
    {
      fantasy: true,
      recentYear: true,
      questionType: 'player',
      questionText: 'WRs who finished in the top 10 in fantasy points in 2025 (standard PPR scoring)',
      category: 'fantasy_top_rank',
      correctBoxes: [
        playerBox('Tyreek Hill', 'WR', 'Dolphins'),
        playerBox('CeeDee Lamb', 'WR', 'Cowboys'),
        playerBox('Amon-Ra St. Brown', 'WR', 'Lions'),
        playerBox('Ja\'Marr Chase', 'WR', 'Bengals'),
        playerBox('Mike Evans', 'WR', 'Buccaneers'),
        playerBox('Puka Nacua', 'WR', 'Rams'),
        playerBox('Davante Adams', 'WR', 'Rams'),
        playerBox('Chris Olave', 'WR', 'Saints'),
      ],
      incorrectBoxes: [playerBox('DeVonta Smith', 'WR', 'Eagles')],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: '2024 First-team All-Pro selections (offensive skill: QB, RB, WR, TE)',
      category: 'other',
      correctBoxes: [
        playerBox('Lamar Jackson', 'QB', 'Ravens'),
        playerBox('Christian McCaffrey', 'RB', '49ers'),
        playerBox('Tyreek Hill', 'WR', 'Dolphins'),
        playerBox('CeeDee Lamb', 'WR', 'Cowboys'),
        playerBox('Travis Kelce', 'TE', 'Chiefs'),
        playerBox('Amon-Ra St. Brown', 'WR', 'Lions'),
        playerBox('Puka Nacua', 'WR', 'Rams'),
        playerBox('Breece Hall', 'RB', 'Jets'),
      ],
      incorrectBoxes: [playerBox('Patrick Mahomes', 'QB', 'Chiefs')],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: 'Pro Football Hall of Fame inductees who played for the Cowboys',
      category: 'other',
      correctBoxes: [
        playerBox('Emmitt Smith', 'RB', 'Cowboys'),
        playerBox('Troy Aikman', 'QB', 'Cowboys'),
        playerBox('Michael Irvin', 'WR', 'Cowboys'),
        playerBox('Roger Staubach', 'QB', 'Cowboys'),
        playerBox('Tony Dorsett', 'RB', 'Cowboys'),
        playerBox('Randy White', 'RB', 'Cowboys'),
        playerBox('Bob Lilly', 'RB', 'Cowboys'),
        playerBox('Rayfield Wright', 'RB', 'Cowboys'),
      ],
      incorrectBoxes: [playerBox('Dak Prescott', 'QB', 'Cowboys')],
    },
  ],
  // Slot 1: 6 correct, 3 incorrect
  [
    {
      questionType: 'team',
      recentYear: true,
      questionText: 'NFC teams that made the playoffs in 2025 (NFL season)',
      category: 'other',
      correctBoxes: [
        teamBox('Cowboys'),
        teamBox('Eagles'),
        teamBox('Lions'),
        teamBox('49ers'),
        teamBox('Rams'),
        teamBox('Buccaneers'),
      ],
      incorrectBoxes: [teamBox('Seahawks'), teamBox('Vikings'), teamBox('Packers')],
    },
    {
      questionType: 'team',
      recentYear: true,
      questionText: 'AFC teams that made the playoffs in 2025 (NFL season)',
      category: 'other',
      correctBoxes: [
        teamBox('Chiefs'),
        teamBox('Bills'),
        teamBox('Ravens'),
        teamBox('Texans'),
        teamBox('Browns'),
        teamBox('Steelers'),
      ],
      incorrectBoxes: [teamBox('Dolphins'), teamBox('Colts'), teamBox('Bengals')],
    },
    {
      historical: true,
      questionType: 'team',
      questionText: 'Teams with 4+ Super Bowl wins',
      category: 'super_bowl',
      correctBoxes: [
        teamBox('Patriots'),
        teamBox('Steelers'),
        teamBox('Cowboys'),
        teamBox('49ers'),
        teamBox('Packers'),
        teamBox('Giants'),
      ],
      incorrectBoxes: [teamBox('Broncos'), teamBox('Raiders'), teamBox('Commanders')],
    },
    {
      historical: true,
      questionType: 'team',
      questionText: 'Teams that have appeared in 6+ Super Bowls',
      category: 'super_bowl',
      correctBoxes: [
        teamBox('Patriots'),
        teamBox('Cowboys'),
        teamBox('Steelers'),
        teamBox('Broncos'),
        teamBox('49ers'),
        teamBox('Rams'),
      ],
      incorrectBoxes: [teamBox('Packers'), teamBox('Chiefs'), teamBox('Eagles')],
    },
  ],
  // Slot 2: 4 correct, 5 incorrect — always historical (franchise leaders)
  [
    {
      fantasy: true,
      recentYear: true,
      questionType: 'player',
      questionText: 'RBs who had a 30+ PPR point game in 2025 (standard PPR scoring)',
      category: 'fantasy_high_point_game',
      correctBoxes: [
        playerBox('Raheem Mostert', 'RB', 'Dolphins'),
        playerBox('Kyren Williams', 'RB', 'Rams'),
        playerBox('De\'Von Achane', 'RB', 'Dolphins'),
        playerBox('Jahmyr Gibbs', 'RB', 'Lions'),
      ],
      incorrectBoxes: [
        playerBox('Derrick Henry', 'RB', 'Ravens'),
        playerBox('Nick Chubb', 'RB', 'Browns'),
        playerBox('Jonathan Taylor', 'RB', 'Colts'),
        playerBox('Saquon Barkley', 'RB', 'Eagles'),
        playerBox('Breece Hall', 'RB', 'Jets'),
      ],
    },
    {
      fantasy: true,
      recentYear: true,
      questionType: 'player',
      questionText: 'WRs who had a 25+ PPR point game in 2025 (standard PPR scoring)',
      category: 'fantasy_high_point_game',
      correctBoxes: [
        playerBox('Tyreek Hill', 'WR', 'Dolphins'),
        playerBox('CeeDee Lamb', 'WR', 'Cowboys'),
        playerBox('Puka Nacua', 'WR', 'Rams'),
        playerBox('Amon-Ra St. Brown', 'WR', 'Lions'),
      ],
      incorrectBoxes: [
        playerBox('Davante Adams', 'WR', 'Rams'),
        playerBox('Chris Olave', 'WR', 'Saints'),
        playerBox('DeVonta Smith', 'WR', 'Eagles'),
        playerBox('Jaylen Waddle', 'WR', 'Dolphins'),
        playerBox('Garrett Wilson', 'WR', 'Jets'),
      ],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: '49ers RBs with 5,000+ career rushing yards',
      category: 'fantasy_team_all_time',
      correctBoxes: [
        playerBox('Frank Gore', 'RB', '49ers'),
        playerBox('Roger Craig', 'RB', '49ers'),
        playerBox('Joe Perry', 'RB', '49ers'),
        playerBox('Garrison Hearst', 'RB', '49ers'),
      ],
      incorrectBoxes: [
        playerBox('Carlos Hyde', 'RB', '49ers'),
        playerBox('Kevan Barlow', 'RB', '49ers'),
        playerBox('Ken Willard', 'RB', '49ers'),
        playerBox('Delvin Williams', 'RB', '49ers'),
        playerBox('J.D. Smith', 'RB', '49ers'),
      ],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: 'Rams RBs with 5,000+ career rushing yards',
      category: 'fantasy_team_all_time',
      correctBoxes: [
        playerBox('Eric Dickerson', 'RB', 'Rams'),
        playerBox('Marshall Faulk', 'RB', 'Rams'),
        playerBox('Steven Jackson', 'RB', 'Rams'),
        playerBox('Todd Gurley', 'RB', 'Rams'),
      ],
      incorrectBoxes: [
        playerBox('Lawrence McCutcheon', 'RB', 'Rams'),
        playerBox('Cleveland Gary', 'RB', 'Rams'),
        playerBox('Willie Ellison', 'RB', 'Rams'),
        playerBox('John Cappelletti', 'RB', 'Rams'),
        playerBox('Charles White', 'RB', 'Rams'),
      ],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: 'Eagles RBs with 5,000+ career rushing yards (with Philadelphia)',
      category: 'fantasy_team_all_time',
      correctBoxes: [
        playerBox('LeSean McCoy', 'RB', 'Eagles'),
        playerBox('Wilbert Montgomery', 'RB', 'Eagles'),
        playerBox('Steve Van Buren', 'RB', 'Eagles'),
        playerBox('Brian Westbrook', 'RB', 'Eagles'),
      ],
      incorrectBoxes: [
        playerBox('Duce Staley', 'RB', 'Eagles'),
        playerBox('Ricky Watters', 'RB', 'Eagles'),
        playerBox('Corey Clement', 'RB', 'Eagles'),
        playerBox('Miles Sanders', 'RB', 'Eagles'),
        playerBox('Kenny Gainwell', 'RB', 'Eagles'),
      ],
    },
  ],
  // Slot 3: 2 correct, 7 incorrect — always historical (franchise leaders / HOF)
  [
    {
      historical: true,
      questionType: 'player',
      questionText: 'Bengals WRs with 10,000+ career receiving yards',
      category: 'fantasy_team_all_time',
      correctBoxes: [playerBox('Chad Johnson', 'WR', 'Bengals'), playerBox('A.J. Green', 'WR', 'Bengals')],
      incorrectBoxes: [
        playerBox('Ja\'Marr Chase', 'WR', 'Bengals'),
        playerBox('Tee Higgins', 'WR', 'Bengals'),
        playerBox('Tyler Boyd', 'WR', 'Bengals'),
        playerBox('Chris Henry', 'WR', 'Bengals'),
        playerBox('Carl Pickens', 'WR', 'Bengals'),
        playerBox('Eddie Brown', 'WR', 'Bengals'),
        playerBox('Isaac Curtis', 'WR', 'Bengals'),
      ],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: 'Steelers RBs with 8,000+ career rushing yards',
      category: 'fantasy_team_all_time',
      correctBoxes: [
        playerBox('Franco Harris', 'RB', 'Steelers'),
        playerBox('Jerome Bettis', 'RB', 'Steelers'),
      ],
      incorrectBoxes: [
        playerBox('Le\'Veon Bell', 'RB', 'Steelers'),
        playerBox('Najee Harris', 'RB', 'Steelers'),
        playerBox('Willie Parker', 'RB', 'Steelers'),
        playerBox('Rashard Mendenhall', 'RB', 'Steelers'),
        playerBox('James Conner', 'RB', 'Steelers'),
        playerBox('Barry Foster', 'RB', 'Steelers'),
        playerBox('John Henry Johnson', 'RB', 'Steelers'),
      ],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: 'Packers QBs in the Pro Football Hall of Fame',
      category: 'other',
      correctBoxes: [
        playerBox('Bart Starr', 'QB', 'Packers'),
        playerBox('Brett Favre', 'QB', 'Packers'),
      ],
      incorrectBoxes: [
        playerBox('Aaron Rodgers', 'QB', 'Packers'),
        playerBox('Jordan Love', 'QB', 'Packers'),
        playerBox('Don Majkowski', 'QB', 'Packers'),
        playerBox('Lynn Dickey', 'QB', 'Packers'),
        playerBox('David Whitehurst', 'QB', 'Packers'),
        playerBox('Scott Hunter', 'QB', 'Packers'),
        playerBox('John Hadl', 'QB', 'Packers'),
      ],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: 'Dolphins QBs in the Pro Football Hall of Fame',
      category: 'other',
      correctBoxes: [
        playerBox('Dan Marino', 'QB', 'Dolphins'),
        playerBox('Bob Griese', 'QB', 'Dolphins'),
      ],
      incorrectBoxes: [
        playerBox('Ryan Tannehill', 'QB', 'Dolphins'),
        playerBox('Jay Fiedler', 'QB', 'Dolphins'),
        playerBox('Chad Pennington', 'QB', 'Dolphins'),
        playerBox('Tua Tagovailoa', 'QB', 'Dolphins'),
        playerBox('David Woodley', 'QB', 'Dolphins'),
        playerBox('Don Strock', 'QB', 'Dolphins'),
        playerBox('Earl Morrall', 'QB', 'Dolphins'),
      ],
    },
    {
      historical: true,
      questionType: 'player',
      questionText: '49ers RBs with 7,000+ career rushing yards',
      category: 'fantasy_team_all_time',
      correctBoxes: [
        playerBox('Frank Gore', 'RB', '49ers'),
        playerBox('Roger Craig', 'RB', '49ers'),
      ],
      incorrectBoxes: [
        playerBox('Joe Perry', 'RB', '49ers'),
        playerBox('Garrison Hearst', 'RB', '49ers'),
        playerBox('Carlos Hyde', 'RB', '49ers'),
        playerBox('Kevan Barlow', 'RB', '49ers'),
        playerBox('Ken Willard', 'RB', '49ers'),
        playerBox('Delvin Williams', 'RB', '49ers'),
        playerBox('J.D. Smith', 'RB', '49ers'),
      ],
    },
  ],
  // Slot 4: 1 correct, 8 incorrect
  [
    {
      questionType: 'team',
      questionText: 'Team that won Super Bowl LIX',
      category: 'super_bowl',
      correctBoxes: [teamBox('Chiefs')],
      incorrectBoxes: [
        teamBox('49ers'),
        teamBox('Lions'),
        teamBox('Ravens'),
        teamBox('Bills'),
        teamBox('Cowboys'),
        teamBox('Eagles'),
        teamBox('Packers'),
        teamBox('Texans'),
      ],
    },
    {
      questionType: 'team',
      recentYear: true,
      questionText: 'Team that had the #1 pick in the 2025 NFL Draft',
      category: 'draft',
      correctBoxes: [teamBox('Patriots')],
      incorrectBoxes: [
        teamBox('Commanders'),
        teamBox('Bears'),
        teamBox('Cardinals'),
        teamBox('Chargers'),
        teamBox('Giants'),
        teamBox('Titans'),
        teamBox('Falcons'),
        teamBox('Vikings'),
      ],
    },
    {
      historical: true,
      questionType: 'team',
      questionText: 'Franchise with the most Super Bowl wins',
      category: 'super_bowl',
      correctBoxes: [teamBox('Patriots')],
      incorrectBoxes: [
        teamBox('Cowboys'),
        teamBox('49ers'),
        teamBox('Packers'),
        teamBox('Giants'),
        teamBox('Broncos'),
        teamBox('Raiders'),
        teamBox('Commanders'),
        teamBox('Chiefs'),
      ],
    },
    {
      historical: true,
      questionType: 'team',
      questionText: 'Only team to complete a 16-0 regular season',
      category: 'other',
      correctBoxes: [teamBox('Patriots')],
      incorrectBoxes: [
        teamBox('Dolphins'),
        teamBox('Bears'),
        teamBox('49ers'),
        teamBox('Cowboys'),
        teamBox('Packers'),
        teamBox('Steelers'),
        teamBox('Chiefs'),
        teamBox('Eagles'),
      ],
    },
  ],
];

/**
 * Builds the game for a given date. Same date always returns the same game (deterministic).
 * Never repeats a question from the previous day (variant index differs per slot).
 * At most 1 fantasy round per game; slots 2 and 3 always historical.
 */
export function getGameForDate(date: string): Game {
  const gameId = `game_${date}`;
  const seedBase = hashDate(date);
  const prevIndices = getVariantIndices(yesterday(date));

  const variantIndices: number[] = [];
  for (let roundIndex = 0; roundIndex < ROUND_POOLS.length; roundIndex++) {
    const pool = ROUND_POOLS[roundIndex];
    const prevIdx = prevIndices[roundIndex] ?? 0;
    let variantIndex: number;
    if (roundIndex === 2) {
      const historicalStart = 2;
      const historicalCount = 3;
      const localPrev = prevIdx - historicalStart;
      const localNew = pickDifferentIndex(historicalCount, localPrev >= 0 ? localPrev : 0, seedBase + roundIndex);
      variantIndex = historicalStart + localNew;
    } else if (roundIndex === 3) {
      variantIndex = pickDifferentIndex(pool.length, prevIdx, seedBase + roundIndex);
    } else {
      variantIndex = pickDifferentIndex(pool.length, prevIdx, seedBase + roundIndex);
    }
    variantIndices.push(variantIndex);
  }

  // Enforce at most 1 fantasy round per game (user asked for 1 fantasy, 3–4 non-fantasy)
  let fantasySlots = variantIndices
    .map((idx, slot) => (ROUND_POOLS[slot][idx] as RoundDef).fantasy ? slot : -1)
    .filter((s) => s >= 0);
  if (fantasySlots.length > 1) {
    for (let i = 1; i < fantasySlots.length; i++) {
      const slot = fantasySlots[i];
      const pool = ROUND_POOLS[slot];
      let newIdx = (variantIndices[slot] + 1) % pool.length;
      while ((pool[newIdx] as RoundDef).fantasy && newIdx !== variantIndices[slot]) {
        newIdx = (newIdx + 1) % pool.length;
      }
      if (!(pool[newIdx] as RoundDef).fantasy) variantIndices[slot] = newIdx;
    }
  }
  // If zero fantasy, force exactly one in slot 0 (pick a fantasy variant different from yesterday)
  if (fantasySlots.length === 0) {
    const pool0 = ROUND_POOLS[0];
    const fantasyIndices = pool0.map((d, i) => ((d as RoundDef).fantasy ? i : -1)).filter((i) => i >= 0);
    if (fantasyIndices.length > 0) {
      const prev0 = prevIndices[0] ?? -1;
      const chosen = fantasyIndices.find((i) => i !== prev0) ?? fantasyIndices[0];
      variantIndices[0] = chosen;
    }
  }

  // At most 1 recent-year (2025) round per game — too easy if multiple
  const MAX_RECENT_YEAR_ROUNDS = 1;
  const slotsWithRecentYear = variantIndices
    .map((idx, slot) => ((ROUND_POOLS[slot][idx] as RoundDef).recentYear ? slot : -1))
    .filter((s) => s >= 0);
  if (slotsWithRecentYear.length > MAX_RECENT_YEAR_ROUNDS) {
    for (let i = 1; i < slotsWithRecentYear.length; i++) {
      const slot = slotsWithRecentYear[i];
      const pool = ROUND_POOLS[slot];
      // Pick a non–recentYear variant
      let newIdx = (variantIndices[slot] + 1) % pool.length;
      let attempts = pool.length;
      while (attempts-- > 0 && (pool[newIdx] as RoundDef).recentYear) {
        newIdx = (newIdx + 1) % pool.length;
      }
      if (!(pool[newIdx] as RoundDef).recentYear) {
        variantIndices[slot] = newIdx;
      }
    }
  }

  const rounds = ROUND_POOLS.map((pool, roundIndex) => {
    const variantIndex = variantIndices[roundIndex];
    const def = pool[variantIndex];
    return buildRound({
      roundIndex,
      questionType: def.questionType,
      questionText: def.questionText,
      category: def.category,
      correctBoxes: def.correctBoxes,
      incorrectBoxes: def.incorrectBoxes,
      roundId: `${gameId}_round_${roundIndex}`,
      seed: seedBase + roundIndex * 1000,
    });
  });

  return {
    id: gameId,
    date,
    rounds,
  };
}

/** Cache by date so the same day doesn't rebuild. */
const gameCache = new Map<string, Game>();

/**
 * Returns today's game. Each day gets a new set of 5 questions (round variants cycle by date).
 */
export function getMockGame(): Game {
  const date = todayGameDate();
  let game = gameCache.get(date);
  if (!game) {
    game = getGameForDate(date);
    gameCache.set(date, game);
  }
  return game;
}
