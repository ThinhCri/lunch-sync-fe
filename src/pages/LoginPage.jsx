import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockHandlers } from '@/api/mock';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Email không hợp lệ';
    }
    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setGeneralError('');
    setLoading(true);

    try {
      // Optimistic redirect
      navigate('/create');
      const res = await mockHandlers.login(email, password);
      if (res.error) {
        setGeneralError(res.error.message);
        navigate('/login');
        return;
      }
      login(res.token, res.user);
    } catch {
      setGeneralError('Đăng nhập thất bại. Vui lòng thử lại.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left visual — desktop only */}
      <div className={styles.visualSide}>
        <div className={styles.visualInner}>
          <div className={styles.visualHeader}>
            <h1 className={styles.brand}>LunchSync</h1>
            <p className={styles.brandSub}>Connect. Eat. Sync.</p>
          </div>
          <div className={styles.heroWrap}>
            <div className={styles.heroGlow} />
            <img
              className={styles.heroImg}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZskAD2t36S0uEXb6BapUqhmGdkHs2aSuQ0XD4JwPMlNAGsJWYqFjABBlAPIV-C6ciZNtiZEBZysKWr-0T1cNm07vpd1bEN-rzsBZISqThW8hU5r7SNlHYtNeK8z30neoC8_ScPeU1rWTDpFvUMQXuKkD4oIwtRX4fOTSLkR1TXhiNaDdeoItZ22U_eEWMipNqVOetgHeai86ZkuDIJLQEJnEAcHiex0dL_FuFJK8wutAdCfSv0BI_iqpps1JWK-iicnbB_7TVV0U"
              alt="Office workers sharing lunch"
            />
            <div className={`${styles.badge} glass-card`}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: 28 }}>restaurant</span>
              <p className={styles.badgeText}>Hơn 500+ đồng nghiệp tại Quận 1 đang chờ bạn!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className={styles.formSide}>
        <div className={styles.formWrap}>
          {/* Mobile logo */}
          <div className={styles.mobileLogo}>
            <span className={styles.mobileLogoText}>LunchSync</span>
          </div>

          <div className={styles.heading}>
            <h2 className={styles.title}>Chào mừng trở lại</h2>
            <p className={styles.subtitle}>Kết nối bữa trưa cùng đồng nghiệp ngay.</p>
          </div>

          {generalError && (
            <div className={styles.errorBanner}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {generalError}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className="field-label" htmlFor="email">Email hoặc Tên đăng nhập</label>
              <input
                id="email"
                type="email"
                className={`text-field ${errors.email ? styles.inputError : ''}`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <div className={styles.passwordHeader}>
                <label className="field-label" htmlFor="password" style={{ marginBottom: 0 }}>Mật khẩu</label>
                <button type="button" className="btn-text">Quên mật khẩu?</button>
              </div>
              <div className={styles.passwordWrap}>
                <input
                  id="password"
                  type="password"
                  className={`text-field ${errors.password ? styles.inputError : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`btn-filled ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>
                  Đăng nhập
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={styles.footerLink}>
            Bạn mới sử dụng LunchSync?{' '}
            <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>

      {/* Background accents */}
      <div className={styles.accentTop} />
      <div className={styles.accentBottom} />
    </div>
  );
}
