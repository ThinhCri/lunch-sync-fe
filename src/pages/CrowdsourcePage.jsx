import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockHandlers } from '@/api/mock';
import { PRICE_TIERS, MOCK_COLLECTIONS } from '@/api/mock';
import styles from './CrowdsourcePage.module.css';

const TIER_OPTIONS = [
  { key: 'duoi_40k', label: 'Dưới 40k' },
  { key: '40_70k', label: '40–70k' },
  { key: '70_120k', label: '70–120k' },
  { key: 'tren_120k', label: 'Trên 120k' },
];

export default function CrowdsourcePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    restaurantName: '',
    address: '',
    collectionId: MOCK_COLLECTIONS[0]?.id || '',
    priceTier: TIER_OPTIONS[1].key,
    notableDishes: '',
    thumbnailUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.restaurantName.trim()) errs.restaurantName = 'Vui lòng nhập tên quán';
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
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
      await mockHandlers.submitSuggestion({
        restaurantName: form.restaurantName.trim(),
        address: form.address.trim(),
        collectionId: form.collectionId,
        priceTier: form.priceTier,
        notableDishes: form.notableDishes.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        priceDisplay: TIER_OPTIONS.find(t => t.key === form.priceTier)?.label || '',
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <span className={styles.headerTitle}>Đề xuất quán mới</span>
          <div style={{ width: 40 }} />
        </div>
        <div className={styles.successPage}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#e8f5e9"/>
              <circle cx="32" cy="32" r="22" fill="#51CF66"/>
              <path d="M22 32l8 8 12-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.successTitle}>Cảm ơn bạn!</h2>
          <p className={styles.successSubtitle}>
            Đề xuất của bạn đã được gửi. Đội ngũ LunchSync sẽ xem xét trong thời gian sớm nhất.
          </p>
          <button className={styles.homeBtn} onClick={() => navigate('/')}>
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>Đề xuất quán mới</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        <p className={styles.desc}>
          Biết một quán ngon mà chưa có trong danh sách? Hãy gợi ý để cả nhóm cùng thưởng thức!
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Tên quán */}
          <div className={styles.field}>
            <label className="field-label" htmlFor="name">Tên quán *</label>
            <input
              id="name"
              type="text"
              className={`text-field ${errors.restaurantName ? styles.inputError : ''}`}
              placeholder="VD: Quán Cơm Bình Dân"
              value={form.restaurantName}
              onChange={e => handleChange('restaurantName', e.target.value)}
              disabled={loading}
            />
            {errors.restaurantName && <p className="field-error">{errors.restaurantName}</p>}
          </div>

          {/* Địa chỉ */}
          <div className={styles.field}>
            <label className="field-label" htmlFor="address">Địa chỉ *</label>
            <input
              id="address"
              type="text"
              className={`text-field ${errors.address ? styles.inputError : ''}`}
              placeholder="VD: 88 Nguyễn Trãi, Q1"
              value={form.address}
              onChange={e => handleChange('address', e.target.value)}
              disabled={loading}
            />
            {errors.address && <p className="field-error">{errors.address}</p>}
          </div>

          {/* Khu vực */}
          <div className={styles.field}>
            <label className="field-label" htmlFor="collection">Khu vực</label>
            <select
              id="collection"
              className={`text-field ${styles.select}`}
              value={form.collectionId}
              onChange={e => handleChange('collectionId', e.target.value)}
              disabled={loading}
            >
              {MOCK_COLLECTIONS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Mức giá */}
          <div className={styles.field}>
            <label className="field-label">Mức giá</label>
            <div className={styles.tierGrid}>
              {TIER_OPTIONS.map(tier => (
                <button
                  key={tier.key}
                  type="button"
                  className={`${styles.tierChip} ${form.priceTier === tier.key ? styles.tierSelected : ''}`}
                  onClick={() => handleChange('priceTier', tier.key)}
                  disabled={loading}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Món nổi bật */}
          <div className={styles.field}>
            <label className="field-label" htmlFor="dishes">Món nổi bật</label>
            <input
              id="dishes"
              type="text"
              className="text-field"
              placeholder="VD: Phở cuốn, Bún bò"
              value={form.notableDishes}
              onChange={e => handleChange('notableDishes', e.target.value)}
              disabled={loading}
            />
            <p className={styles.fieldHint}>Có thể điền nhiều món, cách nhau bằng dấu phẩy</p>
          </div>

          {/* URL ảnh */}
          <div className={styles.field}>
            <label className="field-label" htmlFor="thumb">Ảnh quán (URL, tùy chọn)</label>
            <input
              id="thumb"
              type="url"
              className="text-field"
              placeholder="https://..."
              value={form.thumbnailUrl}
              onChange={e => handleChange('thumbnailUrl', e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`btn-filled ${loading ? styles.loading : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                Gửi đề xuất
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
