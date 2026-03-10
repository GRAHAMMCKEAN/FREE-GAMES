import type { Box } from '../types/nfl-minefield-types';
import { isPlayerBox } from '../types/nfl-minefield-types';
import { getTeamColor, PLAYER_SILHOUETTE_URL } from '../espn-assets';

interface BoxCellProps {
  box: Box;
  revealed: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function ImgWithFallback({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className: string;
  fallback: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.src !== fallback && !el.dataset.fallbackUsed) {
          el.dataset.fallbackUsed = '1';
          el.src = fallback;
        }
      }}
    />
  );
}

const FALLBACK_LOGO = 'https://ui-avatars.com/api?name=TEAM&size=48&background=2d2d2d&color=fff';

/** When headshot fails to load, show silhouette instead of initials. */
function getFallbackHeadshotUrl(_playerName: string): string {
  return PLAYER_SILHOUETTE_URL;
}

function getBoxTeamNickname(box: Box): string {
  if (isPlayerBox(box)) return box.teamNickname ?? '';
  return box.teamNickname;
}

export function BoxCell({ box, revealed, disabled, onSelect }: BoxCellProps) {
  const isMine = revealed && !box.isCorrect;
  const isSafe = revealed && box.isCorrect;
  const teamNickname = getBoxTeamNickname(box);
  const teamColor = getTeamColor(teamNickname);

  return (
    <button
      type="button"
      className={`box-cell ${!isPlayerBox(box) ? 'box-cell--team' : ''} ${revealed ? 'revealed' : ''} ${isMine ? 'mine' : ''} ${isSafe ? 'safe' : ''}`}
      style={{ '--box-team-color': teamColor } as React.CSSProperties}
      disabled={disabled || revealed}
      onClick={onSelect}
      aria-pressed={revealed}
      aria-label={revealed ? (isMine ? 'Mine - wrong answer' : 'Correct answer') : 'Select this option'}
    >
      {isPlayerBox(box) ? (
        <>
          <span className="box-cell-glow box-cell-logo-glow">
            <ImgWithFallback
              src={box.teamLogoUrl}
              alt=""
              className="box-cell-logo"
              fallback={FALLBACK_LOGO}
            />
          </span>
          <span className="box-cell-glow box-cell-headshot-glow">
            <ImgWithFallback
              src={box.headshotUrl}
              alt=""
              className="box-cell-headshot"
              fallback={getFallbackHeadshotUrl(box.playerName)}
            />
          </span>
          <span className="box-cell-name">{box.playerName}</span>
          <span className="box-cell-meta">{box.position}</span>
        </>
      ) : (
        <>
          <span className="box-cell-glow box-cell-logo-glow box-cell-team-logo-glow">
            <ImgWithFallback
              src={box.teamLogoUrl}
              alt=""
              className="box-cell-logo box-cell-team-logo"
              fallback={FALLBACK_LOGO}
            />
          </span>
          <span className="box-cell-name box-cell-name--team">{box.teamNickname}</span>
        </>
      )}
      {revealed && (
        <span className="box-cell-result" aria-hidden>
          {isMine ? '💥' : '✓'}
        </span>
      )}
    </button>
  );
}
