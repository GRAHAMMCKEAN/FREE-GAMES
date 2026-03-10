import { MAX_STRIKES } from '../types/nfl-minefield-types';

interface StrikeCountdownProps {
  strikesLeft: number;
}

export function StrikeCountdown({ strikesLeft }: StrikeCountdownProps) {
  const used = MAX_STRIKES - strikesLeft;
  return (
    <div className="strike-countdown" aria-label={`${strikesLeft} chances left`}>
      <span className="strike-label">Chances left:</span>
      <span className="strike-value">{strikesLeft}</span>
      <div className="strike-dots" aria-hidden>
        {Array.from({ length: MAX_STRIKES }).map((_, i) => (
          <span
            key={i}
            className={`strike-dot ${i < used ? 'used' : ''}`}
            title={i < used ? 'Strike used' : 'Chance remaining'}
          />
        ))}
      </div>
    </div>
  );
}
