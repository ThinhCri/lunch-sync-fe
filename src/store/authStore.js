import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'admin',

      login: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),

      restoreSession: () => {
        const state = get();
        if (state.token) {
          return true;
        }
        return false;
      },
    }),
    { name: 'lunchsync-auth' }
  )
);
