import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/store/toastStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faLock, faTrophy, faMedal, faAward, faCircleNotch,
  faBolt, faMapPin, faStar, faExternalLink, faBowlFood
} from '@fortawesome/free-solid-svg-icons';

export default function BoomPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isHost, sessionId } = useSessionStore();
  const { show } = useToastStore();

  const [boomData, setBoomData] = useState(null);
  const [pickingDone, setPickingDone] = useState(false);

  useEffect(() => {
    console.log('[BoomPage] location.state:', location.state);
    if (location.state?.boomData) {
      setBoomData(location.state.boomData);
    } else {
      show('Không có dữ liệu boom.', 'error');
      navigate(-1);
    }
  }, [location.state, show, navigate]);

  useEffect(() => {
    if (!boomData) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.sessions.getStatus(pin, sessionId);
        console.log('[BoomPage] getStatus response:', res.data);
        if (res.data.status === 'done') {
          clearInterval(interval);
          const final = res.data.final_restaurant || res.data.finalRestaurant;
          if (final) {
            localStorage.setItem('lunchsync_final_restaurant', JSON.stringify(final));
          }
          navigate(`/done/${pin}`);
        }
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [boomData, pin, navigate, sessionId]);

  const handlePick = async (restaurantId) => {
    console.log('[BoomPage] handlePick called with:', restaurantId);
    if (!isHost || pickingDone) return;
    setPickingDone(true);
    try {
      const res = await api.sessions.pick(pin, restaurantId);
      console.log('[BoomPage] pick response:', res.data);
      const finalRestaurant = res.data?.final_restaurant || res.data?.finalRestaurant || res.data;
      console.log('[BoomPage] finalRestaurant:', finalRestaurant);
      localStorage.setItem('lunchsync_final_restaurant', JSON.stringify(finalRestaurant));
      navigate(`/done/${pin}`);
    } catch {
      show('Không thể chốt quán.', 'error');
      setPickingDone(false);
    }
  };

  const remaining = boomData?.remaining || [];

  const getPriceDisplay = (priceTier) => {
    const map = {
      Under50k: 'Dưới 50k',
      From50To70k: '50k - 70k',
      From70To120k: '70k - 120k',
      Over120k: 'Trên 120k',
    };
    return map[priceTier] || priceTier || '---';
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Header title="LunchSync" />
      <main className="pt-24 flex-grow flex flex-col items-center px-5 pb-32 max-w-xl mx-auto w-full overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="w-full space-y-10 mt-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              <FontAwesomeIcon icon={faBolt} />
              Boom kết quả
            </div>
            <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight leading-tight italic uppercase">
              Chốt quán thôi nào!
            </h2>
            {remaining.length > 0 && (
              <p className="text-sm text-on-surface-variant font-medium">
                Còn <span className="font-black text-primary">{remaining.length}</span> quán để bạn chọn
              </p>
            )}
          </div>

          {/* Remaining restaurants */}
          <AnimatePresence>
            {remaining.length > 0 && (
              <div className="space-y-4">
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60">
                  Còn lại
                </p>
                {remaining.map((rest, i) => {
                  const icons = [faTrophy, faMedal, faAward];
                  const iconBg = [
                    'bg-amber-400/10 text-amber-500',
                    'bg-slate-400/10 text-slate-500',
                    'bg-orange-400/10 text-orange-500',
                  ];
                  const icon = icons[i] || faAward;
                  const bg = iconBg[i] || iconBg[2];

                  return (
                    <motion.button
                      key={rest.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                      className={`group w-full text-left bg-surface-container-lowest border-2 rounded-2xl overflow-hidden transition-all ${
                        isHost && !pickingDone
                          ? 'border-outline/10 hover:border-primary hover:shadow-xl active:scale-[0.98]'
                          : 'border-outline/10 opacity-80 cursor-default'
                      }`}
                      onClick={() => handlePick(rest.id)}
                      disabled={!isHost || pickingDone}
                    >
                      {/* Image */}
                      <div className="relative w-full h-40 overflow-hidden">
                        <img
                          alt={rest.name}
                          className="w-full h-full object-cover"
                          src={rest.thumbnail_url || `https://picsum.photos/seed/${rest.id}/800/400`}
                          onError={(e) => { e.target.src = `https://picsum.photos/seed/${rest.id}/800/400`; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className={`absolute top-3 left-3 ${bg} w-10 h-10 rounded-xl flex items-center justify-center shadow-lg`}>
                          <FontAwesomeIcon icon={icon} className="text-lg" />
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <span className="text-white font-black text-xl font-headline drop-shadow">{rest.name}</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[12px]">
                          <FontAwesomeIcon icon={faMapPin} className="text-xs shrink-0" />
                          <span className="truncate">{rest.address}</span>
                        </div>

                        <div className="flex items-center gap-4 text-[12px] font-semibold">
                          <span className="text-primary">{getPriceDisplay(rest.price_tier)}</span>
                          <span className="text-outline">|</span>
                          <div className="flex items-center gap-1 text-primary">
                            <FontAwesomeIcon icon={faStar} className="text-xs fill-primary text-primary" />
                            <span>{rest.rating?.toFixed(1)}</span>
                          </div>
                        </div>

                        {rest.matched_dishes && rest.matched_dishes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {rest.matched_dishes.map((dish, idx) => (
                              <span key={idx} className="bg-primary/8 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <FontAwesomeIcon icon={faBowlFood} className="text-[9px]" />
                                {dish}
                              </span>
                            ))}
                          </div>
                        )}

                        {rest.google_maps_url && (
                          <a
                            href={rest.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 bg-primary/8 text-primary text-xs font-bold py-2 rounded-xl hover:bg-primary/15 active:scale-[0.98] transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FontAwesomeIcon icon={faExternalLink} className="text-[10px]" />
                            Mở bản đồ
                          </a>
                        )}

                        {isHost && !pickingDone && (
                          <div className="flex items-center justify-center gap-2 bg-primary text-white font-black text-sm py-3 rounded-xl mt-1">
                            <FontAwesomeIcon icon={faCheck} />
                            CHỌN QUÁN NÀY
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Non-host waiting state */}
          {!isHost && (
            <div className="flex flex-col items-center gap-3 py-6">
              <FontAwesomeIcon icon={faCircleNotch} className="text-outline text-3xl animate-spin" />
              <p className="text-on-surface-variant/50 font-bold uppercase tracking-widest text-[10px] text-center">
                Đang chờ host chốt quán cuối cùng...
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
