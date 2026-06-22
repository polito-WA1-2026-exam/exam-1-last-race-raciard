import { useState, useCallback, useEffect } from 'react';
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
 *  - selectedRoute: The active route planned by the user.
 *  - gameActions: Object containing methods { startGame, submitRoute, resetToSetup, finishGame, setSelectedRoute }.
 */
export function useGame() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [endTime, setEndTime] = useState(null);

  const submitRoute = useCallback(async (route) => {
    try {
      setEndTime(null);
      const result = await submitResult(route);
      setGameResult(result);
      setPhase(PHASES.EXECUTION);
      return result;
    } catch (err) {
      setEndTime(null);
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

  // Handle 90-second planning timeout based on remaining time
  useEffect(() => {
    if (phase === PHASES.PLANNING && endTime) {
      const remainingTime = endTime - Date.now();
      const id = setTimeout(() => {
        submitRoute(selectedRoute);
      }, Math.max(0, remainingTime));

      return () => clearTimeout(id);
    }
  }, [phase, endTime, selectedRoute, submitRoute]);

  const startGame = useCallback(async () => {
    const data = await createGame();
    setCurrentGame(data);
    setGameResult(null);
    setSelectedRoute([]);
    setEndTime(Date.now() + 90000);
    setPhase(PHASES.PLANNING);
    return data;
  }, []);

  const resetToSetup = useCallback(() => {
    setEndTime(null);
    setPhase(PHASES.SETUP);
  }, []);

  const finishGame = useCallback(() => {
    setPhase(PHASES.RESULT);
  }, []);

  return {
    phase,
    currentGame,
    gameResult,
    selectedRoute,
    endTime,
    gameActions: {
      startGame,
      submitRoute,
      resetToSetup,
      finishGame,
      setSelectedRoute,
    }
  };
}



