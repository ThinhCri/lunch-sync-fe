import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faMapMarkerAlt,
  faStar,
  faWallet,
  faHistory,
  faBolt,
  faStore,
  faUtensils,
  faMedal,
  faAward
} from '@fortawesome/free-solid-svg-icons';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import Layout from '@/components/layout/Layout';

function RankBadge({ rank }) {
  if (rank === 1) return <div className="p-1.5 bg-primary-container rounded-lg shadow-lg rotate-3 group-hover:rotate-6 transition-transform"><FontAwesomeIcon icon={faTrophy} className="w-8 h-8 text-on-primary-container" /></div>;
  if (rank === 2) return <div className="p-1.5 bg-surface-variant rounded-lg border border-outline/20"><FontAwesomeIcon icon={faMedal} className="w-8 h-8 text-secondary" /></div>;
  if (rank === 3) return <div className="p-1.5 bg-surface-variant rounded-lg border border-outline/20"><FontAwesomeIcon icon={faAward} className="w-8 h-8 text-tertiary" /></div>;
  return <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-[10px] font-black">{rank}</div>;
}

export default function ResultsPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { isHost } = useSessionStore();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booming, setBooming] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const res = await api.sessions.getResults(pin);
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        return;
      }
      setResults(data);

      if (data.status === 'picking') {
        navigate(`/boom/${pin}`);
      } else if (data.status === 'done') {
        navigate(`/done/${pin}`);
      }
    } catch {
      message.error('Không thể tải kết quả.');
    } finally {
      setLoading(false);
    }
  }, [pin, navigate]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Poll status for auto-redirect
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.sessions.getStatus(pin);
        const data = res.data;
        if (data.error) return;
        if (data.status === 'picking') {
          clearInterval(interval);
          navigate(`/boom/${pin}`);
        } else if (data.status === 'done') {
          clearInterval(interval);
          navigate(`/done/${pin}`);
        }
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pin, navigate]);

  const handleBoom = async () => {
    if (booming) return;
    setBooming(true);
    try {
      const res = await api.sessions.boom(pin);
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        setBooming(false);
        return;
      }
      navigate(`/boom/${pin}`);
    } catch {
      message.error('Không thể kích hoạt Boom.');
      setBooming(false);
    }
  };

  const handleCloseVoting = async () => {
    try {
      await api.sessions.closeVoting(pin);
      message.success('Đã chốt kết quả!');
      fetchResults();
    } catch {
      message.error('Thao tác thất bại.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant font-semibold">Đang tổng kết bình chọn...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white border-2 border-dashed border-outline/50 rounded-3xl p-10 max-w-md w-full text-center flex flex-col items-center gap-4 shadow-sm">
            <FontAwesomeIcon icon={faUtensils} className="w-16 h-16 text-outline/30 mb-2" />
            <p className="text-on-surface-variant font-medium">Chưa có kết quả. Vui lòng chờ host chốt phiếu.</p>
            {isHost && (
              <button
                className="mt-4 px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2"
                onClick={handleCloseVoting}
              >
                Chốt kết quả ngay
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  const { topDishes = [], topRestaurants = [] } = results;
  const rank1 = topDishes[0];
  const rank2 = topDishes[1];
  const rank3 = topDishes[2];

  return (
    <Layout>
      <div className="pt-24 flex-grow flex flex-col gap-16 px-4 max-w-5xl mx-auto w-full pb-32">
        {/* Header Section */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-2">Kết quả bình chọn</h1>
          <p className="text-on-surface-variant text-lg font-medium">Sự lựa chọn ưu tú nhất của cả nhóm</p>
        </header>

        {/* Section 1: Hero Rankings */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <FontAwesomeIcon icon={faUtensils} className="w-6 h-6 text-primary" />
            <h2 className="font-headline text-2xl font-bold text-on-surface">Top 3 món ăn nổi bật</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Rank 2 */}
            {rank2 && (
              <motion.div 
                className="md:col-span-4 order-2 md:order-1"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              >
                <div className="bg-surface-container-low p-6 rounded-[2.5rem] border border-outline/20 text-center relative pt-12 shadow-sm group hover:shadow-md transition-all">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-secondary flex items-center justify-center rounded-2xl shadow-lg ring-4 ring-white group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faMedal} className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-headline font-black text-on-surface mb-1 truncate">{rank2.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60">{rank2.category}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 mb-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-secondary to-secondary-fixed-dim h-full"
                      initial={{ width: 0 }} animate={{ width: `${Math.round(rank2.score * 100)}%` }} transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="font-headline text-2xl font-extrabold text-secondary">{Math.round(rank2.score * 100)}%</span>
                </div>
              </motion.div>
            )}

            {/* Rank 1 (The Winner - Largest) */}
            {rank1 && (
              <motion.div 
                className="md:col-span-4 order-1 md:order-2"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-primary p-8 rounded-[3rem] text-center relative pt-14 shadow-2xl shadow-primary/20 group hover:shadow-primary/30 transition-all scale-105 z-10">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white flex items-center justify-center rounded-3xl shadow-xl ring-8 ring-white group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faTrophy} className="text-amber-500 text-4xl" />
                  </div>
                  <h3 className="text-2xl font-headline font-black text-white mb-2 truncate">{rank1.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-on-primary/80">{rank1.category}</span>
                  </div>
                  <div className="w-full bg-on-primary/20 rounded-full h-3 mb-3 relative z-10 overflow-hidden">
                    <motion.div
                      className="bg-white h-full"
                      initial={{ width: 0 }} animate={{ width: `${Math.round(rank1.score * 100)}%` }} transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="font-headline text-4xl font-extrabold text-white">{Math.round(rank1.score * 100)}%</span>
                </div>
              </motion.div>
            )}

            {/* Rank 3 */}
            {rank3 && (
              <motion.div 
                className="md:col-span-4 order-3 md:order-3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              >
                <div className="bg-surface-container-low p-6 rounded-[2.5rem] border border-outline/20 text-center relative pt-12 shadow-sm group hover:shadow-md transition-all">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-secondary flex items-center justify-center rounded-2xl shadow-lg ring-4 ring-white group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faAward} className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-headline font-black text-on-surface mb-1 truncate">{rank3.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60">{rank3.category}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 mb-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-secondary to-secondary-fixed-dim h-full"
                      initial={{ width: 0 }} animate={{ width: `${Math.round(rank3.score * 100)}%` }} transition={{ duration: 1 }}
                    />
                  </div>
                  <span className="font-headline text-2xl font-extrabold text-secondary">{Math.round(rank3.score * 100)}%</span>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Section 2: Full Restaurant List (Top 5) */}
        <section className="mb-4">
          <div className="flex items-center gap-3 mb-8">
            <FontAwesomeIcon icon={faStore} className="w-6 h-6 text-primary" />
            <h2 className="font-headline text-2xl font-bold text-on-surface">Danh sách quán ăn phù hợp</h2>
          </div>

          <div className="space-y-6">
            {/* Top 3 - Full wide cards */}
            {topRestaurants.slice(0, 3).map((r, idx) => (
              <motion.div 
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-surface-container-lowest rounded-3xl p-1 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-outline/10"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 p-5">
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-surface-container">
                    {r.thumbnailUrl ? (
                      <img alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={r.thumbnailUrl} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><FontAwesomeIcon icon={faStore} className="w-10 h-10 text-outline/20" /></div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                      <h3 className="font-headline text-xl font-bold text-on-surface truncate">{r.name}</h3>
                      {r.matchedDishes && (
                        <span className="bg-primary-container/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-tight">
                          <FontAwesomeIcon icon={faUtensils} className="w-3 h-3" />
                          {r.matchedDishes[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant text-sm flex items-center justify-center md:justify-start gap-1 mb-3">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                      {r.address}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-6 text-sm font-semibold">
                      <span className="flex items-center gap-1 text-on-surface">
                        <FontAwesomeIcon icon={faWallet} className="w-4 h-4 text-secondary" />
                        {r.priceDisplay || '---'}
                      </span>
                      <span className="flex items-center gap-1 text-on-surface">
                        <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-amber-500" />
                        {r.rating || '4.5'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 shrink-0">
                    <span className="font-headline text-3xl font-extrabold text-primary">#{r.rank}</span>
                    <div className="bg-surface-container px-4 py-2 rounded-full">
                      <span className="font-headline font-extrabold text-primary text-lg">
                        {Math.round((r.matchScore || (0.95 - idx * 0.05)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Rank 4 and 5 - Side by side (50% each) - Mini-Mirrors of Top 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topRestaurants.slice(3, 5).map((r, idx) => (
                <motion.div 
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="bg-surface-container-low rounded-[2rem] border border-outline/20 relative group hover:shadow-lg transition-all overflow-hidden p-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail Mini */}
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-surface-container">
                      {r.thumbnailUrl ? (
                        <img alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={r.thumbnailUrl} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline/30">
                          <FontAwesomeIcon icon={faStore} className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Info Mini */}
                    <div className="flex-grow min-w-0 space-y-0.5">
                      <h4 className="font-headline text-sm font-black text-on-surface truncate pr-2">{r.name}</h4>
                      <p className="text-[10px] font-bold text-on-surface-variant truncate pr-2 opacity-60">
                        {r.address}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="flex items-center gap-1 text-[9px] font-black text-on-surface-variant">
                          <FontAwesomeIcon icon={faWallet} className="text-secondary opacity-60" />
                          {r.priceDisplay || '---'}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-black text-on-surface-variant">
                          <FontAwesomeIcon icon={faStar} className="text-amber-500" />
                          {r.rating || '4.5'}
                        </span>
                      </div>
                    </div>

                    {/* Score/Rank Mini */}
                    <div className="flex flex-col items-end shrink-0 gap-1 pl-2">
                       <span className="font-headline text-lg font-black text-primary">#{r.rank}</span>
                       <div className="px-2 py-1 bg-white rounded-full font-headline font-bold text-[10px] text-primary shadow-sm">
                          {Math.round((r.matchScore || (0.8 - idx * 0.05)) * 100)}%
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action - Very close to results list */}
        <div className="flex flex-col items-center mt-2 mb-12">
          <p className="mb-10 text-on-surface-variant text-sm font-medium text-center px-6 italic opacity-80">
            Host có quyền loại bỏ ngẫu nhiên 2 quán để chọn ra 3 quán cuối cùng.
          </p>

          {isHost && (
            <button
              onClick={handleBoom}
              disabled={booming}
              className="bg-error hover:bg-red-700 text-white font-headline text-2xl font-extrabold py-6 px-12 rounded-full shadow-2xl shadow-error/40 transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-4 group disabled:opacity-50 disabled:scale-100"
            >
              {booming ? (
                <>
                  <FontAwesomeIcon icon={faHistory} className="w-6 h-6 animate-spin" />
                  ĐANG LỌC...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faBolt} className="w-8 h-8 group-hover:animate-pulse" />
                  <span>BOOM </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
