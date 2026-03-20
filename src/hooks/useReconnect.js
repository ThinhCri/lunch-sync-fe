import { useEffect, useRef, useCallback } from 'react';
import { onVisibilityChange } from '@/utils/reconnect';

export function useReconnect({ onReconnect, enabled = true }) {
  const callbackRef = useRef(onReconnect);

  useEffect(() => {
    callbackRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!enabled) return;
    return onVisibilityChange(() => {
      callbackRef.current?.();
    });
  }, [enabled]);
}
