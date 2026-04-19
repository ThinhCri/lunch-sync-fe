import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/store/toastStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { motion } from 'framer-motion';
import { BarChart3, Star, Sparkles, Dice5, MapPin, ExternalLink } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal, faBowlFood } from '@fortawesome/free-solid-svg-icons';

export default function ResultsPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { isHost, sessionId } = useSessionStore();
  const { show } = useToastStore();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booming, setBooming] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const res = await api.sessions.getResults(pin);
      const data = res.data;
      setResults(data);
    } catch {
      show('Không thể tải kết quả.', 'error');
    } finally {
      setLoading(false);
    }
  }, [pin, show]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    if (!sessionId || !isHost) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.sessions.getStatus(pin, sessionId);
        const data = res.data;
        if (data.status === 'done') {
          clearInterval(interval);
          navigate(`/done/${pin}`);
        }
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pin, navigate, sessionId, isHost]);

  const handleBoom = async () => {
    if (booming) return;
    setBooming(true);
    try {
      const res = await api.sessions.boom(pin);
      navigate(`/boom/${pin}`, { state: { boomData: res.data } });
    } catch (err) {
      show(err.message || 'Không thể kích hoạt Boom.', 'error');
      setBooming(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-20 pb-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-semibold">Đang tổng kết bình chọn...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-background min-h-screen pt-20 pb-32 flex flex-col items-center justify-center p-6">
        <div className="bg-surface-container-lowest border border-outline/20 rounded-xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <BarChart3 className="text-5xl text-outline/30" />
          <p className="text-on-surface-variant font-medium text-sm">Chưa có kết quả. Vui lòng chờ host chốt phiếu.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const topDishes = results.top_dishes || [];
  const topRestaurants = results.top_restaurants || [];

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
    <div className="bg-background font-body text-on-surface antialiased min-h-screen">
      <Header title="LunchSync" />

      <main className="pt-24 pb-32 px-4 space-y-12 max-w-xl mx-auto">

        {/* Decorative blobs */}
        <div className="absolute top-40 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-60 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Top 3 Dishes */}
        {topDishes.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6 px-2">
              <div>
                <span className="text-secondary font-bold tracking-widest text-[10px] uppercase flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBowlFood} className="text-secondary" />
                  MÓN ĂN ĐƯỢC YÊU THÍCH
                </span>
                <h2 className="font-headline font-black text-2xl tracking-tight text-on-surface">Top Món Ăn</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 px-2">
              {topDishes.map((dish, idx) => {
                const rankColors = [
                  'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-400/30',
                  'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-lg shadow-slate-300/20',
                  'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-lg shadow-orange-300/20',
                ];
                const matchBg = [
                  'bg-primary/10 text-primary',
                  'bg-secondary/10 text-secondary',
                  'bg-tertiary/10 text-tertiary',
                ];
                return (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                    className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 shadow-sm border border-outline/10 active:scale-[0.98] transition-transform"
                  >
                    <div className={`${rankColors[idx] || 'bg-surface-container-high text-on-surface'} w-11 h-11 rounded-full flex items-center justify-center font-headline font-black text-lg shrink-0`}>
                      {idx === 0 ? (
                        <FontAwesomeIcon icon={faMedal} className="text-lg" />
                      ) : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-bold text-base truncate">{dish.name}</h3>
                      <p className="text-on-surface-variant text-xs truncate">{dish.category}</p>
                    </div>
                    <div className={`${matchBg[idx] || 'bg-surface-container-high text-on-surface'} px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap`}>
                      {idx === 0 ? 'SẼ CHỌN' : idx === 1 ? 'Rất phù hợp' : 'Khá phù hợp'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Top Restaurants */}
        {topRestaurants.length > 0 && (
          <section className="space-y-6">
            <div className="px-2">
              <span className="text-primary font-bold tracking-widest text-[10px] uppercase flex items-center gap-1.5">
                <Sparkles className="text-primary" size={12} />
                LUNCHSYNC PICKS
              </span>
              <h2 className="font-headline font-black text-2xl tracking-tight text-on-surface">Top Nhà Hàng</h2>
            </div>

            <div className="space-y-4">
              {topRestaurants.slice(0, 5).map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, type: 'spring', stiffness: 180 }}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden flex gap-0 transition-all duration-300 active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline/10"
                >
                  {/* Rank badge */}
                  <div className="relative w-20 shrink-0">
                    {r.thumbnail_url ? (
                      <img
                        alt={r.name}
                        className="w-full h-32 object-cover"
                        src={r.thumbnail_url}
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-surface-container-low">
                        <span className="text-xs font-extrabold text-on-surface-variant/50 text-center px-1 leading-tight">
                          {r.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-end pb-2">
                      <span className="text-white font-headline font-black text-2xl leading-none">{idx + 1}</span>
                      <span className="text-white/80 text-[9px] font-bold uppercase tracking-widest">TOP</span>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                        Best Pick
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-headline font-bold text-sm leading-tight line-clamp-2">{r.name}</h3>
                        <span className={`shrink-0 text-[10px] font-black px-2 py-1 rounded-full ${
                          r.score >= 0.95
                            ? 'bg-primary text-white'
                            : r.score >= 0.8
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {Math.round(r.score * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-on-surface-variant text-[11px]">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{r.address}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-semibold">
                        <span className="text-primary">{getPriceDisplay(r.price_tier)}</span>
                        <span className="text-outline">|</span>
                        <div className="flex items-center gap-1 text-primary">
                          <Star size={10} className="fill-primary text-primary" />
                          <span>{r.rating?.toFixed(1)}</span>
                        </div>
                      </div>

                      {r.matched_dishes && r.matched_dishes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {r.matched_dishes.slice(0, 4).map((dish, i) => (
                            <span key={i} className="bg-primary/8 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {dish}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {r.google_maps_url && (
                      <a
                        href={r.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-1.5 bg-primary/8 text-primary text-xs font-bold py-1.5 rounded-lg hover:bg-primary/15 active:scale-[0.98] transition-all"
                      >
                        <ExternalLink size={10} />
                        Mở bản đồ
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Host Boom Button */}
            {isHost && (
              <div className="px-2 pt-2">
                <button
                  onClick={handleBoom}
                  disabled={booming}
                  className="w-full bg-primary text-white rounded-2xl p-6 shadow-[0_12px_24px_rgba(249,115,22,0.25)] relative overflow-hidden active:scale-[0.97] transition-all group disabled:opacity-50"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-active:scale-125 transition-transform duration-300">
                    <Sparkles className="text-[80px] text-white/20" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Dice5 className="font-black text-2xl animate-bounce" />
                      <span className="font-headline font-black text-3xl tracking-tighter uppercase italic">
                        {booming ? 'Đang BOOM...' : 'BOOM!'}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm font-medium leading-tight">
                      Không biết chọn quán nào?
                      <br />
                      <span className="font-bold underline decoration-white/30 underline-offset-4">Loại bỏ bớt 2 lựa chọn!</span>
                    </p>
                  </div>
                </button>
                <p className="text-center text-[10px] text-on-surface-variant mt-3 font-bold uppercase tracking-widest">Dành riêng cho trưởng nhóm</p>
              </div>
            )}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
