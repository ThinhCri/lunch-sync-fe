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
import Header from '@/components/layout/Header';

const TOTAL_QUESTIONS = 8;

export default function VotingPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participantId, sessionId } = useSessionStore();
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  // Reconnect: sync status when tab comes back
  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.sessions.getStatus(pin, sessionId);
      const data = res.data;
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

  const formatTime = (seconds) => {
    if (seconds == null) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center pt-24 pb-32 px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-semibold">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  const progressPct = ((currentIndex) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col pt-20">
      <Header 
        title="LunchSync Vote" 
        rightContent={
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${timeLeft <= 5 ? 'bg-red-100/50 dark:bg-red-900/20' : 'bg-red-50/50 dark:bg-red-900/10'}`}>
            <span className={`material-symbols-outlined text-sm ${timeLeft <= 5 ? 'text-red-700 dark:text-red-500' : 'text-red-600 dark:text-red-400'}`}>timer</span>
            <span className={`font-bold font-headline ${timeLeft <= 5 ? 'text-red-700 dark:text-red-500 animate-pulse' : 'text-red-600 dark:text-red-400'}`}>{formatTime(timeLeft)}</span>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-grow pb-32 px-6 flex flex-col max-w-4xl mx-auto w-full">
        {/* Progress Bar Section */}
        <div className="mb-10 mt-6">
          <div className="flex justify-between items-end mb-3">
            <p className="text-on-surface-variant font-medium text-sm">Câu hỏi {currentIndex + 1} / {TOTAL_QUESTIONS}</p>
            <p className="text-primary font-bold text-[10px] sm:text-xs uppercase tracking-widest">
              {currentChoice?.id === 'BC-1' ? "Khởi động" : "Quyết định"}
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              initial={{ width: `${progressPct}%` }}
              animate={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Voting Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentChoice && (
              <>
                {/* Option A */}
                <div 
                  onClick={() => !isTransitioning && selectOption('A')}
                  className={`group relative bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_8px_24px_rgba(44,47,48,0.06)] transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img alt="Option A" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={`https://picsum.photos/seed/${currentChoice.id}A/400/500`} />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20">Lựa chọn 1</span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-3xl font-headline font-extrabold text-white leading-tight drop-shadow-md">{currentChoice.optionA}</h2>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-4 border-primary opacity-0 group-active:opacity-100 rounded-lg pointer-events-none transition-opacity"></div>
                </div>

                {/* Option B */}
                <div 
                  onClick={() => !isTransitioning && selectOption('B')}
                  className={`group relative bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_8px_24px_rgba(44,47,48,0.06)] transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer md:mt-8 ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img alt="Option B" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={`https://picsum.photos/seed/${currentChoice.id}B/400/500`} />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-white/20">Lựa chọn 2</span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <h2 className="text-3xl font-headline font-extrabold text-white leading-tight drop-shadow-md">{currentChoice.optionB}</h2>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-4 border-primary opacity-0 group-active:opacity-100 rounded-lg pointer-events-none transition-opacity"></div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Instructional Tip */}
        <div className="mt-8 text-center pb-8">
          <p className="text-on-surface-variant font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">touch_app</span>
            Chạm vào ảnh để chọn món bạn thèm nhất
          </p>
        </div>
      </main>

      {/* Bottom Navigation Shell for Skip/Help */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-8 pb-8 pt-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(44,47,48,0.06)] rounded-t-[2rem] z-50">
        <button 
          onClick={handleSkip}
          disabled={skipRemaining === 0 || isTransitioning}
          className={`flex flex-col items-center justify-center p-2 transition-opacity group ${skipRemaining === 0 ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed' : 'text-zinc-500 dark:text-zinc-400 hover:opacity-80'}`}
        >
          <div className="relative">
            <span className="material-symbols-outlined mb-1">skip_next</span>
            {skipRemaining > 0 && (
              <span className="absolute -top-1 -right-4 bg-primary text-on-primary text-[10px] px-1.5 rounded-full font-bold">{skipRemaining}</span>
            )}
          </div>
          <span className="font-be-vietnam text-xs font-medium">Bỏ qua</span>
          <span className="text-[10px] font-bold mt-0.5">(Tối đa {MAX_SKIP_COUNT})</span>
        </button>

        <button className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 p-2 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined mb-1">help_outline</span>
          <span className="font-be-vietnam text-xs font-medium">Trợ giúp</span>
        </button>
      </nav>

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
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <h3 className="text-xl font-bold text-on-surface text-center">Đang nộp phiếu bầu...</h3>
              <p className="text-sm text-on-surface-variant text-center max-w-[200px]">Hệ thống đang phân tích lựa chọn của bạn</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

