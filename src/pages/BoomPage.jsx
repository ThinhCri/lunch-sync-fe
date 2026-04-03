import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import Layout from '@/components/layout/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBomb, faCheck,
  faLock, faCircleNotch, faClock,
  faTrophy, faMedal, faAward
} from '@fortawesome/free-solid-svg-icons';

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
        boomedAt: data.boomedAt,
      });
      if (data.boomedAt) {
        setBoomTriggeredAt(data.boomedAt);
      }
      if (data.status === 'done') {
        navigate(`/done/${pin}`);
      }
    } catch (err) {
      console.error('Error fetching boom data:', err);
    }
  }, [pin, navigate]);

  useEffect(() => {
    // Avoid synchronous setState in effect
    const timer = setTimeout(() => fetchBoomData(), 0);
    return () => clearTimeout(timer);
  }, [fetchBoomData]);

  // Transition: idle → boom → picking
  useEffect(() => {
    if (!boomData) return;
    if (boomData.eliminated?.length > 0 || boomData.remaining?.length > 0) {
      // Already boomed (from API or this session) → play animation then go to picking
      setTimeout(() => setPhase('boom'), 0);
      const timer = setTimeout(() => {
        setPhase('picking');
      }, BOOM_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setPhase('idle'), 0);
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
        if (data.status === 'done') {
          clearInterval(interval);
          navigate(`/done/${pin}`);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
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
    } catch (err) {
      console.error('Boom failed:', err);
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
      <Layout>
        <div className="flex-grow flex flex-col items-center justify-center gap-4 pt-24">
          <FontAwesomeIcon icon={faCircleNotch} className="text-primary text-4xl animate-spin" />
          <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  const allRestaurants = [...(boomData.eliminated || []), ...(boomData.remaining || [])];

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeDisplay = `${mins}:${String(secs).padStart(2, '0')}`;
  const isUrgent = remaining <= 15;

  return (
    <Layout>
      <div className="pt-24 flex-grow flex flex-col items-center justify-center px-6 pb-32 max-w-4xl mx-auto w-full overflow-hidden relative">

        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div
              key="loading"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FontAwesomeIcon icon={faCircleNotch} className="text-primary text-4xl animate-spin" />
              <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Đang chuẩn bị...</p>
            </motion.div>
          )}

          {phase === 'idle' && (
            <motion.div
              key="idle"
              className="w-full text-center space-y-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-error/10 text-error rounded-full font-black text-sm uppercase tracking-widest border border-error/20">
                <FontAwesomeIcon icon={faBomb} />
                Sẵn sàng chưa?
              </div>
              <h1 className="text-5xl sm:text-7xl font-headline font-black text-on-surface tracking-tighter leading-tight italic">
                BOOM! 🔥
              </h1>
              <p className="text-xl text-on-surface-variant font-medium max-w-md mx-auto">
                Chúng ta sẽ loại bỏ những quán ít được ưa chuộng nhất để tìm ra top 3.
              </p>

              <div className="pt-8">
                {isHost ? (
                  <button
                    disabled={pickingDone}
                    className="group relative px-10 py-5 bg-error text-white rounded-full font-headline font-black text-lg shadow-2xl shadow-error/40 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                    onClick={handleBoom}
                  >
                    KÍCH HOẠT BOOM
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FontAwesomeIcon icon={faCircleNotch} className="text-outline-variant text-2xl animate-spin" />
                    <p className="text-on-surface-variant/40 font-bold uppercase tracking-widest text-xs">Đang chờ host khai hỏa...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {phase === 'boom' && (
            <motion.div
              key="boom"
              className="w-full text-center space-y-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h2
                className="text-6xl font-headline font-black text-error italic uppercase tracking-tighter"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                BOOM!
              </motion.h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
                {allRestaurants.map((rest, i) => {
                  const isEliminated = boomData.eliminated?.some(e => e.id === rest.id);
                  return (
                    <motion.div
                      key={rest.id}
                      className={`p-6 rounded-3xl border-2 transition-all ${isEliminated
                          ? 'bg-outline/5 border-outline/20 text-on-surface-variant/20'
                          : 'bg-white border-primary shadow-xl shadow-primary/10 text-on-surface scale-105 z-10'
                        }`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={isEliminated
                        ? { x: i % 2 === 0 ? -300 : 300, y: -200, rotate: i % 2 === 0 ? -20 : 20, opacity: 0, scale: 0.5 }
                        : { opacity: 1, y: 0, scale: 1.05 }
                      }
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      <div className="text-sm font-black uppercase tracking-widest mb-2 opacity-50">Hạng {rest.rank}</div>
                      <div className="text-lg font-headline font-extrabold truncate">{rest.name}</div>
                      {isEliminated && (
                        <div className="mt-4 px-3 py-1 bg-error/10 text-error rounded-lg text-[10px] font-black uppercase tracking-widest w-fit mx-auto">
                          Đã loại
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'picking' && (
            <motion.div
              key="picking"
              className="w-full space-y-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-headline font-black text-on-surface tracking-tight leading-none italic uppercase">
                  Chốt quán thôi nào! 🏁
                </h2>

                {/* Countdown */}
                <div className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-white border border-outline/30 shadow-sm mx-auto ${isUrgent ? 'border-error ring-4 ring-error/5' : ''}`}>
                  <FontAwesomeIcon icon={faClock} className={`text-lg ${isUrgent ? 'text-error animate-pulse' : 'text-primary'}`} />
                  <span className={`text-sm font-black uppercase tracking-widest ${isUrgent ? 'text-error' : 'text-on-surface'}`}>
                    {remaining > 0 ? `Tự động chốt sau ${timeDisplay}` : 'Đang chốt...'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
                {(boomData.remaining || []).map((rest, i) => (
                  <motion.button
                    key={rest.id}
                    className={`group relative flex items-center gap-6 p-6 bg-white border-2 rounded-[2rem] text-left transition-all ${isHost && !pickingDone
                        ? 'border-outline/10 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 active:scale-[0.98]'
                        : 'border-outline/10 opacity-70 cursor-default'
                      }`}
                    onClick={() => handlePick(rest.id)}
                    disabled={!isHost || pickingDone}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110 ${i === 0 ? 'bg-amber-100 text-amber-600' :
                        i === 1 ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-600'
                      }`}>
                      <FontAwesomeIcon icon={i === 0 ? faTrophy : i === 1 ? faMedal : faAward} />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Top {i + 1}</div>
                      <div className="text-xl font-headline font-black text-on-surface truncate">{rest.name}</div>
                      {rest.address && <div className="text-sm text-on-surface-variant font-medium truncate opacity-60">{rest.address}</div>}
                    </div>

                    {isHost && !pickingDone ? (
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-white">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    ) : (
                      <div className="text-on-surface-variant/20 italic text-xs font-bold uppercase tracking-widest">
                        {isHost ? 'Đang gửi...' : <FontAwesomeIcon icon={faLock} />}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {!isHost && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <FontAwesomeIcon icon={faCircleNotch} className="text-outline-variant text-3xl animate-spin" />
                  <p className="text-on-surface-variant/50 font-bold uppercase tracking-widest text-[10px]">Đang chờ host chốt quán cuối cùng...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
