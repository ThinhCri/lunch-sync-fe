import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      const res = await api.auth.login({ email, password });
      const data = res.data;
      login(data.accessToken, {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      });
      const destination = location.state?.returnTo || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Decorative Elements */}
      <div className="fixed top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <Header title="LunchSync Login" />

      <main className="flex-grow flex flex-col items-center px-4 pt-28 pb-32 relative z-10 w-full">
        <div className="w-full max-w-md mt-6 flex flex-col shrink-0">
          {/* Hero Aesthetic Section */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl"></div>
              <img
                alt="Appetizing healthy salad bowl"
                className="relative w-24 h-24 rounded-full object-cover border-4 border-surface-container-lowest shadow-[0_8px_24px_rgba(44,47,48,0.06)]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5w4bIGcCVNEeYO2k_6bA_4h018IxYIhvl0YUGLxX_RZ0F4Td41tdLHY8AYkWY2mtgcRrp_o8mHKLTgxiO5ruGeSHu-t9GxF7ROJGtY6MwDeHsMeMzNcFEYRRAiuqwCg6iH9wVpxlRSJrJz7P9vUFPVT59bxT9aUmWO9ehV6aPv1uftYVErK76Tc6mf4ql3sI1EW-n4JkKGthHuukXtan6x-3-BBrbA_xG9hKS31sHElV40CAwi4J2Q0fUT2ZvuRN7-utBXlOIsoM"
              />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Sẵn sàng cho bữa trưa?</h1>
            <p className="text-on-surface-variant text-sm font-medium">Kết nối với đồng nghiệp và tìm những địa điểm ăn uống tốt nhất hôm nay.</p>
          </div>

          {/* Login Form */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_4px_16px_rgba(44,47,48,0.03)] border border-outline-variant/10">
            {generalError && (
              <div className="mb-6 px-4 py-3 bg-error-container/20 text-error rounded-lg flex items-center gap-2 text-sm font-medium">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {generalError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant ml-2" htmlFor="email">Địa chỉ Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    className={`w-full pl-12 pr-4 py-4 rounded-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/60 transition-all font-medium ${errors.email ? 'ring-2 ring-error' : ''}`}
                    id="email"
                    placeholder="alex@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-xs text-error mt-1 ml-2 font-bold">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="password">Mật khẩu</label>
                </div>
                <div className="relative group">
                  <input
                    className={`w-full pl-6 pr-12 py-4 rounded-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/60 transition-all font-medium [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${errors.password ? 'ring-2 ring-error' : ''}`}
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })) }}
                    disabled={loading}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    {errors.password && <p className="text-xs text-error mt-1 ml-2 font-bold">{errors.password}</p>}
                  </div>
                  <a className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity mt-1 whitespace-nowrap" href="#">Quên mật khẩu?</a>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full py-4 mt-2 rounded-full bg-primary text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[0.99] active:scale-95 transition-all duration-200 flex justify-center items-center gap-2 opacity-100 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Đăng nhập'}
              </button>
            </form>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-10">
            <p className="text-on-surface-variant font-medium">Chưa có tài khoản? <Link className="text-primary font-bold hover:underline ml-1" to="/register" state={{ returnTo: location.state?.returnTo }}>Đăng ký</Link></p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
