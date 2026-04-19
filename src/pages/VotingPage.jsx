import { useEffect, useCallback, useState, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useVotingStore } from '@/store/votingStore';
import { useVoting } from '@/hooks/useVoting';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { useToastStore } from '@/store/toastStore';
import Header from '@/components/layout/Header';
import { Timer, Hand } from 'lucide-react';
import VotingSubmittedModal from '@/components/modals/VotingSubmittedModal';

const TOTAL_QUESTIONS = 8;

const QUESTIONS = [
  { id: 'Q1', optionA: 'Nước',       optionB: 'Khô',        descA: 'Súp, canh, nước dùng',  descB: 'Cơm, bánh mì, món khô' },
  { id: 'Q2', optionA: 'Nóng',       optionB: 'Mát',         descA: 'Thích món vừa ra lò',    descB: 'Món lạnh, thanh mát' },
  { id: 'Q3', optionA: 'Nhẹ',  optionB: 'No nê',  descA: 'Salad, rau, thanh đạm',  descB: 'Thịt đậm, nhiều gia vị' },
  { id: 'Q4', optionA: 'Mềm',        optionB: 'Dai / Giòn',   descA: 'Xôi, cháo, thịt mềm',    descB: 'Gà chiên, nem, đồ giòn' },
  { id: 'Q5', optionA: 'Thanh',      optionB: 'Đậm đà',          descA: 'Hương vị dịu nhẹ',      descB: 'Vị đậm đà, mạnh mẽ' },
  { id: 'Q6', optionA: 'Không Cay',  optionB: 'Cay',          descA: 'Mọi người đều ăn được',  descB: 'Món cay, đậm đà' },
  { id: 'Q7', optionA: 'Nhanh',      optionB: 'Thong thả',    descA: '15-30 phút xong',        descB: 'Ngồi lâu, tận hưởng' },
  { id: 'Q8', optionA: 'Quen thuộc',    optionB: 'Thử lạ',        descA: 'Món quen thuộc, an toàn', descB: 'Khám phá món mới' },
];

export default function VotingPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participantId, sessionId, isHost, reset: resetSession } = useSessionStore();
  const { show } = useToastStore();
  const [submitting, setSubmitting] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [initialVotedInfo, setInitialVotedInfo] = useState({ votedCount: 1, totalParticipants: 0 });

  // Reset store khi sang phiên mới hoặc đã submit; giữ lại câu trả lời nếu cùng phiên và chưa submit
  useLayoutEffect(() => {
    const store = useVotingStore.getState();
    const wasSubmitted = store.submitted && store.sessionPin === pin;
    const isNewSession = store.sessionPin !== pin;

    if (wasSubmitted) {
      // User đã vote rồi — không reset, chỉ show modal
      setShowSubmittedModal(true);
      setInitialVotedInfo({ votedCount: 1, totalParticipants: 0 });
      useVotingStore.getState().setSessionPin(pin);
    } else if (isNewSession) {
      // Sang phiên mới — reset toàn bộ
      useVotingStore.getState().reset();
      useVotingStore.getState().setSessionPin(pin);
    } else {
      // Cùng phiên, chưa vote — giữ nguyên state
      useVotingStore.getState().setSessionPin(pin);
    }
  }, [pin]);

  const handleSessionEnded = useCallback((status) => {
    const messages = {
      cancelled: 'Phiên này đã bị hủy bởi chủ phòng.',
      expired: 'Phiên đã hết hạn do quá thời gian chờ.',
      completed: 'Phiên này đã kết thúc.',
    };
    show(messages[status] || 'Phiên không còn hoạt động.', 'error');
    resetSession();
    navigate('/', { replace: true });
  }, [resetSession, navigate, show]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.sessions.getStatus(pin, sessionId);
      const data = res.data;
      if (data.status === 'cancelled' || data.status === 'expired' || data.status === 'completed') {
        handleSessionEnded(data.status);
        return;
      }
      if (data.status === 'results') {
        navigate(`/results/${pin}`);
      } else if (data.status === 'waiting') {
        navigate(`/waiting/${pin}`);
      }
    } catch {
      // ignore
    }
  }, [pin, sessionId, navigate, handleSessionEnded]);

  const { stopPoller } = useSession({ pin, onStatus: fetchStatus, enabled: !showSubmittedModal });
  useReconnect({ onReconnect: fetchStatus, enabled: !showSubmittedModal });

  const handleSubmit = useCallback(async (answersStr) => {
    if (submitting) return;
    setSubmitting(true);
    stopPoller();
    try {
      const res = await api.sessions.vote(pin, { participant_id: participantId, choices: answersStr });
      const data = res.data;
      setSubmitting(false);
      setInitialVotedInfo({
        votedCount: data.total_voted || 1,
        totalParticipants: data.total_participants || 0,
      });
      setShowSubmittedModal(true);
    } catch (err) {
      show(err.message || 'Gửi phiếu thất bại, đang thử lại...', 'error');
      setSubmitting(false);
    }
  }, [pin, participantId, submitting, show, stopPoller]);

  const {
    timeLeft,
    currentChoice,
    currentIndex,
    isTransitioning,
    selectOption,
    startVoting,
  } = useVoting({ choices: QUESTIONS, onSubmit: handleSubmit, pin });

  useEffect(() => {
    startVoting();
    setCardKey((k) => k + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds) => {
    if (seconds == null) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPct = (currentIndex / TOTAL_QUESTIONS) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col pt-20">
      <Header title="LunchSync" />

      <main className="flex-grow pb-32 px-6 flex flex-col max-w-4xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8 mt-6">
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full ${isUrgent ? 'bg-error/10' : 'bg-surface-container-lowest'}`}>
              <Timer className={`text-lg ${isUrgent ? 'text-error' : 'text-on-surface-variant'}`} />
              <span className={`font-headline font-extrabold text-2xl tabular-nums ${isUrgent ? 'text-error animate-pulse' : 'text-on-surface'}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-3">
            <p className="text-on-surface-variant font-medium text-sm">Câu hỏi {currentIndex + 1} / {TOTAL_QUESTIONS}</p>
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
                  className={`group relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center gap-5 py-14 px-6">
                    <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-primary/20">Lựa chọn 1</span>
                    <h2 className="text-4xl font-headline font-extrabold text-on-surface text-center leading-tight">{currentChoice.optionA}</h2>
                    <p className="text-base text-on-surface-variant text-center max-w-[220px]">{currentChoice.descA}</p>
                    <div className="absolute inset-0 border-4 border-primary opacity-0 group-active:opacity-100 rounded-2xl pointer-events-none transition-opacity" />
                  </div>
                </div>

                {/* Option B */}
                <div
                  onClick={() => !isTransitioning && selectOption('B')}
                  className={`group relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer md:mt-8 ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center gap-5 py-14 px-6 md:mt-8">
                    <span className="bg-secondary/10 text-secondary px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-secondary/20">Lựa chọn 2</span>
                    <h2 className="text-4xl font-headline font-extrabold text-on-surface text-center leading-tight">{currentChoice.optionB}</h2>
                    <p className="text-base text-on-surface-variant text-center max-w-[220px]">{currentChoice.descB}</p>
                    <div className="absolute inset-0 border-4 border-primary opacity-0 group-active:opacity-100 rounded-2xl pointer-events-none transition-opacity" />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Instructional Tip */}
        <div className="mt-8 text-center pb-8">
          <p className="text-on-surface-variant font-medium flex items-center justify-center gap-2">
            <Hand className="text-lg" />
            Chạm vào lựa chọn bạn thích nhất
          </p>
        </div>
      </main>

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
      <VotingSubmittedModal
        open={showSubmittedModal}
        pin={pin}
        initialVotedInfo={initialVotedInfo}
        isHost={isHost}
        onResults={() => navigate(`/results/${pin}`)}
      />
    </div>
  );
}
