import { useMemo, useState } from 'react';
import { useGameSession, LAST_PLAYED_DATE_KEY } from './hooks/useGameSession';
import { getMockGame } from './data/mock-game';
import { todayGameDate } from './lib/build-round';
import { GameScreen } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';
import { PlayedTodayView } from './components/PlayedTodayView';
import { BannerAd } from './components/BannerAd';
import { TermsFooter } from './components/TermsFooter';

function formatGameDate(isoDate: string): string {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function App() {
  const today = useMemo(() => todayGameDate(), []);
  const [hasPlayedToday] = useState(() => {
    try {
      return localStorage.getItem(LAST_PLAYED_DATE_KEY) === today;
    } catch {
      return false;
    }
  });

  const game = useMemo(() => getMockGame(), []);
  const gameState = useGameSession(game);
  const { status, currentRound, session } = gameState;

  if (hasPlayedToday) {
    return (
      <div className="app-layout">
        <BannerAd />
        <div className="app-main">
          <PlayedTodayView dateLabel={formatGameDate(today)} />
        </div>
        <TermsFooter />
      </div>
    );
  }

  const dateLabel = formatGameDate(game.date);
  const mainContent =
    status === 'playing' && currentRound ? (
      <GameScreen game={game} gameState={gameState} dateLabel={dateLabel} />
    ) : (
      <EndScreen game={game} session={session} status={status} dateLabel={dateLabel} />
    );

  return (
    <div className="app-layout">
      <BannerAd />
      <div className="app-main">{mainContent}</div>
      <TermsFooter />
    </div>
  );
}
