import { useState, useEffect, useRef, useCallback } from 'react';
import { useVotingStore } from '@/store/votingStore';
import { TIMER_DURATION, MAX_SKIP_COUNT } from '@/utils/constants';

export function useVoting({ choices, onSubmit, autoAdvanceDelay = 300 }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const transitioningRef = useRef(false);
  const currentIndexRef = useRef(0);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  // Sync from store after mount (avoid setState during render)
  useEffect(() => {
    const state = useVotingStore.getState();
    currentIndexRef.current = state.currentIndex;
    setCurrentIndex(state.currentIndex);
    setAnswers(state.answers);
    setSkipped(state.skipped);

    const unsub = useVotingStore.subscribe((s) => {
      setCurrentIndex(s.currentIndex);
      currentIndexRef.current = s.currentIndex;
      setAnswers(s.answers);
      setSkipped(s.skipped);
    });
    return unsub;
  }, []);

  const currentChoice = choices?.[currentIndex];
  const isLast = currentIndex === 7;
  const skipRemaining = 2 - skipped.filter(Boolean).length;

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
        const choicesStr = useVotingStore.getState().getChoicesString();
        onSubmitRef.current?.(choicesStr);
      } else {
        useVotingStore.getState().nextQuestion();
        currentIndexRef.current = nextIndex;
        setTimeLeft(TIMER_DURATION);
        transitioningRef.current = false;
        setIsTransitioning(false);
      }
    }, autoAdvanceDelay);
  }, [autoAdvanceDelay]);

  const handleSkip = useCallback(() => {
    if (transitioningRef.current) return;
    const skipRemaining = useVotingStore.getState().getSkipRemaining();
    if (skipRemaining <= 0) return;
    if (navigator.vibrate) navigator.vibrate(10);

    transitioningRef.current = true;
    setIsTransitioning(true);
    useVotingStore.getState().skipQuestion();

    setTimeout(() => {
      const { currentIndex: idx } = useVotingStore.getState();
      const nextIndex = idx + 1;

      if (nextIndex > 7) {
        useVotingStore.getState().submit();
        const choicesStr = useVotingStore.getState().getChoicesString();
        onSubmitRef.current?.(choicesStr);
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
          // Hết giờ: skip nếu còn quota, không thì auto-chọn A
          const skipRemaining = useVotingStore.getState().getSkipRemaining();
          if (skipRemaining > 0) {
            handleSkip();
          } else {
            selectOption('A');
          }
          return TIMER_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectOption, handleSkip]);

  const startVoting = useCallback(() => {
    useVotingStore.getState().reset();
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    transitioningRef.current = false;
    setTimeLeft(TIMER_DURATION);
    setIsTransitioning(false);
    setAnswers([]);
    setSkipped([]);
  }, []);

  return {
    timeLeft,
    currentChoice,
    currentIndex,
    answers,
    skipped,
    skipRemaining,
    isLast,
    isComplete: answers.filter(Boolean).length === 8,
    isTransitioning,
    selectOption,
    handleSkip,
    startVoting,
  };
}


