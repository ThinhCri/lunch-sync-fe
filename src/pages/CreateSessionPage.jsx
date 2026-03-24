import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { PRICE_TIERS, MIN_PARTICIPANTS, MAX_PARTICIPANTS } from '@/utils/constants';

const PRICE_ICONS = {
  duoi_40k: 'savings',
  '40_70k': 'ramen_dining',
  '70_120k': 'lunch_dining',
  tren_120k: 'celebration',
};

const PRICE_LABELS = {
  duoi_40k: 'Tiết kiệm',
  '40_70k': 'Bình thường',
  '70_120k': 'Sang xịn',
  tren_120k: 'Xa xỉ',
};

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { setSession } = useSessionStore();

  // Collections
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCollectionSearch, setShowCollectionSearch] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState('');
  const debounceRef = useRef(null);

  // Form
  const [nickname, setNickname] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

  // Load default collections
  useEffect(() => {
    api.collections.list().then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data?.collections || [];
      setCollections(data);
      setLoadingCollections(false);
    });
  }, []);

  const filteredCollections = collectionSearch.trim()
    ? collections.filter((c) =>
        c.name.toLowerCase().includes(collectionSearch.toLowerCase()) ||
        c.description?.toLowerCase().includes(collectionSearch.toLowerCase())
      )
    : collections;

  const handleCollectionSelect = (col) => {
    setSelectedCollection(col);
    setShowCollectionSearch(false);
    setCollectionSearch('');
  };

  const handleCreate = async () => {
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

      setCreatedSession(data);
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
      // Lưu lịch sử
      localStorage.setItem('lunchsync-create-history', JSON.stringify({
        collectionId: selectedCollection?.id,
        priceTier: selectedTier.key,
      }));
    } catch {
      message.error('Tạo phiên thất bại. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdSession) return;
    const link = `${window.location.origin}/join/${createdSession.pin}`;
    navigator.clipboard.writeText(link).then(() => {
      message.success('Đã copy link mời bạn bè!');
    });
  };

  // ── Done: show PIN + enter lobby ──────────────────────────────────────────────
  if (createdSession) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header />
        <main className="flex-grow pt-28 flex flex-col items-center justify-center px-6 py-16">
          {/* Decorative blobs */}
          <div className="absolute top-40 right-0 w-72 h-72 bg-secondary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />
          <div className="absolute bottom-20 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <div className="w-full max-w-md text-center px-2 sm:px-0">
            {/* Success icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <span className="material-symbols-outlined text-accent-green text-4xl sm:text-5xl">check_circle</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface mb-2 tracking-tight">
              Bữa trưa đã sẵn sàng!
            </h1>
            <p className="text-on-surface-variant mb-6 sm:mb-8 text-sm sm:text-base px-2">
              Chia sẻ mã PIN bên dưới để mời đồng nghiệp tham gia
            </p>

            {/* PIN display */}
            <div className="bg-white border border-outline rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-sm">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 sm:mb-4">Mã PIN của bạn</p>
              <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {createdSession.pin.split('').map((digit, i) => (
                  <div
                    key={i}
                    className="w-9 h-11 sm:w-11 sm:h-14 md:w-12 md:h-14 bg-primary text-white rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black font-headline shadow-lg shadow-primary/25"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Info pills */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 px-1">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-surface-container rounded-full text-[11px] sm:text-xs font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-xs sm:text-sm text-primary">location_on</span>
                  <span className="truncate max-w-[120px]">{createdSession.collectionName || selectedCollection?.name || 'Tự chọn'}</span>
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-surface-container rounded-full text-[11px] sm:text-xs font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-xs sm:text-sm text-primary">payments</span>
                  {selectedTier?.priceDisplay}
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-surface-container rounded-full text-[11px] sm:text-xs font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-xs sm:text-sm text-primary">person</span>
                  {nickname} · Host
                </span>
              </div>

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3 sm:py-3.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">content_copy</span>
                Copy link mời bạn bè
              </button>
            </div>

            {/* Enter lobby */}
            <button
              onClick={() => navigate(`/lobby/${createdSession.pin}`)}
              className="w-full py-4 sm:py-5 bg-secondary text-white rounded-full font-headline font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 hover:bg-secondary/90 active:scale-[0.99] transition-all shadow-2xl shadow-secondary/25 mb-2 sm:mb-3"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">meeting_room</span>
              VÀO PHÒNG CHỜ NGAY
            </button>

            <button
              onClick={() => { setCreatedSession(null); setNickname(''); setSelectedTier(null); setSelectedCollection(null); }}
              className="w-full py-2.5 sm:py-3 border-2 border-dashed border-outline/60 rounded-xl text-xs sm:text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              + Tạo phiên mới
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-2xl">

        {/* Decorative blobs */}
        <div className="absolute top-40 right-0 w-72 h-72 bg-secondary/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-secondary/10 text-secondary font-bold text-[10px] tracking-[0.2em] uppercase border border-secondary/20 mb-3 sm:mb-4">
            Đặt lịch ăn trưa
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline font-extrabold text-on-surface tracking-tighter mb-1 sm:mb-2 leading-[1.1]">
            Tạo bữa <span className="text-primary italic">trưa</span> mới
          </h1>
          <p className="text-on-surface-variant">Nhập thông tin cơ bản và chia sẻ mã PIN để mời đồng nghiệp.</p>
        </div>

        <div className="space-y-8">

          {/* ── Nickname ── */}
          <div>
            <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 ml-1">
              Nickname của bạn *
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none">
                badge
              </span>
              <input
                type="text"
                className="w-full pl-14 pr-5 py-4 bg-surface-container/50 border border-outline/50 rounded-xl focus:bg-white focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none text-base"
                placeholder="VD: Minh, Lan, Boss..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                autoFocus
              />
            </div>
          </div>

          {/* ── Collection ── */}
          <div>
            <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 ml-1">
              Khu vực ăn trưa
            </label>

            {/* Selected chip */}
            {selectedCollection && !showCollectionSearch && (
              <div className="flex items-center gap-3 p-4 bg-white border border-outline rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{selectedCollection.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{selectedCollection.description}</p>
                </div>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-outline/50 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-base">close</span>
                </button>
              </div>
            )}

            {/* Search / pick new */}
            {showCollectionSearch || !selectedCollection ? (
              <div className="bg-white border border-outline/50 rounded-xl overflow-hidden shadow-sm">
                {/* Search input */}
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none bg-transparent"
                    placeholder="Tìm khu vực..."
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Collection list */}
                <div className="max-h-48 sm:max-h-60 overflow-y-auto border-t border-outline/30">
                  {loadingCollections ? (
                    <div className="p-6 text-center text-sm text-on-surface-variant">
                      <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block mr-2" />
                      Đang tải khu vực...
                    </div>
                  ) : filteredCollections.length === 0 ? (
                    <div className="p-6 text-center text-sm text-on-surface-variant">
                      Không tìm thấy khu vực phù hợp
                    </div>
                  ) : (
                    filteredCollections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => handleCollectionSelect(col)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-container/50 transition-colors text-left border-b border-outline/10 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-base">location_on</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-on-surface text-sm truncate">{col.name}</p>
                          {col.description && (
                            <p className="text-xs text-on-surface-variant truncate">{col.description}</p>
                          )}
                        </div>
                        {col.restaurantCount && (
                          <span className="text-[11px] font-bold text-on-surface-variant shrink-0">{col.restaurantCount} quán</span>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {selectedCollection && (
                  <div className="p-3 border-t border-outline/30 bg-surface-container/30">
                    <button
                      onClick={() => { setShowCollectionSearch(false); setCollectionSearch(''); }}
                      className="w-full text-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowCollectionSearch(true)}
                className="mt-3 w-full py-3 border-2 border-dashed border-outline/60 rounded-xl text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Chọn khu vực khác
              </button>
            )}
          </div>

          {/* ── Price Tier ── */}
          <div>
            <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 ml-1">
              Mức giá dự kiến / người
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRICE_TIERS.map((tier) => {
                const isSelected = selectedTier?.key === tier.key;
                return (
                  <button
                    key={tier.key}
                    onClick={() => setSelectedTier(tier)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                        : 'border-outline/40 bg-white text-on-surface hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {isSelected ? PRICE_ICONS[tier.key] : PRICE_ICONS[tier.key]}
                    </span>
                    <div className="text-center">
                      <p className={`font-bold text-xs ${isSelected ? '' : 'text-on-surface'}`}>
                        {PRICE_LABELS[tier.key]}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-on-surface-variant'}`}>
                        {tier.priceDisplay}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow">
                        <span className="material-symbols-outlined text-white text-base">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="pt-2">
            <button
              onClick={handleCreate}
              disabled={creating || !nickname.trim() || !selectedTier || !selectedCollection}
              className={`w-full py-5 rounded-full font-headline font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-2xl ${
                creating || !nickname.trim() || !selectedTier || !selectedCollection
                  ? 'bg-outline/40 text-white/50 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark active:scale-[0.99] shadow-primary/30'
              }`}
            >
              {creating ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo phiên...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  TẠO BỮA TRƯA
                </>
              )}
            </button>

            {/* Info note */}
            <p className="text-center mt-3 sm:mt-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/50 px-2">
              Tối thiểu {MIN_PARTICIPANTS} người • Tối đa {MAX_PARTICIPANTS} người để bắt đầu bình chọn
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
