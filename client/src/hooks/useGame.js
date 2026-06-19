import { useState, useCallback } from 'react';
import { createGame, submitResult } from '../services/api';
import { PHASES } from '../utils/gamePhases';

export { PHASES };

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
    startGame,
    submitRoute,
    resetToSetup,
    finishGame,
  };
}



