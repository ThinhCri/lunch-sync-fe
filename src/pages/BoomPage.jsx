import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/store/toastStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faLock, faCircleNotch, faTrophy, faMedal, faAward
} from '@fortawesome/free-solid-svg-icons';

export default function BoomPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { isHost, sessionId } = useSessionStore();
  const { show } = useToastStore();

  const [boomData, setBoomData] = useState(null);
  const [displayList, setDisplayList] = useState([]);
  const [pickingDone, setPickingDone] = useState(false);

  const fetchBoomData = useCallback(async () => {
    try {
      const res = await api.sessions.getResults(pin);
      const data = res.data;

      const remaining = data.remaining || [];
      const eliminated = data.eliminated || [];

      setBoomData({ eliminated, remaining, status: data.status });
      if (data.status === 'done') {
        navigate(`/done/${pin}`);
        return;
      }

      const all = [...remaining, ...eliminated].sort((a, b) => a.rank - b.rank);
      setDisplayList(all);

      setTimeout(() => {
        setDisplayList(remaining);
      }, 1200);

    } catch {
      // silently handle
    }
  }, [pin, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBoomData(), 0);
    return () => clearTimeout(timer);
  }, [fetchBoomData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.sessions.getStatus(pin, sessionId);
        if (res.data.status === 'done') {
          clearInterval(interval);
          navigate(`/done/${pin}`);
        }
      } catch {
        // silently handle
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pin, navigate, sessionId]);

  const handlePick = async (restaurantId) => {
    if (!isHost) return;
    setPickingDone(true);
    try {
      await api.sessions.pick(pin, { restaurantId });
      navigate(`/done/${pin}`);
    } catch {
      show('Không thể chốt quán.', 'error');
      setPickingDone(false);
    }
  };

  if (!boomData) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
        <Header title="LunchSync" />
        <div className="flex-grow flex flex-col items-center justify-center gap-4 pt-24 pb-32">
          <FontAwesomeIcon icon={faCircleNotch} className="text-primary text-4xl animate-spin" />
          <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Đang tải...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Header title="LunchSync" />
      <main className="pt-24 flex-grow flex flex-col items-center px-6 pb-32 max-w-4xl mx-auto w-full overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="w-full space-y-10 mt-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-headline font-black text-on-surface tracking-tight leading-none italic uppercase">
              Chốt quán thôi nào!
            </h2>
            <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-surface-container-lowest border border-outline/30 shadow-sm mx-auto">
              <span className="text-sm font-black uppercase tracking-widest text-on-surface">
                Vui lòng chọn 1 trong 3 quán còn lại
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto relative">
            <AnimatePresence>
              {displayList.map((rest, i) => {
                const iconColorIdx = i > 2 ? 2 : i;
                const icon = iconColorIdx === 0 ? faTrophy : iconColorIdx === 1 ? faMedal : faAward;
                const iconBgClass = iconColorIdx === 0
                  ? 'bg-secondary/10 text-secondary'
                  : iconColorIdx === 1
                  ? 'bg-surface-container text-on-surface-variant'
                  : 'bg-primary/10 text-primary';

                return (
                  <motion.button
                    layout
                    key={rest.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      x: i % 2 === 0 ? -1000 : 1000,
                      opacity: 0,
                      rotate: i % 2 === 0 ? -45 : 45
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`group relative flex items-center gap-6 p-6 bg-surface-container-lowest border-2 rounded-[2rem] text-left transition-colors ${isHost && !pickingDone
                        ? 'border-outline/10 hover:border-primary hover:shadow-xl active:scale-[0.98]'
                        : 'border-outline/10 opacity-80 cursor-default'
                      }`}
                    onClick={() => handlePick(rest.id)}
                    disabled={!isHost || pickingDone}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110 ${iconBgClass}`}>
                      <FontAwesomeIcon icon={icon} />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Top {rest.rank || i + 1}</div>
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
                );
              })}
            </AnimatePresence>
          </div>

          {!isHost && (
            <div className="flex flex-col items-center gap-4 py-8">
              <FontAwesomeIcon icon={faCircleNotch} className="text-outline text-3xl animate-spin" />
              <p className="text-on-surface-variant/50 font-bold uppercase tracking-widest text-[10px]">Đang chờ host chốt quán cuối cùng...</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
