import type { Game } from '../types/nfl-minefield-types';
import type { UseGameSessionReturn } from '../hooks/useGameSession';
import { StrikeCountdown } from './StrikeCountdown';
import { RoundView } from './RoundView';
import { NflShield } from './NflShield';

interface GameScreenProps {
  game: Game;
  gameState: UseGameSessionReturn;
  /** Formatted date (e.g. "March 5, 2025") */
  dateLabel: string;
}

export function GameScreen({ game, gameState, dateLabel }: GameScreenProps) {
  const { currentRound, strikesLeft, session } = gameState;
  const currentIndex = session.currentRoundIndex;
  const roundCompletePending = session.roundCompletePending === true;

  if (!currentRound) return null;

  return (
    <div className="game-screen">
      {roundCompletePending && (
        <div className="round-complete-toast" role="status" aria-live="polite">
          Round complete!
        </div>
      )}
      <header className="game-header">
        <div className="game-header-top">
          <h1 className="game-title">
            <NflShield className="game-title-shield" />
            NFL Minefield
          </h1>
          <p className="game-date" aria-live="polite">{dateLabel}</p>
        </div>
        <div className="round-carousel">
          {game.rounds.map((round, i) => {
            const isCurrent = i === currentIndex;
            const isPassed = i < currentIndex;
            return (
              <div
                key={round.id}
                className={`round-carousel-dot ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={isPassed ? `Round ${i + 1} passed` : `Round ${i + 1}`}
              >
                {isPassed ? (
                  <span className="round-carousel-check" aria-hidden>✓</span>
                ) : (
                  <span className="round-carousel-num">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="round-label">
          Round {currentRound.roundIndex + 1} of {game.rounds.length}
          <span className="round-counts" aria-label={`${currentRound.correctCount} correct, ${currentRound.incorrectCount} mines`}>
            {' '}&middot; {currentRound.correctCount} correct, {currentRound.incorrectCount} mine{currentRound.incorrectCount !== 1 ? 's' : ''}
          </span>
        </p>
        <StrikeCountdown strikesLeft={strikesLeft} />
      </header>
      <RoundView key={currentRound.id} round={currentRound} gameState={gameState} />
    </div>
  );
}
