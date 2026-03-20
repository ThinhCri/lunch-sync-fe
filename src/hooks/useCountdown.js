import { useState, useEffect } from 'react';

export function useCountdown({ seconds, onComplete, enabled = true }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!enabled || seconds <= 0) return;

    setRemaining(seconds);

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, enabled]);

  const progress = seconds > 0 ? (remaining / seconds) * 100 : 0;

  return { remaining, progress };
}
