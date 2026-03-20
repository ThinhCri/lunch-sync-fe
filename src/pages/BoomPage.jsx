import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { mockHandlers } from '@/api/mock';
import { useSessionStore } from '@/store/sessionStore';
import styles from './BoomPage.module.css';

const BOOM_DELAY_MS = 2500; // T+2.5s

export default function BoomPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { isHost, results } = useSessionStore();

  const [boomData, setBoomData] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | idle | boom | picking | done
  const [boomTriggered, setBoomTriggered] = useState(false);
  const autoPickDone = useRef(false);

  // Fetch boom data from results
  const fetchBoomData = useCallback(async () => {
    try {
      const res = await mockHandlers.getResults(pin);
      if (res.error) return;
      setBoomData({
        eliminated: res.eliminated || [],
        remaining: res.remaining || (res.topRestaurants?.slice(0, 3).map(r => ({
          id: r.id,
          name: r.name,
          rank: r.rank,
          ...r,
        })) || []),
        boomTriggeredAt: res.boomTriggeredAt,
        status: res.status,
      });
      if (res.status === 'done') {
        navigate(`/done/${pin}`);
      }
    } catch {}
  }, [pin, navigate]);

  useEffect(() => {
    fetchBoomData();
  }, [fetchBoomData]);

  // If host has not triggered boom yet, show waiting state
  // If boomTriggeredAt exists, calculate sync delay
  useEffect(() => {
    if (!boomData) return;
    if (!boomData.boomTriggeredAt) {
      setPhase('idle');
      return;
    }
    setBoomTriggered(true);
    setPhase('boom');

    const delay = new Date(boomData.boomTriggeredAt).getTime() + BOOM_DELAY_MS - Date.now();
    const timer = setTimeout(() => {
      setPhase('picking');
    }, Math.max(delay, 0));

    return () => clearTimeout(timer);
  }, [boomData]);

  // Auto-pick top ranked restaurant (MVP)
  useEffect(() => {
    if (phase !== 'picking' || !isHost || autoPickDone.current || !boomData?.remaining?.length) return;
    autoPickDone.current = true;

    const top = boomData.remaining.reduce((a, b) => (a.rank < b.rank ? a : b));
    const timer = setTimeout(async () => {
      try {
        await mockHandlers.pick(pin, top.id);
      } catch {}
      navigate(`/done/${pin}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [phase, isHost, boomData, pin, navigate]);

  // Poll for status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await mockHandlers.getStatus(pin);
        if (res.error) return;
        if (res.status === 'done') {
          clearInterval(interval);
          navigate(`/done/${pin}`);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [pin, navigate]);

  const handleBoom = async () => {
    try {
      const res = await mockHandlers.boom(pin);
      if (res.error) {
        message.error(res.error.message);
        return;
      }
      setBoomTriggered(true);
      setPhase('boom');
      setBoomData(prev => ({ ...prev, boomTriggeredAt: res.boomTriggeredAt, eliminated: res.eliminated, remaining: res.remaining }));

      setTimeout(() => setPhase('picking'), BOOM_DELAY_MS);
    } catch {
      message.error('Không thể kích hoạt Boom.');
    }
  };

  const handlePick = async (restaurantId) => {
    try {
      await mockHandlers.pick(pin, restaurantId);
      navigate(`/done/${pin}`);
    } catch {
      message.error('Không thể chốt quán.');
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

  return (
    <div className={styles.page}>
      {/* Phase: idle (host not triggered yet) */}
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

      {/* Phase: boom animation (5 restaurants on screen) */}
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

      {/* Phase: picking (3 remaining) */}
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

            <div className={styles.pickGrid}>
              {(boomData.remaining || []).map((rest, i) => (
                <motion.button
                  key={rest.id}
                  className={styles.pickCard}
                  onClick={() => handlePick(rest.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <div className={styles.pickRank}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                  <div className={styles.pickName}>{rest.name}</div>
                  {rest.address && <div className={styles.pickAddress}>{rest.address}</div>}
                  {rest.priceDisplay && <div className={styles.pickPrice}>{rest.priceDisplay}</div>}
                </motion.button>
              ))}
            </div>

            {isHost && (
              <p className={styles.autoPickNote}>Sẽ tự động chọn quán top 1 sau 2s...</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
