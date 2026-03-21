import { create } from 'zustand';

export const useVotingStore = create(
  (set, get) => ({
    answers: [],       // ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']
    skipped: [],       // [false, false, true, false, ...] — đánh dấu câu nào đã skip
    currentIndex: 0,
    submitted: false,
    submittedAt: null,

    // Set answer cho câu hỏi hiện tại
    setAnswer: (choice) => {
      const { answers, currentIndex } = get();
      const newAnswers = [...answers];
      newAnswers[currentIndex] = choice;
      set({ answers: newAnswers });
    },

    // Skip câu hiện tại (đánh dấu null)
    skipQuestion: () => {
      const { answers, skipped, currentIndex, submitted } = get();
      if (submitted) return false;

      const skipCount = skipped.filter(Boolean).length;
      if (skipCount >= 2) return false;

      const newAnswers = [...answers];
      newAnswers[currentIndex] = null;
      const newSkipped = [...skipped];
      newSkipped[currentIndex] = true;
      set({ answers: newAnswers, skipped: newSkipped });
      return true;
    },

    // Số lần skip còn lại
    getSkipRemaining: () => {
      const { skipped } = get();
      return 2 - skipped.filter(Boolean).length;
    },

    // Next question
    nextQuestion: () => {
      set((state) => ({ currentIndex: Math.min(state.currentIndex + 1, 7) }));
    },

    // Previous question
    prevQuestion: () => {
      set((state) => ({ currentIndex: Math.max(state.currentIndex - 1, 0) }));
    },

    // Submit vote
    submit: () => {
      set({ submitted: true, submittedAt: new Date().toISOString() });
    },

    // Reset khi bắt đầu vote mới
    reset: () => {
      set({ answers: [], skipped: [], currentIndex: 0, submitted: false, submittedAt: null });
    },

    // Get choices string (8 ký tự 'A'/'B'/'S' cho skip)
    getChoicesString: () => {
      const { answers } = get();
      return answers.map(a => a ?? 'S').join('');
    },
  })
);
