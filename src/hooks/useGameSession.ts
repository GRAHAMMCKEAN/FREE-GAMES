import { useState, useCallback, useEffect, useRef } from 'react';
import type { Game, GameSession, Round, Box } from '../types/nfl-minefield-types';
import { createInitialSession, MAX_STRIKES, ROUNDS_PER_GAME } from '../types/nfl-minefield-types';

/** Delay (ms) before auto-advancing to next round after clearing — no continue button. */
const AUTO_ADVANCE_MS = 1200;

export const LAST_PLAYED_DATE_KEY = 'nfl-minefield-lastPlayedDate';

export interface UseGameSessionReturn {
  session: GameSession;
  currentRound: Round | null;
  strikesLeft: number;
  isRevealed: (boxId: string) => boolean;
  revealBox: (box: Box) => void;
  status: GameSession['status'];
}

export function useGameSession(game: Game): UseGameSessionReturn {
  const [session, setSession] = useState<GameSession>(() => createInitialSession(game.id));
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentRound =
    session.currentRoundIndex >= 0 && session.currentRoundIndex < game.rounds.length
      ? game.rounds[session.currentRoundIndex]
      : null;

  const strikesLeft = MAX_STRIKES - session.strikesUsed;

  const isRevealed = useCallback(
    (boxId: string) => session.revealedBoxIds.includes(boxId),
    [session.revealedBoxIds]
  );

  // Auto-advance when round is cleared (no continue button)
  useEffect(() => {
    if (!session.roundCompletePending || session.status !== 'playing' || !currentRound) return;

    advanceTimeoutRef.current = setTimeout(() => {
      advanceTimeoutRef.current = null;
      setSession((prev) => {
        const nextRoundIndex = prev.currentRoundIndex + 1;
        if (nextRoundIndex >= ROUNDS_PER_GAME) {
          return {
            ...prev,
            currentRoundIndex: nextRoundIndex,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            roundCompletePending: false,
          };
        }
        return {
          ...prev,
          currentRoundIndex: nextRoundIndex,
          roundCompletePending: false,
        };
      });
    }, AUTO_ADVANCE_MS);

    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
    };
  }, [session.roundCompletePending, session.status, session.currentRoundIndex, currentRound?.id]);

  // Persist "played today" when game ends so we can show "Check back tomorrow" on return
  useEffect(() => {
    if (session.status === 'completed' || session.status === 'eliminated') {
      try {
        localStorage.setItem(LAST_PLAYED_DATE_KEY, game.date);
      } catch {
        // ignore storage errors
      }
    }
  }, [session.status, game.date]);

  const revealBox = useCallback(
    (box: Box) => {
      if (session.status !== 'playing' || !currentRound) return;
      if (session.revealedBoxIds.includes(box.id)) return;

      setSession((prev) => {
        const nextRevealed = [...prev.revealedBoxIds, box.id];

        if (box.isCorrect) {
          const correctRevealedNow = currentRound.boxes.filter(
            (b) => b.isCorrect && (b.id === box.id || prev.revealedBoxIds.includes(b.id))
          ).length;
          const justClearedRound = correctRevealedNow >= currentRound.correctCount;

          if (justClearedRound) {
            return {
              ...prev,
              revealedBoxIds: nextRevealed,
              roundCompletePending: true,
            };
          }

          const nextRoundIndex = prev.currentRoundIndex + 1;
          if (nextRoundIndex >= ROUNDS_PER_GAME) {
            return {
              ...prev,
              revealedBoxIds: nextRevealed,
              currentRoundIndex: nextRoundIndex,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
            };
          }
          return {
            ...prev,
            revealedBoxIds: nextRevealed,
            currentRoundIndex: nextRoundIndex,
          };
        }

        const nextStrikes = prev.strikesUsed + 1;
        if (nextStrikes >= MAX_STRIKES) {
          return {
            ...prev,
            revealedBoxIds: nextRevealed,
            strikesUsed: nextStrikes,
            status: 'eliminated' as const,
            completedAt: new Date().toISOString(),
          };
        }
        return {
          ...prev,
          revealedBoxIds: nextRevealed,
          strikesUsed: nextStrikes,
        };
      });
    },
    [session.status, session.revealedBoxIds, currentRound]
  );

  return {
    session,
    currentRound,
    strikesLeft,
    isRevealed,
    revealBox,
    status: session.status,
  };
}
