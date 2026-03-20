import { Button } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.logoWrap}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#6C63FF" />
            <path d="M32 18c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14-6.268-14-14-14zm0 4c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z" fill="white"/>
            <path d="M32 24v8l5.657 5.657" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="32" cy="32" r="3" fill="white"/>
          </svg>
        </div>
        <h1 className={styles.appName}>LunchSync</h1>
        <p className={styles.tagline}>Giúp cả nhóm chọn bữa trưa trong 3 phút</p>
      </div>

      <div className={styles.cta}>
        <Button
          type="primary"
          size="large"
          block
          className={styles.btnPrimary}
          href={isAuthenticated ? '/create' : '/login'}
        >
          Tạo bữa trưa
        </Button>
        <Button
          size="large"
          block
          className={styles.btnSecondary}
          href="/join"
        >
          Tham gia
        </Button>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p className={styles.featureTitle}>3–8 người</p>
            <p className={styles.featureDesc}>Phù hợp nhóm văn phòng</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div>
            <p className={styles.featureTitle}>3 phút</p>
            <p className={styles.featureDesc}>Quyết định nhanh gọn</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <p className={styles.featureTitle}>Vote dễ dàng</p>
            <p className={styles.featureDesc}>Chọn A hoặc B, không phân vân</p>
          </div>
        </div>
      </div>
    </div>
  );
}
