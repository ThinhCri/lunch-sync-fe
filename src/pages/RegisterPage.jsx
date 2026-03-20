import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { mockHandlers } from '@/api/mock';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Mật khẩu không khớp';
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
      const res = await mockHandlers.register(email, password);
      if (res.error) {
        setGeneralError(res.error.message);
        return;
      }
      login(res.token, res.user);
      const destination = res.user?.role === 'admin' ? '/admin/submissions' : '/create';
      navigate(destination, { replace: true });
    } catch {
      setGeneralError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left visual */}
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
            <h2 className={styles.title}>Tạo tài khoản mới</h2>
            <p className={styles.subtitle}>Tham gia cùng LunchSync ngay hôm nay.</p>
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
              <label className="field-label" htmlFor="email">Email</label>
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
              <label className="field-label" htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                className={`text-field ${errors.password ? styles.inputError : ''}`}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                autoComplete="new-password"
                disabled={loading}
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className={styles.fieldGroup}>
              <label className="field-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                type="password"
                className={`text-field ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                autoComplete="new-password"
                disabled={loading}
              />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
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
                  Tạo tài khoản
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={styles.footerLink}>
            Đã có tài khoản?{' '}
            <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>

      <div className={styles.accentTop} />
      <div className={styles.accentBottom} />
    </div>
  );
}
