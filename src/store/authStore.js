import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // JWT được server trả về khi login thành công, dùng để gắn vào header request
      userToken: null,
      user: null,

      // true khi có userToken (user đã login)
      isAuthenticated: () => !!get().userToken,

      // Lưu JWT + thông tin user sau khi login
      login: (userToken, user) => set({ userToken, user }),

      // Xoá JWT + user khi logout
      logout: () => set({ userToken: null, user: null }),

      restoreSession: () => {
        const state = get();
        if (state.userToken) {
          return true;
        }
        return false;
      },
    }),
    {
      name: 'lunchsync-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
