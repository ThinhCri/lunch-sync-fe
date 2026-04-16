import { useState, useEffect, useRef, useCallback } from 'react';
import { useVotingStore } from '@/store/votingStore';
import { TIMER_DURATION } from '@/utils/constants';

export function useVoting({ choices, onSubmit, autoAdvanceDelay = 300 }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const transitioningRef = useRef(false);
  const currentIndexRef = useRef(0);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Sync from store after mount
  useEffect(() => {
    const sync = () => {
      const state = useVotingStore.getState();
      currentIndexRef.current = state.currentIndex;
      setCurrentIndex(state.currentIndex);
      setAnswers(state.answers);
    };

    sync();

    const unsub = useVotingStore.subscribe((s) => {
      setCurrentIndex(s.currentIndex);
      currentIndexRef.current = s.currentIndex;
      setAnswers(s.answers);
    });
    return unsub;
  }, []);

  const currentChoice = choices?.[currentIndex];
  const isLast = currentIndex === 7;

  const selectOption = useCallback((option) => {
    if (transitioningRef.current) return;
    if (navigator.vibrate) navigator.vibrate(10);

    transitioningRef.current = true;
    setIsTransitioning(true);
    useVotingStore.getState().setAnswer(option);

    setTimeout(() => {
      const { currentIndex: idx } = useVotingStore.getState();
      const nextIndex = idx + 1;

      if (nextIndex > 7) {
        useVotingStore.getState().submit();
        const answersArr = useVotingStore.getState().getAnswers();
        onSubmitRef.current?.(answersArr);
      } else {
        useVotingStore.getState().nextQuestion();
        currentIndexRef.current = nextIndex;
        setTimeLeft(TIMER_DURATION);
        transitioningRef.current = false;
        setIsTransitioning(false);
      }
    }, autoAdvanceDelay);
  }, [autoAdvanceDelay]);

  // Timer per question
  useEffect(() => {
    const interval = setInterval(() => {
      if (transitioningRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          selectOption('A');
          return TIMER_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectOption]);

  const startVoting = useCallback(() => {
    useVotingStore.getState().reset();
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    transitioningRef.current = false;
    setTimeLeft(TIMER_DURATION);
    setIsTransitioning(false);
    setAnswers([]);
  }, []);

  return {
    timeLeft,
    currentChoice,
    currentIndex,
    answers,
    isLast,
    isComplete: answers.length === 8,
    isTransitioning,
    selectOption,
    startVoting,
  };
}
