import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing a countdown timer.
 * Automatically clears intervals and prevents stale-closure bugs
 * by tracking the active state and expiration callback using refs.
 * 
 * @param {boolean} active - Whether the timer is currently running.
 * @param {function} onExpire - Callback triggered when the timer reaches 0.
 * @returns {object} Timer controls:
 *  - timeLeft: The remaining time in seconds.
 *  - start: Function to start the timer with a specific duration `start(seconds)`.
 *  - clear: Function to clear and halt the timer.
 */
export function useTimer(active, onExpire) {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!active) {
      hasStartedRef.current = false;
      return;
    }

    // If active but the timer has not been started yet, do not trigger countdown or expire
    if (!hasStartedRef.current) return;

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else {
      onExpireRef.current();
    }
    return () => clearTimeout(timerRef.current);
  }, [active, timeLeft]);

  return {
    timeLeft,
    start: (seconds) => {
      hasStartedRef.current = true;
      setTimeLeft(seconds);
    },
    clear: () => {
      clearTimeout(timerRef.current);
      hasStartedRef.current = false;
    },
  };
}
