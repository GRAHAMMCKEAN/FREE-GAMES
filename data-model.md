# NFL Minefield — Data Model

Design for daily game state, questions, answers, and UI. Use with the TypeScript types in `nfl-minefield-types.ts`.

---

## 1. Core entities

### 1.1 Game (daily instance)

One game per calendar day. Identified by date; contains 5 rounds.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (e.g. `game_2025-03-05` or UUID) |
| `date` | string (ISO date) | `YYYY-MM-DD` — determines “today’s game” and reset |
| `rounds` | `Round[]` | Exactly 5 rounds in order |

### 1.2 Round (one question / one minefield)

One of the 5 daily questions. Same structure for player and team questions; `questionType` and box content distinguish them.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique per round (e.g. `round_1` or UUID) |
| `roundIndex` | number | 0–4 (order in the game) |
| `questionType` | `'player' \| 'team'` | Drives which fields are present in each box |
| `questionText` | string | Prompt shown above the 9 boxes (e.g. “QBs who finished top 5 in fantasy in 2020”) |
| `category` | string | e.g. `fantasy_top5`, `fantasy_50pt_game`, `team_all_time`, `cross_filters` — for filtering/analytics |
| `boxes` | `Box[]` | Exactly 9 items |
| **Minefield config** | | Determined by `roundIndex` (see §2) |
| `correctCount` | number | Number of correct answers in this round (derivable from config) |
| `incorrectCount` | number | Number of mines in this round |

### 1.3 Box (one cell in the 3×3 grid)

One clickable option. Either a player or a team; mines are boxes where `isCorrect === false`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique per box in the round |
| `boxIndex` | number | 0–8 (order in grid) |
| `isCorrect` | boolean | `true` = safe, `false` = mine |
| **Player (when `questionType === 'player'`)** | | |
| `playerId` | string | Reference to player entity (optional if you normalize) |
| `headshotUrl` | string | Image URL |
| `teamLogoUrl` | string | Primary team for this question |
| `playerName` | string | Display name |
| `position` | string | `QB` \| `RB` \| `WR` \| `TE` \| `K` |
| **Team (when `questionType === 'team'`)** | | |
| `teamId` | string | Reference to team entity |
| `teamLogoUrl` | string | Team logo |
| `teamNickname` | string | e.g. `Bills`, `Chiefs` |
| **Shared** | | |
| `pickRatePercent` | number \| null | 0–100, “% of players who picked this”; null until loaded |

---

## 2. Minefield configuration (by round)

Fixed per round index. No need to store on each round if you derive it.

| roundIndex | correctCount | incorrectCount |
|------------|--------------|----------------|
| 0 | 8 | 1 |
| 1 | 6 | 3 |
| 2 | 4 | 5 |
| 3 | 2 | 7 |
| 4 | 1 | 8 |

When building a round, shuffle 9 options and assign `isCorrect` so that exactly `correctCount` are `true` and `incorrectCount` are `false`.

---

## 3. Game session (client-side / runtime state)

Tracks the user’s progress for the current game. Can live in React state or a store; persist to `localStorage` if you want “resume same day.”

| Field | Type | Description |
|-------|------|-------------|
| `gameId` | string | References the daily game |
| `currentRoundIndex` | number | 0–4; which round the user is on |
| `strikesUsed` | number | 0–3; incorrect picks so far |
| `revealedBoxIds` | Set<string> or string[] | Boxes the user has already clicked (to show revealed state) |
| `status` | `'playing' \| 'eliminated' \| 'completed'` | Game over when `strikesUsed === 3` or all 5 rounds done |
| `startedAt` | string (ISO) | Optional; for stats |
| `completedAt` | string (ISO) \| null | Optional; for stats |

---

## 4. Question metadata (content authoring / CMS)

For building rounds from a pool of questions. Not required at runtime for a single pre-built game.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique question ID |
| `questionType` | `'player' \| 'team'` | |
| `category` | string | Matches your category taxonomy |
| `questionText` | string | Prompt |
| `correctAnswerIds` | string[] | Player IDs or team IDs that are correct (count must match round’s `correctCount`) |
| `incorrectAnswerIds` | string[] | Mines (count must match round’s `incorrectCount`) |
| `yearRange` \| `decade` \| `teamId` \| etc. | optional | For display or filtering |

You’d run a “daily build” that, for each round index, picks a question and builds a `Round` with 9 `Box`es from `correctAnswerIds` + `incorrectAnswerIds`, shuffled.

---

## 5. Normalized reference data (optional)

If you have many questions reusing the same players/teams, normalize once.

**Player**

| Field | Type |
|-------|------|
| `id` | string |
| `name` | string |
| `position` | `QB` \| `RB` \| `WR` \| `TE` \| `K` |
| `headshotUrl` | string |
| `teamLogoUrl` | string (or current team) |
| `espnId` / `externalId` | string (optional) |

**Team**

| Field | Type |
|-------|------|
| `id` | string |
| `nickname` | string |
| `logoUrl` | string |
| `abbreviation` | string (optional) |

---

## 6. API / storage shape (suggested)

- **GET `/api/games/:date`** (e.g. `2025-03-05`)  
  Returns one `Game` with 5 `Round`s, each with 9 `Box`es.  
  Optionally omit `isCorrect` on each box and only send it when revealing (so client can’t cheat).

- **GET `/api/games/:date/pick-rates`** (optional)  
  Returns `{ [boxId]: number }` (pick rate 0–100) for that day’s boxes.

- **POST `/api/games/:date/session`** (optional)  
  Submit session result (rounds completed, strikes, time) for end-screen stats and “how everyone else did” viz.

---

## 7. Summary

- **Game** = one day, 5 rounds.  
- **Round** = one question, 9 boxes, fixed correct/incorrect counts by index.  
- **Box** = player or team with display fields + `isCorrect` + optional `pickRatePercent`.  
- **GameSession** = runtime state (round index, strikes, revealed boxes, status).  
- **Question metadata** = for building rounds from a pool; optional for v1.

Use the TypeScript types in `nfl-minefield-types.ts` as the single source of truth when implementing the React app and any backend.
