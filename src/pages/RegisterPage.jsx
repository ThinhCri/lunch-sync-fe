import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (accessToken) {
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo, { replace: true });
    }
  }, [accessToken, location.state, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(email.trim(), password, fullName.trim());
      loginWithTokens(res.data);
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo, { replace: true });
    } catch (err) {
      const msg = err?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      if (msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('already')) {
        setError('Email này đã được sử dụng.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container relative">
      <div className="fixed top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <Header title="LunchSync" />

      <main className="flex-grow flex flex-col items-center px-6 pt-28 pb-32 w-full max-w-xl mx-auto">
        <div className="w-full mb-10 text-center md:text-left">
          <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-3 tracking-tight">Tạo tài khoản</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">Kết nối ẩm thực, chia sẻ trải nghiệm cùng cộng đồng sành ăn.</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_4px_16px_rgba(44,47,48,0.03)] border border-outline-variant/10 w-full">
          {error && (
            <div className="mb-5 px-4 py-3 bg-error-container text-error rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="fullName">
                Họ tên
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyen Van A"
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface text-base placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface text-base placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-outline bg-surface text-on-surface text-base placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1 hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="confirmPassword">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface text-base placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[0.99] active:scale-95 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng ký...
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" state={{ returnTo: location.state?.returnTo }} className="text-primary font-bold hover:underline underline-offset-4">
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
