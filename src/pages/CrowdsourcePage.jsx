import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useToastStore } from '@/store/toastStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { PartyPopper, MapPin, Link, Camera, CheckCircle2 } from 'lucide-react';

const TIER_OPTIONS = [
  { key: 'duoi_40k', label: 'Dưới 40k' },
  { key: '40_70k', label: '40k - 70k' },
  { key: '70_120k', label: '70k - 120k' },
  { key: 'tren_120k', label: 'Trên 120k' },
];

export default function CrowdsourcePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { show } = useToastStore();

  const [form, setForm] = useState({
    restaurantName: '',
    address: '',
    googleMapsUrl: '',
    priceTier: TIER_OPTIONS[1].key,
    notes: '',
    photos: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.slice(0, 5 - form.photos.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
  };

  const removePhoto = (index) => {
    setForm((prev) => {
      const newPhotos = [...prev.photos];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return { ...prev, photos: newPhotos };
    });
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
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
      await api.crowdsource.submit({
        restaurantName: form.restaurantName.trim(),
        address: form.address.trim(),
        googleMapsUrl: form.googleMapsUrl?.trim() || null,
        priceTier: form.priceTier,
        priceDisplay: TIER_OPTIONS.find((t) => t.key === form.priceTier)?.label || '',
        notes: form.notes.trim(),
        photoUrls: [],
        dishIds: [],
      });
      show('Đề xuất thành công!');
      setTimeout(() => navigate('/'), 1000);
    } catch {
      show('Gửi đề xuất thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-40">
      <Header title="LunchSync" />

      <main className="pt-28 px-6 max-w-2xl mx-auto">
        {/* Hero Section */}
        <section className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary-container/20">
            <PartyPopper className="text-primary text-3xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-on-surface leading-tight tracking-tight mb-2 font-headline">
            Chia sẻ địa điểm ăn uống yêu thích của bạn!
          </h2>
          <p className="text-on-surface-variant text-body-md font-medium">
            Gợi ý cho cộng đồng LunchSync những quán ngon bí mật của bạn.
          </p>
        </section>

        {/* Form Container */}
        <form className="space-y-8" onSubmit={handleSubmit} noValidate>
          {/* Section 1: Basic Info */}
          <section className="space-y-4">
            <div className="group">
              <label className="block text-sm font-semibold text-on-surface-variant mb-2 ml-1">Tên quán</label>
              <input
                className={`w-full h-14 px-5 rounded-lg bg-surface-container-lowest border-none ring-1 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary ${errors.restaurantName ? 'ring-error focus:ring-error bg-error/5' : 'ring-outline/30'}`}
                placeholder="Ví dụ: Phở Thìn Lò Đúc"
                type="text"
                value={form.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
              />
              {errors.restaurantName && <p className="text-error text-xs mt-1 ml-1">{errors.restaurantName}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-on-surface-variant mb-2 ml-1">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className={`w-full h-14 pl-12 pr-5 rounded-lg bg-surface-container-lowest border-none ring-1 transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary ${errors.address ? 'ring-error focus:ring-error bg-error/5' : 'ring-outline/30'}`}
                  placeholder="Số nhà, tên đường, quận..."
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              {errors.address && <p className="text-error text-xs mt-1 ml-1">{errors.address}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-on-surface-variant mb-2 ml-1">Đường dẫn Google Maps</label>
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className="w-full h-14 pl-12 pr-5 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline/30 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                  placeholder="Ví dụ: https://maps.app.goo.gl/..."
                  type="url"
                  value={form.googleMapsUrl}
                  onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Photo Upload */}
          <section>
            <label className="block text-sm font-semibold text-on-surface-variant mb-3 ml-1">Tải lên hình ảnh món ăn</label>
            <div className="relative group cursor-pointer" onClick={triggerUpload}>
              <div className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-outline/50 bg-surface-container-low flex flex-col items-center justify-center overflow-hidden transition-all group-hover:bg-surface-container-high group-hover:border-primary/50">
                {form.photos.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img alt="Food preview" className="w-full h-full object-cover" src={form.photos[0].preview}/>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold">Thay đổi ảnh</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="z-10 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg mb-3 text-primary">
                        <Camera className="text-3xl" />
                      </div>
                      <span className="text-sm font-bold text-on-surface">Nhấn để chọn ảnh</span>
                      <span className="text-xs text-on-surface-variant mt-1">Dung lượng tối đa 5MB</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            {form.photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {form.photos.slice(1).map((photo, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden group/thumb">
                    <img src={photo.preview} className="w-full h-full object-cover" alt="Preview thumb" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs scale-0 group-hover/thumb:scale-100 transition-transform"
                      onClick={(e) => { e.stopPropagation(); removePhoto(i+1); }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Price Tier Selection */}
          <section>
            <label className="block text-sm font-semibold text-on-surface-variant mb-4 ml-1">Mức giá trung bình</label>
            <div className="grid grid-cols-2 gap-3">
              {TIER_OPTIONS.map((tier) => (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => handleChange('priceTier', tier.key)}
                  className={`h-12 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2 ${
                    form.priceTier === tier.key
                    ? 'bg-secondary/10 ring-2 ring-secondary text-secondary font-bold'
                    : 'bg-surface-container-lowest border-none ring-1 ring-outline/30 text-on-surface-variant font-semibold hover:bg-primary/5 hover:text-primary hover:ring-primary'
                  }`}
                >
                  {tier.label}
                  {form.priceTier === tier.key && (
                    <CheckCircle2 className="text-lg" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4: Additional details */}
          <section>
            <label className="block text-sm font-semibold text-on-surface-variant mb-2 ml-1">Lời nhắn/Gợi ý món ngon (Tùy chọn)</label>
            <textarea
              className="w-full p-5 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline/30 focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-on-surface-variant/50 outline-none resize-none"
              placeholder="Nên thử bún chả với nem cua bể ở đây..."
              rows="4"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </section>

          {/* Footer Action */}
          <section className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-16 bg-primary text-white rounded-full font-bold text-lg shadow-lg shadow-primary/20 transition-transform ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              {loading ? 'Đang gửi...' : 'Gửi đề xuất'}
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-4 font-medium px-4">
              Bằng cách nhấn gửi, bạn đồng ý chia sẻ thông tin này với cộng đồng LunchSync.
            </p>
          </section>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
