import { getInitials } from '@/utils/format';
import styles from './AppHeader.module.css';

export function AppHeader({ title, showBack = false, onBack, rightContent }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {showBack && (
            <button className={styles.backBtn} onClick={onBack} aria-label="Quay lại">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          )}
          <span className={styles.title}>{title || 'LunchSync'}</span>
        </div>
        {rightContent && <div className={styles.right}>{rightContent}</div>}
      </div>
    </header>
  );
}

export function ParticipantAvatar({ name, size = 40 }) {
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
}
