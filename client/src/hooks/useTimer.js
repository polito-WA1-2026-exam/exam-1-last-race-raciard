import { useState, useEffect, useRef } from 'react';

/**
 * Countdown timer. onExpire is stored in a ref so callers
 * don't need to memoize it to avoid stale-closure bugs.
 */
export function useTimer(active, onExpire) {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!active) return;
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else {
      onExpireRef.current();
    }
    return () => clearTimeout(timerRef.current);
  }, [active, timeLeft]);

  return {
    timeLeft,
    start: (seconds) => setTimeLeft(seconds),
    clear: () => clearTimeout(timerRef.current),
  };
}
