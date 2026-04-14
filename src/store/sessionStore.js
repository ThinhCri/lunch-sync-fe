import { create } from 'zustand';

export const useSessionStore = create(
  (set) => ({
    pin: null,
    sessionId: null,
    participantId: null,
    isHost: false,
    status: 'waiting',
    collectionId: null,
    collectionName: null,
    priceTier: null,
    priceDisplay: null,
    shareLink: null,
    participants: [],
    results: null,
    votingStartedAt: null,
    votedCount: 0,
    totalParticipants: 0,

    // Thiết lập session (host hoặc participant)
    setSession: (data) => set({ ...data, status: 'waiting' }),

    // Restore từ localStorage
    restore: () => {},

    // Cập nhật trạng thái
    setStatus: (status) => set({ status }),

    // Cập nhật participants
    setParticipants: (participants) => set({ participants }),

    // Cập nhật kết quả
    setResults: (results) => set({ results }),

    // Cập nhật thời điểm bắt đầu vote (cho countdown 90s)
    setVotingStartedAt: (votingStartedAt) => set({ votingStartedAt }),

    // Cập nhật số người đã vote
    setVotedCount: (votedCount, totalParticipants) => set({ votedCount, totalParticipants }),

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
        priceDisplay: null,
        shareLink: null,
        participants: [],
        results: null,
        votingStartedAt: null,
        votedCount: 0,
        totalParticipants: 0,
      });
    },
  })
);
