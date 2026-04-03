import { createContext, useContext, useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const store = useSessionStore;

  // Restore session từ localStorage khi app mount
  useEffect(() => {
    store.getState().restore();
  }, []);

  // Persist session khi store thay đổi
  useEffect(() => {
    const unsub = store.subscribe((state) => {
      if (state.pin) {
        localStorage.setItem('lunchsync-session', JSON.stringify({
          pin: state.pin,
          sessionId: state.sessionId,
          participantId: state.participantId,
          isHost: state.isHost,
          collectionId: state.collectionId,
          collectionName: state.collectionName,
          priceTier: state.priceTier,
          priceDisplay: state.priceDisplay,
        }));
      } else {
        localStorage.removeItem('lunchsync-session');
      }
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
