import { createContext, useContext, useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const store = useSessionStore;

  // Restore session từ localStorage khi app mount
  useEffect(() => {
    const saved = localStorage.getItem('lunchsync-session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        store.getState().restore(parsed);
      } catch {}
    }
  }, []);

  // Persist session khi store thay đổi
  useEffect(() => {
    const unsub = store.subscribe((state) => {
      localStorage.setItem('lunchsync-session', JSON.stringify({
        pin: state.pin,
        participantId: state.participantId,
        isHost: state.isHost,
      }));
    });
    return unsub;
  }, []);

  return (
    <SessionContext.Provider value={store}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSessionContext = () => useContext(SessionContext);
