import { NflShield } from './NflShield';

interface PlayedTodayViewProps {
  /** Formatted date string (e.g. "March 5, 2025") */
  dateLabel: string;
}

export function PlayedTodayView({ dateLabel }: PlayedTodayViewProps) {
  return (
    <div className="played-today-screen">
      <h1 className="played-today-title">
        <NflShield className="game-title-shield" />
        NFL Minefield
      </h1>
      <p className="played-today-date" aria-live="polite">
        {dateLabel}
      </p>
      <div className="played-today-check" role="img" aria-label="Played today">
        <span className="played-today-check-icon">✓</span>
      </div>
      <p className="played-today-message">You&apos;ve already played today.</p>
      <p className="played-today-cta">Check back tomorrow for new questions.</p>
    </div>
  );
}
