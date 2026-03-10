import type { Round } from '../types/nfl-minefield-types';
import type { UseGameSessionReturn } from '../hooks/useGameSession';
import { BoxGrid } from './BoxGrid';

interface RoundViewProps {
  round: Round;
  gameState: UseGameSessionReturn;
}

export function RoundView({ round, gameState }: RoundViewProps) {
  return (
    <main className="round-view">
      <h2 className="question-text">{round.questionText}</h2>
      <BoxGrid round={round} gameState={gameState} />
    </main>
  );
}
