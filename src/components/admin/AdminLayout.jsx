import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '@/store/adminStore';
import { useAuthStore } from '@/store/authStore';
import styles from './AdminLayout.module.css';

const TABS = [
  { key: 'submissions', label: 'Duyệt đề xuất', path: '/admin/submissions' },
  { key: 'dishes', label: 'Quản lý món ăn', path: '/admin/dishes' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { pendingCount, loadPendingCount } = useAdminStore();

  const activeTab = TABS.find(t => location.pathname.startsWith(t.path))?.key ?? 'submissions';

  useEffect(() => {
    loadPendingCount();
  }, []);

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        {/* Segmented control */}
        <div className={styles.segmented}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`${styles.segment} ${activeTab === tab.key ? styles.segmentActive : ''}`}
              onClick={() => navigate(tab.path)}
            >
              {tab.label}
              {tab.key === 'submissions' && pendingCount > 0 && (
                <span className={`${styles.badge} ${activeTab === tab.key ? styles.badgeActive : ''}`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <button className={styles.logoutBtn} onClick={logout} title="Đăng xuất">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
