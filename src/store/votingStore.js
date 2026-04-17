import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVotingStore = create(
  persist(
    (set, get) => ({
      answers: [],
      currentIndex: 0,
      submitted: false,
      submittedAt: null,
      sessionPin: null,

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

    setSessionPin: (pin) => {
      set({ sessionPin: pin });
    },

      reset: () => {
        set({ answers: [], currentIndex: 0, submitted: false, submittedAt: null, sessionPin: null });
      },

      getAnswers: () => {
        return get().answers.map(a => a ?? 'A').join('');
      },
    }),
    {
      name: 'lunchsync-voting-store',
      partialize: (state) => ({
        answers: state.answers,
        currentIndex: state.currentIndex,
        submitted: state.submitted,
        submittedAt: state.submittedAt,
        sessionPin: state.sessionPin,
      }),
    }
  )
);
