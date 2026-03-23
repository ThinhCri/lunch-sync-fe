import { useState, useEffect } from 'react';
import { api } from '@/api';
import { useAdminStore } from '@/store/adminStore';
import AdminLayout from '@/components/admin/AdminLayout';
import styles from './SubmissionsPage.module.css';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: '#c47d00', bg: '#FFF3E0' },
  approved: { label: 'Đã duyệt', color: '#176a21', bg: '#E8F5E9' },
  rejected: { label: 'Từ chối', color: '#b02500', bg: '#FFEBEE' },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actioning, setActioning] = useState(null);
  const { setPendingCount } = useAdminStore();

  useEffect(() => {
    api.admin.submissions.list({ status: 'all' }).then(res => {
      const data = res.data;
      if (data.error) return;
      setSubmissions(data.submissions || []);
      setPendingCount((data.submissions || []).filter(s => s.status === 'pending').length);
      setLoading(false);
    });
  }, []);

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);

  const handleReview = async (id, status) => {
    setActioning(id);
    const res = await api.admin.submissions.review(id, { action: status, collectionIds: ['col-1'] });
    const data = res.data;
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: data.status, reviewedBy: data.reviewedBy, reviewedAt: data.reviewedAt } : s));
    if (status !== 'pending') {
      setPendingCount(prev => Math.max(0, prev - 1));
    }
    setActioning(null);
  };

  return (
    <AdminLayout>
      <div className={styles.page}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            { key: 'pending', label: 'Chờ duyệt' },
            { key: 'approved', label: 'Đã duyệt' },
            { key: 'rejected', label: 'Từ chối' },
            { key: 'all', label: 'Tất cả' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${filter === tab.key ? styles.tabActive : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className={styles.tabBadge}>
                  {submissions.filter(s => s.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className={styles.list}>
          {loading ? (
            <div className={styles.empty}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-outline-variant)' }}>progress_activity</span>
              <p>Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-outline-variant)' }}>inbox</span>
              <p>Không có đề xuất nào</p>
            </div>
          ) : filtered.map(sub => {
            const cfg = STATUS_CONFIG[sub.status];
            return (
              <div key={sub.id} className={styles.card}>
                {sub.photos?.[0] && (
                  <img className={styles.cardImg} src={sub.photos[0].url} alt={sub.restaurantName} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3 className={styles.cardTitle}>{sub.restaurantName}</h3>
                      <p className={styles.cardAddress}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {sub.address}
                      </p>
                    </div>
                    <span
                      className={styles.statusChip}
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    {sub.priceDisplay && (
                      <span className={styles.metaChip}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        {sub.priceDisplay}
                      </span>
                    )}
                    {sub.notes && (
                      <span className={styles.metaChip}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
                        </svg>
                        {sub.notes}
                      </span>
                    )}
                    <span className={styles.timeAgo}>{timeAgo(sub.createdAt)}</span>
                  </div>

                  {sub.status === 'pending' && (
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => handleReview(sub.id, 'approved')}
                        disabled={actioning === sub.id}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Duyệt
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleReview(sub.id, 'rejected')}
                        disabled={actioning === sub.id}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
