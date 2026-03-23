import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { PRICE_TIERS } from '@/utils/constants';
import styles from './CrowdsourcePage.module.css';

const TIER_OPTIONS = [
  { key: 'duoi_40k', label: 'Dưới 40k' },
  { key: '40_70k', label: '40–70k' },
  { key: '70_120k', label: '70–120k' },
  { key: 'tren_120k', label: 'Trên 120k' },
];

// ── Step 1: Search ───────────────────────────────────────────────────────────
function SearchStep({ onNext }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [upvotingId, setUpvotingId] = useState(null);
  const [upvotedIds, setUpvotedIds] = useState({});
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await api.crowdsource.search(q);
    setResults(res.data || []);
    setSearching(false);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 400);
  };

  const handleUpvote = async (restaurant) => {
    setUpvotingId(restaurant.id);
    const res = await api.crowdsource.upvote(restaurant.id);
    setUpvotedIds(prev => ({ ...prev, [restaurant.id]: res.data.upvotes }));
    setUpvotingId(null);
  };

  const handleNotFound = () => {
    onNext({ query });
  };

  return (
    <>
      {/* Search bar */}
      <div className={styles.searchWrap}>
        <div className={styles.searchInputWrap}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm quán ăn..."
            value={query}
            onChange={handleQueryChange}
            autoFocus
          />
          {query && (
            <button className={styles.searchClear} onClick={() => { setQuery(''); setResults([]); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Hint text */}
      <p className={styles.dedupHint}>
        Gõ tên quán để kiểm tra xem đã có trong hệ thống chưa
      </p>

      {/* Loading */}
      {searching && (
        <div className={styles.searchLoading}>
          <span className={styles.loadingDot} /><span className={styles.loadingDot} /><span className={styles.loadingDot} />
          <span className={styles.searchLoadingText}>Đang tìm...</span>
        </div>
      )}

      {/* Results */}
      {!searching && results.length > 0 && (
        <div className={styles.dedupResults}>
          <h3 className={styles.dedupTitle}>Có phải quán này không?</h3>
          {results.map(rest => {
            const upvotedCount = upvotedIds[rest.id];
            const isUpvoted = upvotedCount !== undefined;
            return (
              <div key={rest.id} className={styles.dedupCard}>
                {rest.thumbnailUrl && (
                  <img className={styles.dedupThumb} src={rest.thumbnailUrl} alt={rest.name} />
                )}
                <div className={styles.dedupCardBody}>
                  <div className={styles.dedupCardTop}>
                    <div>
                      <p className={styles.dedupName}>{rest.name}</p>
                      <p className={styles.dedupAddr}>{rest.address}</p>
                      <div className={styles.dedupMeta}>
                        {rest.priceDisplay && (
                          <span className={styles.dedupTag}>{rest.priceDisplay}</span>
                        )}
                        {rest.rating && (
                          <span className={styles.dedupTag}>★ {rest.rating}</span>
                        )}
                      </div>
                    </div>
                    {isUpvoted && (
                      <div className={styles.dedupUpvoted}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span>{upvotedCount}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.dedupActions}>
                    {isUpvoted ? (
                      <button className={styles.upvotedBtn} disabled>
                        ✓ Đã Upvote
                      </button>
                    ) : (
                      <button
                        className={styles.upvoteBtn}
                        onClick={() => handleUpvote(rest)}
                        disabled={upvotingId === rest.id}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                        </svg>
                        Upvote
                      </button>
                    )}
                    <button className={styles.newBtn} onClick={() => onNext({ query })}>
                      Không phải — Đề xuất quán mới
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results + "not found" button */}
      {!searching && query.length >= 2 && results.length === 0 && (
        <div className={styles.dedupNotFound}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.dedupNotFoundIcon}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p>Chưa có quán nào trong hệ thống</p>
          <button className={styles.newBtn} onClick={handleNotFound}>
            Đề xuất quán mới
          </button>
        </div>
      )}
    </>
  );
}

// ── Step 2: Suggestion Form ────────────────────────────────────────────────────
function SuggestForm({ initialQuery, onSuccess }) {
  const [collections, setCollections] = useState([]);
  const [form, setForm] = useState({
    restaurantName: initialQuery || '',
    address: '',
    googleMapsUrl: '',
    collectionId: '',
    priceTier: TIER_OPTIONS[1].key,
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load collections on mount
  useEffect(() => {
    api.collections.list().then((res) => {
      const data = res.data;
      if (data && data.collections) {
        setCollections(data.collections);
        setForm(prev => ({ ...prev, collectionId: data.collections[0]?.id || '' }));
      } else if (Array.isArray(data)) {
        setCollections(data);
        setForm(prev => ({ ...prev, collectionId: data[0]?.id || '' }));
      }
    });
  }, []);

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
      const res = await api.crowdsource.submit({
        restaurantName: form.restaurantName.trim(),
        address: form.address.trim(),
        googleMapsUrl: form.googleMapsUrl?.trim() || null,
        priceTier: form.priceTier,
        priceDisplay: TIER_OPTIONS.find(t => t.key === form.priceTier)?.label || '',
        notes: form.notes.trim(),
        photoUrls: [],
        dishIds: [],
      });
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Tên quán */}
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="name">Tên quán *</label>
        <input
          id="name"
          type="text"
          className={`${styles.textField} ${errors.restaurantName ? styles.inputError : ''}`}
          placeholder="VD: Quán Cơm Bình Dân"
          value={form.restaurantName}
          onChange={e => handleChange('restaurantName', e.target.value)}
          disabled={loading}
        />
        {errors.restaurantName && <p className={styles.fieldError}>{errors.restaurantName}</p>}
      </div>

      {/* Địa chỉ */}
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="address">Địa chỉ / Link Google Maps *</label>
        <input
          id="address"
          type="text"
          className={`${styles.textField} ${errors.address ? styles.inputError : ''}`}
          placeholder="VD: 88 Nguyễn Trãi, Q1 hoặc https://maps.google.com/..."
          value={form.address}
          onChange={e => handleChange('address', e.target.value)}
          disabled={loading}
        />
        {errors.address && <p className={styles.fieldError}>{errors.address}</p>}
      </div>

      {/* Khu vực */}
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="collection">Khu vực</label>
        <select
          id="collection"
          className={`${styles.textField} ${styles.select}`}
          value={form.collectionId}
          onChange={e => handleChange('collectionId', e.target.value)}
          disabled={loading}
        >
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Mức giá */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Mức giá</label>
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

      {/* Ghi chú */}
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="notes">Ghi chú</label>
        <textarea
          id="notes"
          className={`${styles.textField} ${styles.textarea}`}
          placeholder="VD: Quán đông vào buổi trưa, nên đi sớm"
          value={form.notes}
          onChange={e => handleChange('notes', e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      <button
        type="submit"
        className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
        disabled={loading}
      >
        {loading ? (
          <span className={styles.spinner} />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Gửi đề xuất
          </>
        )}
      </button>
    </form>
  );
}

// ── Main CrowdsourcePage ───────────────────────────────────────────────────────
export default function CrowdsourcePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('search'); // 'search' | 'form' | 'done'
  const [formQuery, setFormQuery] = useState('');

  const handleSearchNext = ({ query }) => {
    setFormQuery(query || '');
    setStep('form');
  };

  const handleSuccess = () => {
    setStep('done');
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('search');
      setFormQuery('');
    } else {
      navigate('/');
    }
  };

  // ── Done state ──
  if (step === 'done') {
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
        <button className={styles.backBtn} onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>
          {step === 'form' ? 'Đề xuất quán mới' : 'Tìm quán'}
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        {step === 'search' ? (
          <>
            <h2 className={styles.stepTitle}>Tìm quán có sẵn</h2>
            <p className={styles.stepDesc}>
              Trước khi đề xuất quán mới, hãy kiểm tra xem quán đó đã có trong hệ thống chưa nhé!
            </p>
            <SearchStep onNext={handleSearchNext} />
          </>
        ) : (
          <>
            <h2 className={styles.stepTitle}>Đề xuất quán mới</h2>
            <p className={styles.stepDesc}>
              Quán này chưa có trong hệ thống. Hãy điền thông tin để đóng góp cho cả nhóm!
            </p>
            <SuggestForm initialQuery={formQuery} onSuccess={handleSuccess} />
          </>
        )}
      </div>
    </div>
  );
}
