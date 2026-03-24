import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/api';

const TIER_OPTIONS = [
  { key: 'duoi_40k', label: 'Dưới 40k' },
  { key: '40_70k', label: '40–70k' },
  { key: '70_120k', label: '70–120k' },
  { key: 'tren_120k', label: 'Trên 120k' },
];

export default function CrowdsourcePage() {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [upvotingId, setUpvotingId] = useState(null);
  const [upvotedIds, setUpvotedIds] = useState({});
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    restaurantName: '',
    address: '',
    googleMapsUrl: '',
    priceTier: TIER_OPTIONS[0].key,
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debounceRef = useRef(null);

  // ── Search ───────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(false);
    try {
      const res = await api.crowdsource.search(q);
      setSearchResults(res.data || []);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 400);
  };

  const handleCheck = () => {
    if (searchQuery.trim().length >= 2) {
      handleSearch(searchQuery);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheck();
    }
  };

  const handleUpvote = async (restaurant) => {
    setUpvotingId(restaurant.id);
    try {
      const res = await api.crowdsource.upvote(restaurant.id);
      setUpvotedIds((prev) => ({ ...prev, [restaurant.id]: res.data.upvotes }));
    } catch {
      message.error('Không thể upvote. Vui lòng thử lại.');
    } finally {
      setUpvotingId(null);
    }
  };

  const handleSuggestNew = (name) => {
    setForm((prev) => ({ ...prev, restaurantName: name || searchQuery }));
    setShowResults(false);
    setSearchQuery('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Form ─────────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.restaurantName.trim()) errs.restaurantName = 'Vui lòng nhập tên quán';
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await api.crowdsource.submit({
        restaurantName: form.restaurantName.trim(),
        address: form.address.trim(),
        googleMapsUrl: form.googleMapsUrl?.trim() || null,
        priceTier: form.priceTier,
        priceDisplay: TIER_OPTIONS.find((t) => t.key === form.priceTier)?.label || '',
        notes: form.notes.trim(),
        photoUrls: [],
        dishIds: [],
      });
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        return;
      }
      setDone(true);
    } catch {
      message.error('Gửi đề xuất thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Done state ──────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header />
        <main className="flex-grow pt-20 flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-accent-green text-5xl">verified</span>
            </div>
            <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-4 tracking-tighter">
              Cảm ơn bạn!
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Đề xuất của bạn đã được gửi. Đội ngũ LunchSync sẽ xem xét trong thời gian sớm nhất.
            </p>
            <button
              className="px-10 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              onClick={() => navigate('/')}
            >
              Quay về trang chủ
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <main className="flex-grow pt-20 container mx-auto px-6 py-16 max-w-4xl">

        {/* ── Editorial Header ── */}
        <header className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-bold text-[10px] tracking-[0.2em] uppercase mb-6 border border-secondary/20">
            The Editorial Table
          </span>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-on-surface tracking-tighter mb-6 leading-[1.1]">
            Gợi ý <span className="text-primary italic">hương vị</span> yêu thích
          </h1>
          <p className="text-on-surface-variant max-w-xl mx-auto text-lg leading-relaxed">
            Giúp cộng đồng tìm thấy những góc bếp tâm đắc nhất. Mỗi đề xuất là một câu chuyện về hương vị mà bạn muốn sẻ chia.
          </p>
        </header>

        {/* ── Form Card ── */}
        <section className="relative" ref={formRef}>
          {/* Decorative background blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] -z-10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[120px] -z-10" />

          <div className="bg-white border border-outline shadow-xl shadow-primary/5 p-8 md:p-14 rounded-2xl relative overflow-visible">

            {/* ── Search / Check existing ── */}
            <div className="mb-12 pb-12 border-b border-outline/30">
              <p className="text-sm font-bold text-primary mb-4 text-center">
                Bạn có thể kiểm tra quán đã có hay chưa trước khi đề xuất
              </p>
              <div className="relative max-w-2xl mx-auto">
                <div className="flex gap-3">
                  <div className="relative flex-grow group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none">
                      search
                    </span>
                    <input
                      type="text"
                      className="w-full pl-14 pr-6 py-5 bg-surface-container/50 border border-outline/50 rounded-lg focus:bg-white focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                      placeholder="Tìm tên quán..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                    />
                  </div>
                  <button
                    className="px-8 py-5 bg-on-surface text-white rounded-lg font-bold hover:bg-on-surface-variant transition-all shrink-0"
                    onClick={handleCheck}
                    disabled={searching || searchQuery.trim().length < 2}
                  >
                    Kiểm tra
                  </button>
                </div>

                {/* Loading dots */}
                {searching && (
                  <div className="flex items-center gap-2 pt-4">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                    <span className="ml-2 text-sm text-on-surface-variant">Đang tìm...</span>
                  </div>
                )}

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-outline rounded-lg shadow-xl z-20 overflow-hidden">
                    {searchResults.map((rest) => {
                      const upvotedCount = upvotedIds[rest.id];
                      const isUpvoted = upvotedCount !== undefined;
                      return (
                        <div
                          key={rest.id}
                          className="p-4 hover:bg-surface-container/30 border-b border-outline/10 flex justify-between items-center cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-on-surface-variant/40">restaurant</span>
                            <div>
                              <p className="font-bold text-on-surface">{rest.name}</p>
                              <p className="text-xs text-on-surface-variant">{rest.address}</p>
                              {rest.priceDisplay && (
                                <span className="text-[10px] font-semibold text-on-surface-variant">{rest.priceDisplay}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUpvoted && (
                              <div className="flex items-center gap-1 text-red-500 font-bold text-sm">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                <span>{upvotedCount}</span>
                              </div>
                            )}
                            {isUpvoted ? (
                              <button className="px-3 py-1.5 bg-red-50 text-red-500 text-[10px] font-black uppercase rounded-full border border-red-200 cursor-default" disabled>
                                ✓ Đã Upvote
                              </button>
                            ) : (
                              <button
                                className="px-3 py-1.5 bg-accent-green/10 text-accent-green text-[10px] font-black uppercase rounded-full hover:bg-accent-green/20 transition-colors"
                                onClick={() => handleUpvote(rest)}
                                disabled={upvotingId === rest.id}
                              >
                                Upvote
                              </button>
                            )}
                            <button
                              className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full hover:bg-primary/20 transition-colors"
                              onClick={() => handleSuggestNew(rest.name)}
                            >
                              Đề xuất khác
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="p-4 bg-surface-container/20 text-center">
                      <button className="text-sm font-bold text-primary hover:text-primary-dark transition-colors" onClick={() => handleSuggestNew(searchQuery)}>
                        Không phải — Đề xuất quán mới →
                      </button>
                    </div>
                  </div>
                )}

                {/* No results */}
                {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                  <div className="mt-4 p-6 bg-surface-container/20 border border-dashed border-outline rounded-lg text-center">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-3xl mb-2 block">search</span>
                    <p className="text-sm text-on-surface-variant mb-4">Chưa có quán nào trong hệ thống</p>
                    <button className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition-colors" onClick={() => handleSuggestNew(searchQuery)}>
                      Đề xuất quán mới
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Suggestion Form ── */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={handleSubmit} noValidate>

              {/* Store Name */}
              <div className="md:col-span-2 group">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 ml-1" htmlFor="store-name">
                  Tên quán ăn *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none">
                    restaurant
                  </span>
                  <input
                    id="store-name"
                    type="text"
                    className={`w-full pl-14 pr-8 py-5 bg-surface-container/50 border rounded-lg transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none ${
                      errors.restaurantName
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-outline/50 focus:bg-white focus:border-primary'
                    }`}
                    placeholder="Ví dụ: Bếp Củi Nhà Tôi"
                    value={form.restaurantName}
                    onChange={(e) => handleChange('restaurantName', e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.restaurantName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.restaurantName}</p>}
              </div>

              {/* Address */}
              <div className="group">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 ml-1" htmlFor="address">
                  Địa chỉ *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none">
                    location_on
                  </span>
                  <input
                    id="address"
                    type="text"
                    className={`w-full pl-14 pr-8 py-5 bg-surface-container/50 border rounded-lg transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none ${
                      errors.address
                        ? 'border-red-400 bg-red-50/30'
                        : 'border-outline/50 focus:bg-white focus:border-primary'
                    }`}
                    placeholder="Tên đường, phường, quận..."
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
              </div>

              {/* Google Maps Link */}
              <div className="group">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 ml-1" htmlFor="maps-link">
                  Google Maps
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none">
                    map
                  </span>
                  <input
                    id="maps-link"
                    type="url"
                    className="w-full pl-14 pr-8 py-5 bg-surface-container/50 border border-outline/50 rounded-lg focus:bg-white focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                    placeholder="Dán đường dẫn tại đây..."
                    value={form.googleMapsUrl}
                    onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 ml-1">
                  Mức giá trung bình
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {TIER_OPTIONS.map((tier) => (
                    <label
                      key={tier.key}
                      className={`relative flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-all ${
                        form.priceTier === tier.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container/30 border-outline/30 hover:border-primary/50'
                      }`}
                    >
                      <input
                        className="sr-only"
                        name="price"
                        type="radio"
                        value={tier.key}
                        checked={form.priceTier === tier.key}
                        onChange={() => handleChange('priceTier', tier.key)}
                        disabled={loading}
                      />
                      <span className="font-bold text-sm">{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2 group">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 ml-1" htmlFor="notes">
                  Ghi chú &amp; Đánh giá
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-5 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pointer-events-none">
                    edit_note
                  </span>
                  <textarea
                    id="notes"
                    className="w-full pl-14 pr-8 py-5 bg-surface-container/50 border border-outline/50 rounded-lg focus:bg-white focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                    placeholder="Điều gì làm nên sự khác biệt của quán này?"
                    rows="4"
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Upload Area */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3 ml-1">
                  Hình ảnh quán/món ăn
                </label>
                <div className="border-2 border-dashed border-outline rounded-lg p-12 bg-surface-container/20 flex flex-col items-center justify-center group hover:border-primary/60 transition-all cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                  </div>
                  <p className="text-on-surface font-bold text-sm mb-1 uppercase tracking-wider">Tải lên hình ảnh</p>
                  <p className="text-on-surface-variant/70 text-xs">JPG hoặc PNG • Tối đa 5MB</p>
                  <input accept="image/*" className="hidden" multiple type="file" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-4">
                <button
                  className={`w-full py-6 bg-primary text-white rounded-full font-headline font-extrabold text-lg flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all active:scale-[0.99] ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      GỬI ĐỀ XUẤT NGAY
                    </>
                  )}
                </button>
                <p className="text-center mt-6 text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-60">
                  Thành viên Ban biên tập sẽ phê duyệt trong 24 giờ
                </p>
              </div>
            </form>
          </div>
        </section>

        {/* ── Aside cards ── */}
        <aside className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-gradient-to-br from-surface to-surface-container border border-outline/40 rounded-xl">
            <span className="material-symbols-outlined text-accent-green mb-4 text-3xl block">verified</span>
            <h3 className="font-extrabold text-on-surface mb-2 uppercase text-[10px] tracking-widest">Tính xác thực</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Giúp đồng nghiệp tin tưởng bằng thông tin chính xác nhất.</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-surface to-surface-container border border-outline/40 rounded-xl">
            <span className="material-symbols-outlined text-primary mb-4 text-3xl block">filter_vintage</span>
            <h3 className="font-extrabold text-on-surface mb-2 uppercase text-[10px] tracking-widest">Góc nhìn riêng</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Những bức ảnh thật luôn có giá trị hơn ngàn lời quảng cáo.</p>
          </div>
          <div className="p-8 bg-gradient-to-br from-surface to-surface-container border border-outline/40 rounded-xl">
            <span className="material-symbols-outlined text-secondary mb-4 text-3xl block">workspace_premium</span>
            <h3 className="font-extrabold text-on-surface mb-2 uppercase text-[10px] tracking-widest">Vinh danh</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Mỗi đóng góp được tặng 50 Sync Points vào tài khoản.</p>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
