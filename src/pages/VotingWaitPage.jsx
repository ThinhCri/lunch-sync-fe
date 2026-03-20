import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { mockHandlers } from '@/api/mock';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { useSessionStore } from '@/store/sessionStore';
import { useVotingStore } from '@/store/votingStore';
import styles from './VotingWaitPage.module.css';

export default function VotingWaitPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants, isHost } = useSessionStore();
  const { submitted } = useVotingStore();
  const [votedCount, setVotedCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await mockHandlers.getStatus(pin);
      if (res.error) return;
      setVotedCount(res.participantsVoted || 0);
      if (res.status === 'results') {
        navigate(`/results/${pin}`);
      } else if (res.status === 'voting') {
        navigate(`/vote/${pin}`);
      } else if (res.status === 'waiting') {
        navigate(`/waiting/${pin}`);
      }
    } catch {}
  }, [pin, navigate]);

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

  const totalOthers = Math.max(0, participants.length - 1);
  const waitingOthers = Math.max(0, totalOthers - votedCount + 1);

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
          {waitingOthers > 0
            ? `Đang chờ ${waitingOthers} người khác bình chọn...`
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
            <span className={styles.votedNum}>{votedCount}</span>
            <span className={styles.votedTotal}>/ {participants.length} đã vote</span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${(votedCount / participants.length) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
          </div>
        </motion.div>

        {/* Host action */}
        {isHost && (
          <motion.div
            className={styles.hostActions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              className={styles.hostBtn}
              onClick={async () => {
                try {
                  await mockHandlers.closeVoting(pin);
                  message.info('Đã chốt kết quả!');
                } catch {}
              }}
            >
              Chốt kết quả ngay
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
