import { useEffect, useRef, useState } from 'react';
import { formatCountdown } from '@/utils/format';
import { SESSION_EXPIRY_MINUTES } from '@/utils/constants';
import styles from './SessionTimer.module.css';

export function SessionTimer({ createdAt, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!createdAt) return SESSION_EXPIRY_MINUTES * 60;
    const elapsed = (Date.now() - createdAt) / 1000;
    const left = SESSION_EXPIRY_MINUTES * 60 - elapsed;
    return Math.max(0, Math.floor(left));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const warning = secondsLeft < 120; // < 2 phút

  return (
    <div className={`${styles.timer} ${warning ? styles.warning : ''}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <span>{formatCountdown(secondsLeft)}</span>
    </div>
  );
}
