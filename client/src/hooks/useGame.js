import { useState, useCallback } from 'react';
import { createGame, submitResult } from '../services/api';
import { PHASES } from '../utils/gamePhases';

export { PHASES };

/**
 * Custom hook to manage the top-level game state and phase transitions.
 * It provides actions to start a new game, submit routes, and handle results.
 * 
 * @returns {object} The game state and actions:
 *  - phase: The current game phase (SETUP, PLANNING, EXECUTION, RESULT).
 *  - currentGame: The active game data (e.g., start and destination).
 *  - gameResult: The result of the submitted route.
 *  - gameActions: Object containing methods { startGame, submitRoute, resetToSetup, finishGame }.
 */
export function useGame() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const startGame = useCallback(async () => {
    const data = await createGame();
    setCurrentGame(data);
    setGameResult(null);
    setPhase(PHASES.PLANNING);
    return data;
  }, []);

  const submitRoute = useCallback(async (route) => {
    try {
      const result = await submitResult(route);
      setGameResult(result);
      setPhase(PHASES.EXECUTION);
      return result;
    } catch (err) {
      if (err.status === 403) {
        const expiredResult = { score: 0, steps: [], error: 'Time Expired!' };
        setGameResult(expiredResult);
        setPhase(PHASES.RESULT);
        return expiredResult;
      } else {
        throw err;
      }
    }
  }, []);

  const resetToSetup = useCallback(() => {
    setPhase(PHASES.SETUP);
  }, []);

  const finishGame = useCallback(() => {
    setPhase(PHASES.RESULT);
  }, []);

  return {
    phase,
    currentGame,
    gameResult,
    gameActions: {
      startGame,
      submitRoute,
      resetToSetup,
      finishGame,
    }
  };
}



