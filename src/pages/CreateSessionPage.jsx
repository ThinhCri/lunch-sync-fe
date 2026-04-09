import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useAuthStore } from '@/store/authStore';
import { PRICE_TIERS } from '@/utils/constants';
import Header from '@/components/layout/Header';
import JoinModal from '@/components/modals/JoinModal';
import BottomNav from '@/components/layout/BottomNav';

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
  const { user, isAuthenticated } = useAuthStore();
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

    if (!isAuthenticated()) {
      message.warning('Vui lòng đăng nhập để tạo nhóm');
      navigate('/login', { state: { returnTo: '/create' } });
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
    } catch (err) {
      message.error(err.message || 'Tạo phiên thất bại. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <Header title="LunchSync Create" />

      <main className="pt-24 pb-56 px-6 max-w-lg mx-auto">
        {/* Hero Editorial Section */}
        <div className="mb-10 flex justify-between items-start">
          <div>
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">Social Dining</span>
            <h2 className="font-headline font-extrabold text-4xl leading-tight tracking-tight text-on-surface">Tạo nhóm</h2>
            <p className="text-on-surface-variant mt-2 text-sm">Kết nối đồng nghiệp, khám phá ẩm thực cùng nhau.</p>
          </div>
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
              disabled={creating || loadingCollections || !nickname.trim() || !selectedTier || !selectedCollection}
              className={`w-full max-w-xs py-4 rounded-full font-headline font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                (!nickname.trim() || !selectedTier || !selectedCollection || creating)
                  ? 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed'
                  : 'bg-gradient-to-br from-primary to-primary-container shadow-xl shadow-primary/20 text-on-primary scale-100 active:scale-95'
              }`}
            >
              {creating ? 'Đang tạo...' : 'Tạo nhóm'}
              {!creating && <span className="material-symbols-outlined">group_add</span>}
            </button>
          </div>
        </form>
      </main>

      {/* FAB: Tham gia */}
      <button 
        onClick={() => setShowJoinModal(true)}
        className="fixed bottom-32 right-6 z-50 bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center gap-2 px-6 py-4 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
        <span className="material-symbols-outlined">login</span>
        <span className="font-label font-bold text-sm tracking-wide">Tham gia</span>
      </button>

      {/* BottomNavBar */}
      <BottomNav />

      <JoinModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
}
