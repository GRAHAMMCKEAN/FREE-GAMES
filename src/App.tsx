import { useGameSession } from './hooks/useGameSession';
import { getMockGame } from './data/mock-game';
import { GameScreen } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';
import { BannerAd } from './components/BannerAd';
import { TermsFooter } from './components/TermsFooter';

const game = getMockGame();

export default function App() {
  const gameState = useGameSession(game);
  const { status, currentRound, session } = gameState;

  const mainContent =
    status === 'playing' && currentRound ? (
      <GameScreen game={game} gameState={gameState} />
    ) : (
      <EndScreen game={game} session={session} status={status} />
    );

  return (
    <div className="app-layout">
      <BannerAd />
      <div className="app-main">{mainContent}</div>
      <TermsFooter />
    </div>
  );
}
