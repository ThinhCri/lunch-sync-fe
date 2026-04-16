import { create } from 'zustand';

export const useVotingStore = create(
  (set, get) => ({
    answers: [],
    currentIndex: 0,
    submitted: false,
    submittedAt: null,

    setAnswer: (choice) => {
      const { answers, currentIndex } = get();
      const newAnswers = [...answers];
      newAnswers[currentIndex] = choice;
      set({ answers: newAnswers });
    },

    nextQuestion: () => {
      set((state) => ({ currentIndex: Math.min(state.currentIndex + 1, 7) }));
    },

    prevQuestion: () => {
      set((state) => ({ currentIndex: Math.max(state.currentIndex - 1, 0) }));
    },

    submit: () => {
      set({ submitted: true, submittedAt: new Date().toISOString() });
    },

    reset: () => {
      set({ answers: [], currentIndex: 0, submitted: false, submittedAt: null });
    },

    getAnswers: () => {
      return get().answers.map(a => a ?? 'A').join('');
    },
  })
);
