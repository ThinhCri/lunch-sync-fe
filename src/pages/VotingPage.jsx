import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useVoting } from '@/hooks/useVoting';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { MAX_SKIP_COUNT } from '@/utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward, faLock, faInbox } from '@fortawesome/free-solid-svg-icons';

const TOTAL_QUESTIONS = 8;

function CircularTimer({ timeLeft, total = 15 }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const strokeDashoffset = circumference * (1 - progress);
  const isUrgent = timeLeft <= 5;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
        <circle 
          cx="48" cy="48" r={radius} 
          fill="none" 
          stroke="var(--color-outline-variant)" 
          strokeWidth="6" 
          className="opacity-30"
        />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={isUrgent ? 'var(--color-accent-red)' : 'var(--color-primary)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className={`absolute text-3xl font-black font-headline ${isUrgent ? 'text-accent-red animate-pulse' : 'text-primary'}`}>
        {timeLeft}
      </div>
    </div>
  );
}

function ChoiceButton({ label, letter, selected, disabled, onClick }) {
  return (
    <motion.button
      type="button"
      className={`relative w-full overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border-2 transition-all ${
        selected
          ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]'
          : 'bg-white border-outline/30 text-on-surface hover:border-primary/50 hover:bg-surface-container hover:shadow-lg'
      } ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      animate={selected ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      <div className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
        selected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
      }`}>
        {letter}
      </div>
      <span className="text-xl sm:text-2xl font-bold text-center mt-4">
        {label}
      </span>
      {selected && (
        <motion.div
          className="absolute inset-0 bg-primary/5 rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
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
    } catch {
      // ignore
    }
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
  }, [pin]);

  const handleSubmit = useCallback(async (answersArr) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.sessions.vote(pin, { participantId, choices: answersArr });
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
    skipRemaining,
    isTransitioning,
    selectOption,
    handleSkip,
    startVoting,
  } = useVoting({ choices, onSubmit: handleSubmit });

  // Start voting on mount
  useEffect(() => {
    if (!loading && choices.length > 0) {
      startVoting();
      setCardKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, choices.length]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center pt-24 pb-32 px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-semibold">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  const answeredCount = answers.filter(Boolean).length;
  const progressPct = ((currentIndex) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="min-h-[100dvh] bg-surface-container/30 flex flex-col items-center overflow-x-hidden pt-24 px-4 pb-32 relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl flex flex-col flex-1 z-10">
        {/* Top Navigation / Progress */}
        <div className="w-full mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-[0.2em]">Tiến trình</span>
              <span className="text-lg font-headline font-black text-on-surface">
                CÂU {currentIndex + 1} <span className="text-on-surface-variant/40">/ {TOTAL_QUESTIONS}</span>
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-[0.2em]">Hoàn thành</span>
              <span className="text-lg font-headline font-black text-primary">
                {answeredCount} <span className="text-primary/30">/ {TOTAL_QUESTIONS}</span>
              </span>
            </div>
          </div>

          <div className="relative h-3 bg-surface-container rounded-full overflow-hidden border border-outline/5 shadow-inner">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary to-secondary rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        {/* Question Title */}
        <div className="text-center mb-10 px-4">
          <motion.h2 
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-headline font-black text-on-surface tracking-tight leading-[1.1]"
          >
            {currentChoice?.id === 'BC-1' ? "Giai điệu trưa nay của bạn là..." : "Bạn đang nghiêng về..."}
          </motion.h2>
          <p className="mt-2 text-on-surface-variant text-sm sm:text-base font-medium">Hãy chọn phương án khiến bạn thèm nhất!</p>
        </div>

        {/* VS Cards Area */}
        <div className="relative flex-1 flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={cardKey}
              className="w-full"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentChoice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center relative">
                  
                  {/* Card A */}
                  <ChoiceButton
                    label={currentChoice.optionA}
                    letter="A"
                    selected={answers[currentIndex] === 'A'}
                    disabled={isTransitioning}
                    onClick={() => selectOption('A')}
                  />

                  {/* VS Middle Circle */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-white border-4 border-surface-container shadow-2xl items-center justify-center">
                    <span className="text-2xl font-black font-headline text-on-surface-variant italic tracking-tighter">VS</span>
                  </div>
                  
                  {/* Mobile VS */}
                  <div className="md:hidden flex justify-center py-2">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-surface-container shadow-lg flex items-center justify-center z-10">
                      <span className="text-xs font-black font-headline text-on-surface-variant italic">VS</span>
                    </div>
                  </div>

                  {/* Card B */}
                  <ChoiceButton
                    label={currentChoice.optionB}
                    letter="B"
                    selected={answers[currentIndex] === 'B'}
                    disabled={isTransitioning}
                    onClick={() => selectOption('B')}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Area with Timer & Skip */}
        <div className="mt-12 flex flex-col items-center gap-8">
          
          <div className="flex flex-col items-center">
             <CircularTimer timeLeft={timeLeft} />
             <p className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-[0.3em] mt-2">Thời gian còn lại</p>
          </div>

          <div className="w-full flex justify-center">
            {skipRemaining > 0 ? (
              <button
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/50 backdrop-blur border border-outline/30 text-on-surface hover:bg-white hover:border-primary/50 hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                onClick={handleSkip}
                disabled={isTransitioning}
              >
                <FontAwesomeIcon icon={faForward} className="text-xl group-hover:translate-x-1 transition-transform" />
                <span className="font-bold text-sm tracking-wide">BỎ QUA ({skipRemaining}/{MAX_SKIP_COUNT})</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container/50 text-on-surface-variant/60 font-medium text-xs border border-outline/10">
                <FontAwesomeIcon icon={faLock} className="text-base" />
                Hết quyền bỏ qua
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submitting overlay */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white p-8 rounded-3xl shadow-2xl border border-outline/20 flex flex-col items-center gap-5"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <FontAwesomeIcon icon={faInbox} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-on-surface text-center">Đang nộp phiếu bầu...</h3>
              <p className="text-sm text-on-surface-variant text-center max-w-[200px]">Hệ thống đang lưu kết quả của bạn</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

