import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      isAuthenticated: () => !!get().accessToken,

      loginWithTokens: ({ access_token, refresh_token, user }) => {
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          user: user || null,
        });
      },

      setUser: (user) => set({ user }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      restoreSession: () => !!get().accessToken,
    }),
    {
      name: 'lunchsync-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
