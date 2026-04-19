import { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { useSessionStore } from '@/store/sessionStore';
import { useVotingStore } from '@/store/votingStore';
import { useToastStore } from '@/store/toastStore';
import { VOTING_AUTO_CLOSE_SECONDS } from '@/utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faCircleNotch, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { handleSessionEndByStatus } from '@/hooks/useSessionReset';

export default function VotingWaitPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants, isHost, sessionId } = useSessionStore();
  const { submitted } = useVotingStore();
  const { votingStartedAt } = useSessionStore();
  const { show } = useToastStore();
  const [votedCount, setVotedCount] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(VOTING_AUTO_CLOSE_SECONDS);
  const [closing, setClosing] = useState(false);
  const autoCloseFired = useRef(false);

  // Tính thời gian còn lại dựa trên votingStartedAt
  useEffect(() => {
    if (!votingStartedAt) return;

    const updateRemaining = () => {
      const elapsed = Math.floor((Date.now() - new Date(votingStartedAt).getTime()) / 1000);
      const remaining = VOTING_AUTO_CLOSE_SECONDS - elapsed;
      setRemainingSeconds(Math.max(0, remaining));
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [votingStartedAt]);

  // Auto-close: tất cả đã vote
  useEffect(() => {
    const total = totalParticipants || participants.length || 0;
    if (!isHost || autoCloseFired.current) return;
    if (votedCount < 1 || votedCount < total || total === 0) return;
    autoCloseFired.current = true;
    setClosing(true);
    api.sessions.closeSession(pin).then(() => {
      show('Đã tự động chốt kết quả!', 'success');
      navigate(`/results/${pin}`);
    }).catch(() => {
      setClosing(false);
      autoCloseFired.current = false;
    });
  }, [votedCount, totalParticipants, participants.length, isHost, pin, navigate, show]);

  // Auto-close: countdown về 0
  useEffect(() => {
    if (remainingSeconds > 0 || !isHost || autoCloseFired.current || votedCount < 1) return;
    autoCloseFired.current = true;
    setClosing(true);
    api.sessions.closeSession(pin).then(() => {
      show('Đã tự động chốt kết quả!', 'success');
      navigate(`/results/${pin}`);
    }).catch(() => {
      setClosing(false);
      autoCloseFired.current = false;
    });
  }, [remainingSeconds, isHost, votedCount, pin, navigate, show]);

  const handleSessionEnded = useCallback((status) => {
    const messages = {
      cancelled: 'Phiên này đã bị hủy bởi chủ phòng.',
      expired: 'Phiên đã hết hạn do quá thời gian chờ.',
      completed: 'Phiên này đã kết thúc.',
    };
    show(messages[status] || 'Phiên không còn hoạt động.', 'error');
    handleSessionEndByStatus(status, pin, navigate);
  }, [pin, navigate, show]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.sessions.getStatus(pin, sessionId);
      const data = res.data;

      const voted = data.participantsVoted || 0;
      const total = data.participantsJoined || participants.length || 0;
      setVotedCount(voted);
      setTotalParticipants(total);

      if (data.votingStartedAt) {
        useSessionStore.getState().setVotingStartedAt(data.votingStartedAt);
      }

      if (data.status === 'cancelled' || data.status === 'expired' || data.status === 'completed') {
        handleSessionEnded(data.status);
        return;
      }
      if (data.status === 'results') {
        navigate(`/results/${pin}`);
      } else if (data.status === 'voting') {
        navigate(`/vote/${pin}`);
      } else if (data.status === 'waiting') {
        navigate(`/waiting/${pin}`);
      }
    } catch {
      // Silently handle — UI updates via onStatus callback
    }
  }, [pin, navigate, participants.length, handleSessionEnded]);

  useSession({ pin, onStatus: fetchStatus, enabled: true });
  useReconnect({ onReconnect: fetchStatus, enabled: true });

  // Guard: chỉ cho phép user đã vote mới vào được trang này
  useEffect(() => {
    if (!submitted) {
      navigate(`/vote/${pin}`);
    }
  }, [submitted, pin, navigate]);

  // Redirect if haven't voted yet
  if (!submitted) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
        <Header title="LunchSync" />
        <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-32">
          <div className="bg-white border-2 border-dashed border-outline/50 rounded-3xl p-10 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/40">
              <FontAwesomeIcon icon={faArrowLeft} className="text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-black text-on-surface mb-2">Chưa bình chọn</h2>
              <p className="text-on-surface-variant font-medium">Bạn chưa hoàn thành phiếu bình chọn.</p>
            </div>
            <button 
              className="w-full py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95" 
              onClick={() => navigate(`/vote/${pin}`)}
            >
              Quay lại bình chọn
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const voted = votedCount;
  const total = totalParticipants || participants.length || 0;
  const notVoted = Math.max(0, total - voted);
  const progressPct = total > 0 ? Math.min(100, (voted / total) * 100) : 0;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeDisplay = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Header title="LunchSync" />
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-32 max-w-2xl mx-auto w-full relative">
        
        {/* Decorative blobs */}
        <div className="absolute top-40 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-40 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="w-full text-center space-y-8">
          {/* Animated checkmark */}
          <div className="flex justify-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center shadow-lg shadow-secondary/5"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <FontAwesomeIcon icon={faCheck} className="text-secondary text-4xl" />
            </motion.div>
          </div>

          <div className="space-y-3">
            <motion.h1
              className="text-3xl sm:text-4xl font-headline font-black text-on-surface tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Đã gửi phiếu!
            </motion.h1>

            <motion.p
              className="text-lg text-on-surface-variant font-medium"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {notVoted > 0
                ? `Đang chờ ${notVoted} người khác bình chọn...`
                : 'Tất cả đã bình chọn! Đang tổng hợp kết quả...'}
            </motion.p>
          </div>

          {/* Voted progress */}
          <motion.div
            className="bg-white border border-outline/30 rounded-3xl p-8 shadow-sm space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase text-on-surface-variant/50 tracking-widest mb-1">Tiến độ</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-headline font-black text-primary">{voted}</span>
                  <span className="text-on-surface-variant font-bold">/ {total}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                 <FontAwesomeIcon icon={faCircleNotch} className={`text-primary text-xl ${notVoted > 0 ? 'animate-spin' : ''}`} />
              </div>
            </div>

            <div className="relative h-4 bg-surface-container rounded-full overflow-hidden border border-outline/5 shadow-inner">
              <motion.div
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>

          {/* Countdown + Host action */}
          {isHost && (
            <motion.div
              className="space-y-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Countdown badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-outline/30 shadow-sm">
                <FontAwesomeIcon icon={faClock} className={`text-lg ${remainingSeconds <= 15 ? 'text-error animate-pulse' : 'text-primary'}`} />
                <span className={`text-sm font-black uppercase tracking-widest ${remainingSeconds <= 15 ? 'text-error' : 'text-on-surface'}`}>
                  {voted === total && total > 0
                    ? 'Tất cả đã bình chọn!'
                    : remainingSeconds > 0
                      ? `Tự động chốt sau ${timeDisplay}`
                      : 'Chốt ngay thôi!'}
                </span>
              </div>

              {/* Nút chốt kết quả cho Host */}
              <button
                className={`w-full py-5 rounded-full font-headline font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-2xl ${
                  closing || votedCount < 1
                    ? 'bg-outline/40 text-white/50 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.99] shadow-primary/30'
                }`}
                onClick={async () => {
                  if (votedCount < 1) {
                    show('Cần ít nhất 1 người đã bỏ phiếu để chốt kết quả.', 'error');
                    return;
                  }
                  setClosing(true);
                  try {
                    await api.sessions.closeSession(pin);
                    show('Đã chốt kết quả!', 'success');
                    navigate(`/results/${pin}`);
                  } catch {
                    show('Thao tác thất bại.', 'error');
                    setClosing(false);
                  }
                }}
                disabled={closing || votedCount < 1}
              >
                {closing ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} className="animate-spin text-xl" />
                    ĐANG CHỐT...
                  </>
                ) : (
                  <>
                    <span>CHỐT KẾT QUẢ NGAY</span>
                    <FontAwesomeIcon icon={faArrowLeft} className="rotate-180" />
                  </>
                )}
              </button>

              {votedCount < 1 && (
                <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Chờ ít nhất 1 người bỏ phiếu để có thể chốt</p>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
