import { create } from 'zustand';
import { api } from '@/api';

export const useAdminStore = create((set, get) => ({
  pendingCount: 0,

  loadPendingCount: async () => {
    const res = await api.admin.submissions.list({ status: 'pending' });
    const data = res.data;
    if (data.error) return 0;
    const count = (data.submissions || []).filter(s => s.status === 'pending').length;
    set({ pendingCount: count });
    return count;
  },

  setPendingCount: (count) => set({ pendingCount: count }),

  incrementPending: () => set(s => ({ pendingCount: s.pendingCount + 1 })),
  decrementPending: () => set(s => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
}));
