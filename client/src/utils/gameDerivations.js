import { PHASES } from '../hooks/useGame';

/**
 * Derives the active network segment coordinates during journey execution.
 * 
 * @param {string} phase - The current game phase.
 * @param {object} currentStep - The current step of the execution phase.
 * @returns {object|null} The {s1_id, s2_id} segment object or null.
 */
export function getCurrentSegment(phase, currentStep) {
  return (phase === PHASES.EXECUTION && currentStep && !currentStep.isFailed) 
    ? { s1_id: currentStep.from, s2_id: currentStep.to } 
    : null;
}

/**
 * Derives the character's rendering animation state ('idle', 'walk', 'win', 'lose').
 * 
 * @param {string} phase - The current game phase.
 * @param {object} gameResult - The game result payload.
 * @param {number} execStep - The index of the current execution step.
 * @returns {string} The derived character animation state string.
 */
export function getCharacterState(phase, gameResult, execStep) {
  const steps = gameResult?.steps || [];
  const isFinished = execStep >= steps.length;
  const currentStep = steps[execStep];
  const lastStep = steps[steps.length - 1];
  const hasFailedStep = steps.some(s => s.isFailed) || gameResult?.isInvalid;

  if (phase === PHASES.EXECUTION) {
    if (currentStep?.isFailed || (isFinished && lastStep?.isFailed)) {
      return 'lose';
    } else if (!isFinished) {
      return 'walk';
    }
  } else if (phase === PHASES.RESULT) {
    return hasFailedStep ? 'lose' : (gameResult?.score > 0 ? 'win' : 'lose');
  }
  return 'idle';
}

/**
 * Derives the active/current station ID.
 * 
 * @param {string} phase - The current game phase.
 * @param {object} currentGame - Information about the active game.
 * @param {number} execStep - The index of the current execution step.
 * @param {object} gameResult - The game result payload.
 * @returns {string|null} The derived station ID.
 */
export function getCurrentStationId(phase, currentGame, execStep, gameResult) {
  const steps = gameResult?.steps || [];
  const isFinished = execStep >= steps.length;
  const currentStep = steps[execStep];
  const lastStep = steps[steps.length - 1];

  let currentStationId = currentGame?.start?.id || null;
  if (phase === PHASES.SETUP) {
    currentStationId = null;
  } else if (phase === PHASES.PLANNING) {
    currentStationId = currentGame?.start?.id || null;
  } else if (steps.length > 0) {
    currentStationId = isFinished 
      ? (lastStep.isFailed ? lastStep.from : lastStep.to) 
      : currentStep?.from;
  }
  return currentStationId;
}

/**
 * Derives the station IDs that should be highlighted (start & destination).
 * 
 * @param {string} phase - The current game phase.
 * @param {object} currentGame - Information about the active game.
 * @returns {Array<string>} The station IDs list.
 */
export function getHighlightStations(phase, currentGame) {
  return (phase !== PHASES.SETUP && currentGame) 
    ? [currentGame.start.id, currentGame.destination.id] 
    : [];
}
