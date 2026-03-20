import { create } from 'zustand';
import { storage } from '@/utils/storage';

export const useSessionStore = create(
  (set, get) => ({
    pin: null,
    sessionId: null,
    participantId: null,
    isHost: false,
    status: 'waiting',
    collectionId: null,
    collectionName: null,
    priceTier: null,
    participants: [],
    results: null,

    // Thiết lập session (host hoặc participant)
    setSession: ({ pin, sessionId, participantId, isHost }) => {
      set({ pin, sessionId, participantId, isHost, status: 'waiting' });
    },

    // Restore từ localStorage
    restore: ({ pin, participantId, isHost }) => {
      set({ pin, participantId, isHost });
    },

    // Cập nhật trạng thái
    setStatus: (status) => set({ status }),

    // Cập nhật participants
    setParticipants: (participants) => set({ participants }),

    // Cập nhật kết quả
    setResults: (results) => set({ results }),

    // Reset khi session kết thúc
    reset: () => {
      set({
        pin: null,
        sessionId: null,
        participantId: null,
        isHost: false,
        status: 'waiting',
        collectionId: null,
        collectionName: null,
        priceTier: null,
        participants: [],
        results: null,
      });
    },
  })
);
