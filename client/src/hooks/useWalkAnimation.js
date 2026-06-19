import { useState, useEffect } from 'react';

/**
 * Custom hook to manage the walking animation during the EXECUTION phase.
 * It uses requestAnimationFrame to drive a frame-by-frame animation loop,
 * calculating the walking progress and updating the current execution step.
 * 
 * @param {string} phase - The current game phase (e.g., 'EXECUTION').
 * @param {object} gameResult - The result containing steps to animate.
 * @param {function} finishGame - Callback to trigger when the animation finishes.
 * @param {function} setExecStep - Callback to update the current execution step index.
 * @returns {number} The current walk progress as a percentage between 0 and 1.
 */
export function useWalkAnimation(phase, gameResult, finishGame, setExecStep) {
  const [walkProgress, setWalkProgress] = useState(0);

  useEffect(() => {
    if (phase !== 'EXECUTION' || !gameResult) {
      return;
    }

    if (!gameResult.steps || gameResult.steps.length === 0) {
      finishGame?.();
      return;
    }

    let currentStep = 0;
    let startTimestamp = null;
    const walkDuration = 1000; // 1 second walk duration
    const pauseDuration = 200; // 0.2 second pause at stations
    const segmentDuration = walkDuration + pauseDuration;
    let animId;

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      // Determine which step index we are on
      const stepIndex = Math.floor(elapsed / segmentDuration);

      if (stepIndex < gameResult.steps.length) {
        if (stepIndex !== currentStep) {
          currentStep = stepIndex;
          setExecStep(stepIndex);
        }

        const stepElapsed = elapsed % segmentDuration;
        const progress = Math.min(stepElapsed / walkDuration, 1);
        setWalkProgress(progress);

        animId = requestAnimationFrame(animate);
      } else {
        // We have completed all steps!
        setExecStep(gameResult.steps.length);
        setWalkProgress(0);

        // Pause briefly at the final station, then finish the execution phase
        const delay = setTimeout(() => {
          finishGame?.();
        }, 1000);

        return () => clearTimeout(delay);
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [phase, gameResult, setExecStep, finishGame]);

  return walkProgress;
}
