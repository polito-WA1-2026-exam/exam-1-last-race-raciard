import { useMemo } from 'react';
import { PHASES } from './useGame';

/**
 * Custom hook to derive complex UI and gameplay state variables based on the game's phase.
 * It calculates the active segment, character animation state, current station, and highlights.
 * 
 * @param {string} phase - The current game phase (e.g., 'SETUP', 'PLANNING', 'EXECUTION', 'RESULT').
 * @param {object} gameResult - The payload containing execution steps, fail reasons, and scores.
 * @param {object} currentGame - Information about the current active game, including start and destination.
 * @param {number} execStep - The index of the current step during the EXECUTION phase.
 * @param {Array<string>} selectedRoute - The user's planned route as an array of station IDs.
 * @returns {object} Derived states: { currentSegment, characterState, currentStationId, highlightStations, showFailOverlay }
 */
export function useGameStateDerived(phase, gameResult, currentGame, execStep, selectedRoute) {
  return useMemo(() => {
    // 1. Base Variables
    const steps = gameResult?.steps || [];
    const isFinished = execStep >= steps.length;
    const currentStep = steps[execStep];
    const lastStep = steps[steps.length - 1];
    const hasFailedStep = steps.some(s => s.isFailed) || gameResult?.isInvalid;

    // 2. Derive Current Segment (Only active during execution on a valid step)
    const currentSegment = (phase === PHASES.EXECUTION && currentStep && !currentStep.isFailed) 
      ? { s1_id: currentStep.from, s2_id: currentStep.to } 
      : null;

    // 3. Derive Character State
    let characterState = 'idle';
    if (phase === PHASES.EXECUTION) {
      if (currentStep?.isFailed || (isFinished && lastStep?.isFailed)) {
        characterState = 'lose';
      } else if (!isFinished) {
        characterState = 'walk';
      }
    } else if (phase === PHASES.RESULT) {
      characterState = hasFailedStep ? 'lose' : (gameResult?.score > 0 ? 'win' : 'lose');
    }

    // 4. Derive Current Station ID
    let currentStationId = currentGame?.start?.id || null;
    if (phase === PHASES.SETUP) {
      currentStationId = null;
    } else if (phase === PHASES.PLANNING) {
      currentStationId = selectedRoute[selectedRoute.length - 1] || currentStationId;
    } else if (steps.length > 0) {
      currentStationId = isFinished 
        ? (lastStep.isFailed ? lastStep.from : lastStep.to) 
        : currentStep?.from;
    }

    // 5. Derive Highlights & Overlays
    const highlightStations = (phase !== PHASES.SETUP && currentGame) 
      ? [currentGame.start.id, currentGame.destination.id] 
      : [];

    const showFailOverlay = gameResult?.isInvalid && (
      phase === PHASES.RESULT || 
      (phase === PHASES.EXECUTION && (currentStep?.isFailed || (isFinished && lastStep?.isFailed)))
    );

    return {
      currentSegment,
      characterState,
      currentStationId,
      highlightStations,
      showFailOverlay
    };
  }, [phase, gameResult, currentGame, execStep, selectedRoute]);
}
