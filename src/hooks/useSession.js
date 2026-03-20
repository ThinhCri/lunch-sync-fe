import { useEffect, useRef, useCallback } from 'react';
import { createPoller } from '@/utils/reconnect';

export function useSession({ pin, onStatus, interval = 3000, enabled = true }) {
  const pollingRef = useRef(null);

  const start = useCallback(() => {
    if (!pin || !enabled) return;
    pollingRef.current = createPoller(
      () => onStatus?.(),
      { interval, maxRetries: 3 }
    );
    pollingRef.current.start();
  }, [pin, onStatus, interval, enabled]);

  const stop = useCallback(() => {
    pollingRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      pollingRef.current?.stop();
    };
  }, []);

  return { start, stop };
}
