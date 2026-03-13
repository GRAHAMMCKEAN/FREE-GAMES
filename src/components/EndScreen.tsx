import type { Game, GameSession } from '../types/nfl-minefield-types';
import { NflShield } from './NflShield';

interface EndScreenProps {
  game: Game;
  session: GameSession;
  status: GameSession['status'];
  /** Formatted date (e.g. "March 5, 2025") */
  dateLabel: string;
}

export function EndScreen({ game, session, status, dateLabel }: EndScreenProps) {
  const completed = session.status === 'completed';
  const roundsCompleted = completed ? game.rounds.length : session.currentRoundIndex;

  return (
    <div className="end-screen">
      <h1 className="end-screen-title">
        <NflShield className="game-title-shield" />
        NFL Minefield
      </h1>
      <p className="end-screen-date" aria-live="polite">{dateLabel}</p>
      {status === 'completed' ? (
        <>
          <p className="end-title">You made it!</p>
          <p className="end-detail">You cleared all 5 rounds.</p>
        </>
      ) : (
        <>
          <p className="end-title">Game over</p>
          <p className="end-detail">
            You reached round {roundsCompleted + 1} of {game.rounds.length} before hitting 3 mines.
          </p>
        </>
      )}
      <p className="end-stats">
        Rounds completed: {roundsCompleted} / {game.rounds.length}
      </p>
      <p className="end-note">Stats and “how everyone did” viz coming soon.</p>
    </div>
  );
}
