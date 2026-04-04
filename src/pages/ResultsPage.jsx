import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import BottomNav from '@/components/layout/BottomNav';

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
        <div className="bg-surface-container-lowest border border-outline/20 rounded-xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-[0_4px_16px_rgba(44,47,48,0.04)]">
          <span className="material-symbols-outlined text-5xl text-outline/30">monitoring</span>
          <p className="text-on-surface-variant font-medium text-sm">Chưa có kết quả. Vui lòng chờ host chốt phiếu.</p>
          {isHost && (
            <button
              className="mt-4 px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all active:scale-95"
              onClick={handleCloseVoting}
            >
              Chốt kết quả ngay
            </button>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  const { topDishes = [], topRestaurants = [] } = results;

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl flex items-center justify-between px-6 h-16 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <h1 className="font-headline font-bold tracking-tight text-xl text-zinc-900 dark:text-zinc-50">Kết quả LunchSync</h1>
        </div>
        <button className="active:scale-95 duration-200 hover:opacity-80 transition-opacity text-zinc-500 dark:text-zinc-400">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <main className="pt-24 pb-32 px-4 space-y-10 max-w-xl mx-auto">
        {/* Top 3 Featured Dishes */}
        <section>
          <div className="flex items-end justify-between mb-6 px-2">
            <div>
              <span className="text-primary font-bold tracking-widest text-[10px] uppercase">GỢI Ý MÓN NGON</span>
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">Top {topDishes.length} Món Ăn</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 px-2">
            {topDishes.slice(0, 3).map((dish, idx) => {
              const bgClass = idx === 0 ? 'bg-primary text-white' : idx === 1 ? 'bg-orange-400 text-white' : 'bg-orange-300 text-white';
              const matchText = idx === 0 ? 'text-primary bg-primary/10' : 'text-on-surface-variant bg-zinc-100';
              return (
                <div key={dish.id} className="bg-surface-container-lowest rounded-lg p-4 flex items-center gap-4 shadow-sm border border-orange-100/50">
                  <div className={`${bgClass} w-10 h-10 rounded-full flex items-center justify-center font-headline font-black text-lg shrink-0`}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-base truncate">{dish.name}</h3>
                    <p className="text-on-surface-variant text-xs truncate">{dish.category}</p>
                  </div>
                  <div className={`${matchText} px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap`}>
                    {Math.round((dish.score || 0.9) * 100)}% MATCH
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top 5 Recommended Restaurants */}
        <section className="space-y-6">
          <div className="px-2">
            <span className="text-secondary font-bold tracking-widest text-[10px] uppercase">LUNCHSYNC PICKS</span>
            <h2 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">Top {topRestaurants.length} Nhà Hàng</h2>
          </div>
          
          <div className="space-y-4">
            {topRestaurants.slice(0, 5).map((r, idx) => (
              <div key={r.id} className="group relative bg-surface-container-lowest rounded-lg p-4 flex gap-4 transition-all duration-300 active:scale-[0.98] shadow-[0_4px_12px_rgba(44,47,48,0.04)]">
                <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-md">
                  <img alt={r.name} className="w-full h-full object-cover" src={r.thumbnailUrl || `https://picsum.photos/seed/${r.id}/400/300`} />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white font-headline font-black text-2xl opacity-80">{idx + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline font-bold text-base truncate pr-2">{r.name}</h3>
                      <span className={`${idx === 0 ? 'bg-orange-100 text-orange-800' : 'bg-zinc-200 text-zinc-700'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                        {Math.round((r.matchScore || (0.99 - idx * 0.05)) * 100)}%
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-xs truncate mt-1">{r.address}</p>
                    <div className="flex items-center mt-2 gap-2 text-xs font-medium text-on-surface">
                      <span className="text-primary font-bold">{r.priceDisplay || '---'}</span>
                      <span className="text-zinc-300">•</span>
                      <div className="flex items-center text-amber-500">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="ml-0.5">{r.rating || '4.5'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Host Action Button */}
          {isHost && (
            <div className="px-2 pt-4">
              <button 
                onClick={handleBoom}
                disabled={booming}
                className="w-full bg-gradient-to-r from-primary to-orange-500 text-white rounded-2xl p-6 shadow-[0_12px_24px_rgba(166,51,0,0.25)] relative overflow-hidden active:scale-[0.97] transition-all group disabled:opacity-50"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-active:scale-125 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>explosion</span>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined font-black text-2xl animate-bounce">casino</span>
                    <span className="font-headline font-black text-3xl tracking-tighter uppercase italic">{booming ? 'Đang BOOM...' : 'BOOM!'}</span>
                  </div>
                  <p className="text-white/90 text-sm font-medium leading-tight">
                    Không biết chọn quán nào?<br/>
                    <span className="font-bold underline decoration-white/30 underline-offset-4">Loại bỏ bớt 2 lựa chọn!</span>
                  </p>
                </div>
              </button>
              <p className="text-center text-[10px] text-zinc-400 mt-3 font-medium uppercase tracking-widest">DÀNH RIÊNG CHO TRƯỞNG NHÓM</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
