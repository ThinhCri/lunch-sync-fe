import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      isAuthenticated: () => !!get().token,

      login: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),

      // Khôi phục session từ localStorage, kiểm tra token hết hạn
      restoreSession: () => {
        const state = get();
        if (state.token) {
          // Mock: coi như token còn valid
          return true;
        }
        return false;
      },
    }),
    { name: 'lunchsync-auth' }
  )
);
