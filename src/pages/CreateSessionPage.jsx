import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useAuthStore } from '@/store/authStore';
import { PRICE_TIERS } from '@/utils/constants';
import JoinModal from '@/components/modals/JoinModal';

const COLLECTION_STYLES = [
  { icon: 'restaurant', colorClass: 'text-secondary', bgClass: 'bg-secondary-container/30' },
  { icon: 'lunch_dining', colorClass: 'text-primary', bgClass: 'bg-primary-container/20' },
  { icon: 'diamond', colorClass: 'text-tertiary', bgClass: 'bg-tertiary-container/30' },
];

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { setSession } = useSessionStore();

  // Collections
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Form
  const { user } = useAuthStore();
  const [nickname, setNickname] = useState(user?.fullName || '');
  const [selectedTier, setSelectedTier] = useState(null);
  const [creating, setCreating] = useState(false);

  // Join Modal
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Load default collections
  useEffect(() => {
    api.collections.list().then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data?.collections || [];
      const top3 = data.slice(0, 3);
      setCollections(top3);
      if (top3.length > 0) setSelectedCollection(top3[0]);
      setLoadingCollections(false);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      message.error('Vui lòng nhập nickname');
      return;
    }
    if (!selectedTier) {
      message.error('Vui lòng chọn mức giá');
      return;
    }
    if (!selectedCollection) {
      message.error('Vui lòng chọn khu vực ăn trưa');
      return;
    }

    setCreating(true);
    try {
      const res = await api.sessions.create({
        collectionId: selectedCollection?.id || null,
        priceTier: selectedTier.key,
        nickname: nickname.trim(),
      });
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        return;
      }

      setSession({
        pin: data.pin,
        sessionId: data.sessionId,
        participantId: data.participantId,
        isHost: true,
        collectionId: selectedCollection?.id || null,
        collectionName: selectedCollection?.name || data.collectionName || 'Khu vực tự chọn',
        priceTier: selectedTier.key,
        priceDisplay: selectedTier.priceDisplay,
      });
      localStorage.setItem('lunchsync-create-history', JSON.stringify({
        collectionId: selectedCollection?.id,
        priceTier: selectedTier.key,
      }));
      navigate(`/lobby/${data.pin}`);
    } catch {
      message.error('Tạo phiên thất bại. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_8px_24px_rgba(44,47,48,0.06)]">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-lg mx-auto">
          <button 
            onClick={() => navigate(-1)}
            type="button"
            className="text-orange-700 dark:text-orange-500 scale-95 active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline font-bold tracking-tight text-xl text-orange-700 dark:text-orange-500">LunchSync</h1>
          <div className="w-6"></div> {/* Spacer for center alignment */}
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto">
        {/* Hero Editorial Section */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">Social Dining</span>
            <h2 className="font-headline font-extrabold text-4xl leading-tight tracking-tight text-on-surface">Tạo nhóm</h2>
            <p className="text-on-surface-variant mt-2 text-sm">Kết nối đồng nghiệp, khám phá ẩm thực cùng nhau.</p>
          </div>
          {/* Join Button (Secondary Action) */}
          <button 
            onClick={() => setShowJoinModal(true)}
            type="button"
            className="mt-2 bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            Tham gia
          </button>
        </div>

        <form className="space-y-10" onSubmit={handleCreate}>
          {/* Nickname Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="font-headline font-bold text-lg text-on-surface">Tên hiển thị</h3>
              <span className="text-[10px] text-outline font-bold">BẮT BUỘC</span>
            </div>
            <div className="relative group">
              <input 
                className="w-full h-14 bg-surface-container-lowest rounded-lg px-5 outline-none border-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline/60 shadow-sm font-medium" 
                placeholder="Nhập nickname của bạn..." 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-container opacity-40 group-focus-within:opacity-100 transition-opacity">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
          </section>

          {/* Lunch Area Section */}
          <section className="space-y-4">
            <h3 className="font-headline font-bold text-lg text-on-surface">Khu vực</h3>
            <div className="grid grid-cols-1 gap-4">
              {loadingCollections ? (
                <div className="flex justify-center p-4"><span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span></div>
              ) : collections.map((col, idx) => {
                const style = COLLECTION_STYLES[idx % COLLECTION_STYLES.length];
                const isSelected = selectedCollection?.id === col.id;
                return (
                  <label key={col.id} className="relative block cursor-pointer group">
                    <input 
                      checked={isSelected} 
                      onChange={() => setSelectedCollection(col)}
                      className="peer sr-only" 
                      name="area" 
                      type="radio"
                    />
                    <div className={`rounded-lg p-5 transition-all duration-300 shadow-sm overflow-hidden border border-transparent ${isSelected ? 'bg-surface-container-lowest ring-2 ring-primary' : 'bg-surface-container-low group-hover:bg-surface-container-high'}`}>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                          <h4 className="font-headline font-bold text-on-surface">{col.name}</h4>
                          <p className="text-xs text-on-surface-variant truncate max-w-[220px]">{col.description}</p>
                          <div className={`flex items-center gap-2 mt-2 w-fit px-3 py-1 rounded-full ${style.bgClass}`}>
                            <span className={`material-symbols-outlined text-[14px] ${style.colorClass}`}>{style.icon}</span>
                            <span className={`text-[10px] font-bold ${style.colorClass}`}>
                              {col.restaurantCount ? `${col.restaurantCount} quán` : 'Nhiều lựa chọn'}
                            </span>
                          </div>
                        </div>
                        <span className={`material-symbols-outlined text-primary transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>check_circle</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Price Range Section */}
          <section className="space-y-4">
            <h3 className="font-headline font-bold text-lg text-on-surface">Mức giá</h3>
            <div className="flex flex-wrap gap-3">
              {PRICE_TIERS.map((tier) => {
                const isSelected = selectedTier?.key === tier.key;
                return (
                  <label key={tier.key} className="cursor-pointer group">
                    <input 
                      checked={isSelected} 
                      onChange={() => setSelectedTier(tier)}
                      className="peer sr-only" 
                      name="price" 
                      type="radio"
                    />
                    <span className={`px-6 py-2.5 rounded-full border text-sm font-medium transition-all block ${
                      isSelected 
                      ? 'bg-primary text-on-primary border-primary shadow-md' 
                      : 'border-outline-variant text-on-surface-variant'
                    }`}>
                      {tier.key === 'duoi_40k' ? 'Dưới 40k' : tier.key === '40_70k' ? '40k - 70k' : tier.key === '70_120k' ? '70k - 120k' : 'Trên 120k'}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Action Button */}
          <div className="flex justify-center pt-8 pb-8">
            <button 
              type="submit"
              disabled={creating || loadingCollections}
              className={`w-full max-w-xs py-4 rounded-full text-on-primary font-headline font-bold text-lg shadow-xl shadow-primary/20 scale-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 ${creating ? 'bg-primary/50' : 'bg-gradient-to-br from-primary to-primary-container'}`}
            >
              {creating ? 'Đang tạo...' : 'Tạo nhóm'}
              {!creating && <span className="material-symbols-outlined">group_add</span>}
            </button>
          </div>
        </form>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-t-[2rem] shadow-[0_-8px_24px_rgba(44,47,48,0.06)]">
        <div className="max-w-lg mx-auto flex justify-around items-center px-4 pt-2 pb-6">
          <button 
            onClick={() => navigate('/')}
            type="button"
            className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 px-8 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full scale-100 active:scale-95 transition-all duration-200">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-label text-[11px] font-medium">Explore</span>
          </button>
          <button 
            type="button"
            className="flex flex-col items-center justify-center bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-full px-8 py-1 scale-100 active:scale-95 transition-all duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            <span className="font-label text-[11px] font-medium">LunchSync</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            type="button"
            className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 px-8 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full scale-100 active:scale-95 transition-all duration-200">
            <span className="material-symbols-outlined">person</span>
            <span className="font-label text-[11px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      <JoinModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
}
