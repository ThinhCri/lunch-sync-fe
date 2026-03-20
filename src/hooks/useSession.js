import { useEffect, useRef } from 'react';
import { createPoller } from '@/utils/reconnect';

export function useSession({ pin, onStatus, interval = 3000, enabled = true }) {
  const pollingRef = useRef(null);
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    if (!pin || !enabled) {
      pollingRef.current?.stop();
      pollingRef.current = null;
      return;
    }
    pollingRef.current?.stop();
    pollingRef.current = createPoller(
      () => onStatusRef.current?.(),
      { interval, maxRetries: 3 }
    );
    pollingRef.current.start();
    return () => pollingRef.current?.stop();
  }, [pin, interval, enabled]);
}
