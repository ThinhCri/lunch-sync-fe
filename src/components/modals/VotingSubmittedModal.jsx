import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useVotingStore } from '@/store/votingStore';
import { createPoller } from '@/utils/reconnect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const POLL_INTERVAL = 3000;

export default function VotingSubmittedModal({ open, pin, initialVotedInfo, onResults }) {
  const navigate = useNavigate();
  const { sessionId, participants } = useSessionStore();
  const [votedCount, setVotedCount] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [allVoted, setAllVoted] = useState(false);
  const pollerRef = useRef(null);
  const isDoneRef = useRef(false);

  const total = totalParticipants || participants.length || initialVotedInfo?.totalParticipants || 0;

  // Sync initial voted info
  useEffect(() => {
    if (initialVotedInfo?.votedCount) setVotedCount(initialVotedInfo.votedCount);
    if (initialVotedInfo?.totalParticipants) setTotalParticipants(initialVotedInfo.totalParticipants);
  }, [initialVotedInfo]);

  const handleRedirectToResults = useCallback(() => {
    if (isDoneRef.current) return;
    isDoneRef.current = true;
    pollerRef.current?.stop();
    onResults?.();
  }, [onResults]);

  const fetchStatus = useCallback(async () => {
    if (isDoneRef.current) return;
    try {
      const res = await api.sessions.getStatus(pin, sessionId);
      const data = res.data;

      const voted = data.participants_voted || 0;
      const total = data.participants_joined || participants.length || 0;
      const isAllVoted = total > 0 && voted >= total;

      setVotedCount((prev) => (prev !== voted ? voted : prev));
      setTotalParticipants((prev) => (prev !== total ? total : prev));
      setAllVoted((prev) => (prev !== isAllVoted ? isAllVoted : prev));

      // Khi status là results → chuyển sang trang kết quả
      if (data.status === 'results') {
        handleRedirectToResults();
        return;
      }

      // Khi tất cả đã vote → chờ redirect tự động
      if (isAllVoted) {
        handleRedirectToResults();
      }
    } catch {
      // ignore polling errors silently
    }
  }, [pin, sessionId, participants.length, handleRedirectToResults]);

  useEffect(() => {
    if (!open) return;

    // Block back navigation — không cho quay lại trang vote
    window.history.replaceState(null, '', window.location.pathname);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    pollerRef.current = createPoller(fetchStatus, {
      interval: POLL_INTERVAL,
      maxRetries: 999,
    });
    pollerRef.current.start();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      pollerRef.current?.stop();
    };
  }, [open, fetchStatus]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        className="relative w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient" />

        <div className="px-8 py-10 flex flex-col items-center gap-7">
          {/* Animated checkmark */}
          <motion.div
            className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center shadow-lg shadow-secondary/10"
            initial={{ scale: 0, rotate: -60 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
          >
            <FontAwesomeIcon icon={faCheck} className="text-secondary text-3xl" />
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-headline font-black text-on-surface tracking-tight">
              {allVoted ? 'Tất cả đã vote!' : 'Hoàn tất!'}
            </h2>
            <p className="text-sm text-on-surface-variant font-medium">
              {total - votedCount > 0
                ? `Đang chờ ${total - votedCount} người khác bình chọn...`
                : 'Tất cả đã bình chọn! Đang tổng hợp kết quả...'}
            </p>
          </motion.div>

          {/* Vote count */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-4xl font-headline font-black text-primary">{votedCount}</span>
            <span className="text-2xl font-headline font-bold text-on-surface-variant"> / {total}</span>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
