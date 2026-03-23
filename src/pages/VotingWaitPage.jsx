import { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { api } from '@/api';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { useSessionStore } from '@/store/sessionStore';
import { useVotingStore } from '@/store/votingStore';
import { VOTING_AUTO_CLOSE_SECONDS } from '@/utils/constants';
import styles from './VotingWaitPage.module.css';

export default function VotingWaitPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants, isHost } = useSessionStore();
  const { submitted } = useVotingStore();
  const { votingStartedAt } = useSessionStore();
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

  // Tự động chốt kết quả khi countdown về 0
  useEffect(() => {
    if (remainingSeconds > 0 || !isHost || autoCloseFired.current || votedCount < 1) return;
    autoCloseFired.current = true;
    setClosing(true);

    api.sessions.closeVoting(pin).then((res) => {
      const data = res.data;
      if (!data.error) {
        message.warning('Đã tự động chốt kết quả!');
        navigate(`/results/${pin}`);
      } else {
        setClosing(false);
        autoCloseFired.current = false;
      }
    });
  }, [remainingSeconds, isHost, votedCount, pin, navigate]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.sessions.getStatus(pin);
      const data = res.data;
      if (data.error) return;

      const voted = data.participantsVoted || 0;
      const total = data.participantsJoined || participants.length || 0;
      setVotedCount(voted);
      setTotalParticipants(total);

      if (data.votingStartedAt) {
        useSessionStore.getState().setVotingStartedAt(data.votingStartedAt);
      }

      if (data.status === 'results') {
        navigate(`/results/${pin}`);
      } else if (data.status === 'voting') {
        navigate(`/vote/${pin}`);
      } else if (data.status === 'waiting') {
        navigate(`/waiting/${pin}`);
      }
    } catch {}
  }, [pin, navigate, participants.length]);

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
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.iconWrap}>
            <div className={styles.iconCircle} style={{ background: 'var(--color-text-muted)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </div>
          </div>
          <h2 className={styles.title}>Chưa bình chọn</h2>
          <p className={styles.subtitle}>Bạn chưa hoàn thành phiếu bình chọn.</p>
          <button className={styles.startBtn} onClick={() => navigate(`/vote/${pin}`)}>
            Quay lại bình chọn
          </button>
        </div>
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
    <div className={styles.page}>
      <div className={styles.content}>
        {/* Animated checkmark */}
        <div className={styles.iconWrap}>
          <motion.div
            className={styles.iconCircle}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <motion.svg
              width="48" height="48" viewBox="0 0 48 48"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.path
                d="M12 24l9 9 15-18"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </div>

        <motion.div
          className={styles.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Đã gửi phiếu!
        </motion.div>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {notVoted > 0
            ? `Đang chờ ${notVoted} người khác bình chọn...`
            : 'Tất cả đã bình chọn! Đang tổng hợp kết quả...'}
        </motion.p>

        {/* Voted progress */}
        <motion.div
          className={styles.votedBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className={styles.votedCount}>
            <span className={styles.votedNum}>{voted}</span>
            <span className={styles.votedTotal}>/ {total} đã vote</span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
          </div>
        </motion.div>

        {/* Countdown + Host action */}
        {isHost && (
          <motion.div
            className={styles.hostActions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {/* Countdown */}
            <div className={styles.countdownWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.countdownIcon}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span className={`${styles.countdown} ${remainingSeconds <= 15 ? styles.countdownUrgent : ''}`}>
                {remainingSeconds > 0 ? `Tự động chốt sau ${timeDisplay}` : 'Đang chốt kết quả...'}
              </span>
            </div>

            {/* Nút chốt kết quả cho Host */}
            <button
              className={styles.hostBtn}
              onClick={async () => {
                if (votedCount < 1) {
                  message.warning('Cần ít nhất 1 người đã bỏ phiếu để chốt kết quả.');
                  return;
                }
                setClosing(true);
                try {
                  await api.sessions.closeVoting(pin);
                  message.success('Đã chốt kết quả!');
                  navigate(`/results/${pin}`);
                } catch {
                  message.error('Thao tác thất bại.');
                  setClosing(false);
                }
              }}
              disabled={closing || votedCount < 1}
            >
              {closing ? 'Đang chốt...' : 'Chốt kết quả ngay'}
            </button>

            {votedCount < 1 && (
              <p className={styles.waitingHint}>Chờ ít nhất 1 người bỏ phiếu để có thể chốt</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
