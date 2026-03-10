import type { Round } from '../types/nfl-minefield-types';
import type { UseGameSessionReturn } from '../hooks/useGameSession';
import { BoxCell } from './BoxCell';

interface BoxGridProps {
  round: Round;
  gameState: UseGameSessionReturn;
}

export function BoxGrid({ round, gameState }: BoxGridProps) {
  const { isRevealed, revealBox, status } = gameState;

  return (
    <div className="box-grid" role="grid" aria-label="Answer options">
      {round.boxes.map((box) => (
        <BoxCell
          key={box.id}
          box={box}
          revealed={isRevealed(box.id)}
          disabled={status !== 'playing'}
          onSelect={() => revealBox(box)}
        />
      ))}
    </div>
  );
}
