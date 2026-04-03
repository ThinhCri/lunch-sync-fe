import { useState, useEffect } from 'react';
import { api } from '@/api';
import { useAdminStore } from '@/store/adminStore';
import AdminLayout from '@/components/admin/AdminLayout';
import styles from './SubmissionsPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, faInbox, faLocationDot, faMoneyBill, 
  faNoteSticky, faCheck, faXmark 
} from '@fortawesome/free-solid-svg-icons';

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
  }, [setPendingCount]);

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
              <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: 48, color: 'var(--color-outline-variant)' }} />
              <p>Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <FontAwesomeIcon icon={faInbox} style={{ fontSize: 48, color: 'var(--color-outline-variant)' }} />
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
                        <FontAwesomeIcon icon={faLocationDot} style={{ width: 12, marginRight: 4 }} />
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
                        <FontAwesomeIcon icon={faMoneyBill} style={{ width: 12, marginRight: 4 }} />
                        {sub.priceDisplay}
                      </span>
                    )}
                    {sub.notes && (
                      <span className={styles.metaChip}>
                        <FontAwesomeIcon icon={faNoteSticky} style={{ width: 12, marginRight: 4 }} />
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
                        <FontAwesomeIcon icon={faCheck} style={{ width: 16, marginRight: 4, strokeWidth: 2 }} />
                        Duyệt
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleReview(sub.id, 'rejected')}
                        disabled={actioning === sub.id}
                      >
                        <FontAwesomeIcon icon={faXmark} style={{ width: 16, marginRight: 4, strokeWidth: 2 }} />
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
