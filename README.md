# NFL Minefield

Daily NFL trivia game: 5 rounds, 9 boxes per round, avoid 3 mines to win.

- **Data model:** [`data-model.md`](./data-model.md)
- **TypeScript types:** [`src/types/nfl-minefield-types.ts`](./src/types/nfl-minefield-types.ts)

## Data model (start here)

1. **Game** — One per day; 5 rounds.
2. **Round** — One question; 9 boxes (player or team); correct/incorrect counts fixed by round index (8/1, 6/3, 4/5, 2/7, 1/8).
3. **Box** — One cell: either `PlayerBox` (headshot, team logo, name, position) or `TeamBox` (logo, nickname); `isCorrect` marks mine vs safe.
4. **GameSession** — Runtime state: current round, strikes (max 3), revealed boxes, status.

See `data-model.md` for full schema, API shape, and optional question metadata for authoring.

## Tech

- React 18 + TypeScript
- Vite 5
- Types and `buildRound` in `src/types/` and `src/lib/`

**Run:** `npm install` then `npm run dev` to start the dev server. `npm run build` for production.

## Next steps

- [x] React app scaffold (Vite + React + TS)
- [x] Mock game data + round builder using `MINEFIELD_CONFIG`
- [x] Game UI: round view, 9-box grid, strike countdown, advance/eliminate
- [ ] Session persistence (e.g. localStorage by date)
- [ ] End screen + pick rates + “how everyone did” viz
