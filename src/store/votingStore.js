import { create } from 'zustand';

export const useVotingStore = create(
  (set, get) => ({
    answers: [],       // ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']
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
      set({ answers: [], currentIndex: 0, submitted: false, submittedAt: null });
    },

    // Get choices string (8 ký tự 'A'/'B')
    getChoicesString: () => {
      const { answers } = get();
      return answers.join('');
    },
  })
);
