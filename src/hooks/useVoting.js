import { useState, useEffect, useRef, useCallback } from 'react';
import { useVotingStore } from '@/store/votingStore';
import { TIMER_DURATION } from '@/utils/constants';

export function useVoting({ choices, onSubmit, autoAdvanceDelay = 200 }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);
  const { answers, currentIndex, setAnswer, nextQuestion, submit: storeSubmit, reset } = useVotingStore();

  const currentChoice = choices?.[currentIndex];
  const isLast = currentIndex === 7;
  const isComplete = answers.filter(Boolean).length === 8;

  const selectOption = useCallback((option) => {
    if (isTransitioning) return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    setAnswer(option);
    setIsTransitioning(true);

    setTimeout(() => {
      setIsTransitioning(false);
      if (isLast) {
        storeSubmit();
        const choicesStr = useVotingStore.getState().answers.join('');
        onSubmit?.(choicesStr);
      } else {
        nextQuestion();
        setTimeLeft(TIMER_DURATION);
      }
    }, autoAdvanceDelay);
  }, [isTransitioning, isLast, setAnswer, nextQuestion, storeSubmit, onSubmit, autoAdvanceDelay]);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Hết giờ → auto chọn A
          selectOption('A');
          return TIMER_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, selectOption]);

  // Reset khi bắt đầu vote mới
  const startVoting = useCallback(() => {
    reset();
    setTimeLeft(TIMER_DURATION);
  }, [reset]);

  return {
    timeLeft,
    currentChoice,
    currentIndex,
    answers,
    isLast,
    isComplete,
    isTransitioning,
    selectOption,
    startVoting,
  };
}
