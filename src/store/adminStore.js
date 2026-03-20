import { create } from 'zustand';
import { mockHandlers } from '@/api/mock';

export const useAdminStore = create((set, get) => ({
  pendingCount: 0,

  loadPendingCount: async () => {
    const subs = await mockHandlers.getSubmissions();
    const count = subs.filter(s => s.status === 'pending').length;
    set({ pendingCount: count });
    return count;
  },

  setPendingCount: (count) => set({ pendingCount: count }),

  incrementPending: () => set(s => ({ pendingCount: s.pendingCount + 1 })),
  decrementPending: () => set(s => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
}));
