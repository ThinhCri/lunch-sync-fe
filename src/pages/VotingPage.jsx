import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useVoting } from '@/hooks/useVoting';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { MAX_SKIP_COUNT } from '@/utils/constants';
import styles from './VotingPage.module.css';

const TOTAL_QUESTIONS = 8;

function CircularTimer({ timeLeft, total = 15 }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const strokeDashoffset = circumference * (1 - progress);
  const isUrgent = timeLeft <= 5;

  return (
    <div className={`${styles.timerRing} ${isUrgent ? styles.urgent : ''}`}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="5" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={isUrgent ? '#e65100' : 'var(--color-primary)'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className={styles.timerText}>{timeLeft}</div>
    </div>
  );
}

function ChoiceButton({ label, letter, selected, disabled, onClick }) {
  return (
    <motion.button
      type="button"
      className={`${styles.choiceBtn} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      <span className={styles.choiceLetter}>{letter}</span>
      <span className={styles.choiceLabel}>{label}</span>
    </motion.button>
  );
}

export default function VotingPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participantId } = useSessionStore();
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  // Reconnect: sync status when tab comes back
  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.sessions.getStatus(pin);
      const data = res.data;
      if (data.error) return;
      if (data.status === 'results') {
        navigate(`/results/${pin}`);
      } else if (data.status === 'waiting') {
        navigate(`/waiting/${pin}`);
      }
    } catch {}
  }, [pin, navigate]);

  useSession({ pin, onStatus: fetchStatus, enabled: true });
  useReconnect({ onReconnect: fetchStatus, enabled: true });

  // Load choices + restore voting state
  useEffect(() => {
    Promise.all([
      api.sessions.getChoices(pin),
      Promise.resolve(),
    ]).then(([choicesRes]) => {
      setChoices(choicesRes.data);
      setCardKey((k) => k + 1);
      setLoading(false);
    });
  }, []);

  const handleSubmit = useCallback(async (choicesStr) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.sessions.vote(pin, { participantId, choices: choicesStr });
    } catch {
      message.error('Gửi phiếu thất bại, đang thử lại...');
      setSubmitting(false);
      return;
    }
    navigate(`/voting-wait/${pin}`);
  }, [pin, participantId, navigate, submitting]);

  const {
    timeLeft,
    currentChoice,
    currentIndex,
    answers,
    skipped,
    skipRemaining,
    isTransitioning,
    selectOption,
    handleSkip,
    startVoting,
  } = useVoting({ choices, onSubmit: handleSubmit });

  // Start voting on mount — không đưa startVoting vào deps để tránh recreated
  useEffect(() => {
    if (!loading && choices.length > 0) {
      startVoting();
      setCardKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, choices.length]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <span /><span /><span />
          </div>
          <p>Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  const answeredCount = answers.filter(Boolean).length;
  const skippedCount = skipped.filter(Boolean).length;
  const progressPct = (currentIndex / TOTAL_QUESTIONS) * 100;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.questionCount}>
          Câu {currentIndex + 1}/{TOTAL_QUESTIONS}
        </span>
        <CircularTimer timeLeft={timeLeft} />
        <span className={styles.answered}>
          {answeredCount}/{TOTAL_QUESTIONS}
        </span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <motion.div
          className={styles.progressFill}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Dots */}
      <div className={styles.dots}>
        {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
          const isAnswered = !!answers[i];
          const isSkipped = !!skipped[i];
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              className={`${styles.dot} ${isAnswered ? styles.dotAnswered : ''} ${isSkipped ? styles.dotSkipped : ''} ${isCurrent ? styles.dotCurrent : ''}`}
            />
          );
        })}
      </div>

      {/* Choice cards */}
      <div className={styles.cardArea}>
        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            className={styles.card}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {currentChoice && (
              <>
                <div className={styles.questionText}>
                  Bạn thích{' '}
                  <span className={styles.highlightA}>{currentChoice.optionA}</span>{' '}
                  hay{' '}
                  <span className={styles.highlightB}>{currentChoice.optionB}</span>
                  ?
                </div>

                <div className={styles.choices}>
                  <ChoiceButton
                    label={currentChoice.optionA}
                    letter="A"
                    selected={answers[currentIndex] === 'A'}
                    disabled={isTransitioning}
                    onClick={() => { selectOption('A'); if (navigator.vibrate) navigator.vibrate(10); }}
                  />
                  <ChoiceButton
                    label={currentChoice.optionB}
                    letter="B"
                    selected={answers[currentIndex] === 'B'}
                    disabled={isTransitioning}
                    onClick={() => { selectOption('B'); if (navigator.vibrate) navigator.vibrate(10); }}
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <div className={styles.skipArea}>
        {skipRemaining > 0 ? (
          <button
            className={styles.skipBtn}
            onClick={handleSkip}
            disabled={isTransitioning}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4"/>
              <line x1="19" y1="5" x2="19" y2="19"/>
            </svg>
            Bỏ qua {skipRemaining}/{MAX_SKIP_COUNT}
          </button>
        ) : (
          <p className={styles.skipHint}>Đã hết lượt bỏ qua</p>
        )}
      </div>

      {/* Submitting overlay */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            className={styles.submittingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.submittingBox}>
              <div className={styles.spinner} />
              <p>Đang gửi phiếu...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
