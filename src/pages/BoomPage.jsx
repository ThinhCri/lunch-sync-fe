import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import styles from './BoomPage.module.css';

const BOOM_DELAY_MS = 2500;  // thời gian animation boom
const PICK_COUNTDOWN_SECONDS = 90; // countdown để auto-pick

function usePickingCountdown(boomTriggeredAt) {
  const [remaining, setRemaining] = useState(PICK_COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!boomTriggeredAt) return;

    const updateRemaining = () => {
      const elapsed = Math.floor((Date.now() - new Date(boomTriggeredAt).getTime()) / 1000);
      const rem = PICK_COUNTDOWN_SECONDS - elapsed;
      setRemaining(Math.max(0, rem));
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [boomTriggeredAt]);

  return remaining;
}

export default function BoomPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { isHost } = useSessionStore();

  const [boomData, setBoomData] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | idle | boom | picking | done
  const [pickingDone, setPickingDone] = useState(false);
  const [boomTriggeredAt, setBoomTriggeredAt] = useState(null); // local client-side timestamp

  const remaining = usePickingCountdown(boomTriggeredAt);

  const autoPickFired = useRef(false);

  // Fetch boom data from results
  const fetchBoomData = useCallback(async () => {
    try {
      const res = await api.sessions.getResults(pin);
      const data = res.data;
      if (data.error) return;
      setBoomData({
        eliminated: data.eliminated || [],
        remaining: data.remaining || [],
        status: data.status,
      });
      if (data.status === 'done') {
        navigate(`/done/${pin}`);
      }
    } catch {}
  }, [pin, navigate]);

  useEffect(() => {
    fetchBoomData();
  }, [fetchBoomData]);

  // Transition: idle → boom → picking
  useEffect(() => {
    if (!boomData) return;
    if (boomData.eliminated?.length > 0 || boomData.remaining?.length > 0) {
      // Already boomed (from API or this session) → play animation then go to picking
      setPhase('boom');
      const timer = setTimeout(() => {
        setPhase('picking');
      }, BOOM_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      setPhase('idle');
    }
  }, [boomData]);

  // Auto-pick: chỉ Host + countdown = 0 + chưa ai chọn
  useEffect(() => {
    if (phase !== 'picking') return;
    if (!isHost) return;
    if (pickingDone) return;
    if (!boomData?.remaining?.length) return;
    if (remaining > 0) return;
    if (autoPickFired.current) return;

    autoPickFired.current = true;
    const top = boomData.remaining.reduce((a, b) => (a.rank < b.rank ? a : b));
    api.sessions.pick(pin, { restaurantId: top.id }).then(() => {
      navigate(`/done/${pin}`);
    });
  }, [phase, isHost, pickingDone, boomData, remaining, pin, navigate]);

  // Poll for done
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.sessions.getStatus(pin);
        const data = res.data;
        if (data.error) return;
        if (data.status === 'done') {
          clearInterval(interval);
          navigate(`/done/${pin}`);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [pin, navigate]);

  const handleBoom = async () => {
    try {
      const res = await api.sessions.boom(pin);
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        return;
      }
      setBoomData(prev => ({
        ...prev,
        eliminated: data.eliminated,
        remaining: data.remaining,
        status: 'picking',
      }));
      setBoomTriggeredAt(new Date().toISOString());
      setPhase('boom');
    } catch {
      message.error('Không thể kích hoạt Boom.');
    }
  };

  const handlePick = async (restaurantId) => {
    if (!isHost) return;
    setPickingDone(true);
    try {
      await api.sessions.pick(pin, { restaurantId });
      navigate(`/done/${pin}`);
    } catch {
      message.error('Không thể chốt quán.');
      setPickingDone(false);
    }
  };

  if (!boomData) {
    return (
      <div className={styles.page}>
        <div className={styles.centerContent}>
          <div className={styles.loadingDots}><span /><span /><span /></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  const allRestaurants = [...(boomData.eliminated || []), ...(boomData.remaining || [])];

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeDisplay = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;
  const isUrgent = remaining <= 15;

  return (
    <div className={styles.page}>
      {/* Phase: idle (host chưa kích hoạt) */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            className={styles.centerContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.boomTitle}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              💥 Boom!
            </motion.div>
            <p className={styles.boomSubtitle}>Sẵn sàng thu hẹp còn 3 quán ngon nhất?</p>
            {isHost ? (
              <button className={styles.boomBtn} onClick={handleBoom}>
                Kích hoạt Boom 🔥
              </button>
            ) : (
              <p className={styles.waitText}>Đang chờ host kích hoạt...</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: boom animation (5 restaurants) */}
      <AnimatePresence>
        {phase === 'boom' && (
          <motion.div
            className={styles.centerContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={styles.boomTitle}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              💥 BOOM!
            </motion.div>
            <p className={styles.boomSubtitle}>Loại bỏ 2 quán...</p>

            <div className={styles.boomGrid}>
              {allRestaurants.map((rest, i) => {
                const isEliminated = boomData.eliminated.some(e => e.id === rest.id);
                return (
                  <motion.div
                    key={rest.id}
                    className={`${styles.boomCard} ${isEliminated ? styles.eliminated : styles.remaining}`}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={isEliminated
                      ? { x: i < 2 ? -200 : 200, y: -100, opacity: 0, scale: 0.5, rotate: i % 2 === 0 ? -15 : 15 }
                      : { scale: 1.05 }
                    }
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeInBack' }}
                  >
                    <div className={styles.boomRank}>#{rest.rank}</div>
                    <div className={styles.boomName}>{rest.name}</div>
                    {isEliminated && <div className={styles.eliminatedLabel}>Loại!</div>}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: picking (3 quán còn lại + countdown) */}
      <AnimatePresence>
        {phase === 'picking' && (
          <motion.div
            className={styles.centerContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className={styles.boomTitle}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              3 quán còn lại
            </motion.div>
            <p className={styles.boomSubtitle}>Chọn quán chốt!</p>

            {/* Countdown */}
            <div className={`${styles.pickCountdown} ${isUrgent ? styles.pickCountdownUrgent : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>
                {remaining > 0
                  ? `Tự động chọn top 1 sau ${timeDisplay}`
                  : 'Đang chốt quán...'}
              </span>
            </div>

            <div className={styles.pickGrid}>
              {(boomData.remaining || []).map((rest, i) => (
                <motion.button
                  key={rest.id}
                  className={`${styles.pickCard} ${!isHost ? styles.pickCardDisabled : ''}`}
                  onClick={() => handlePick(rest.id)}
                  disabled={!isHost || pickingDone}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                  whileTap={isHost && !pickingDone ? { scale: 0.96 } : {}}
                >
                  <div className={styles.pickRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                  <div className={styles.pickInfo}>
                    <div className={styles.pickName}>{rest.name}</div>
                    {rest.address && <div className={styles.pickAddress}>{rest.address}</div>}
                    {rest.priceDisplay && <div className={styles.pickPrice}>{rest.priceDisplay}</div>}
                  </div>
                  {!isHost && (
                    <div className={styles.pickLock}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {!isHost && (
              <p className={styles.hostOnlyNote}>Chỉ Host mới có quyền chốt quán</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
