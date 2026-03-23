import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api';
import Layout from '@/components/layout/Layout';
import loginHero from '@/assets/images/login-hero.jpg';
import loginAvatar1 from '@/assets/images/login-avatar-1.jpg';
import loginAvatar2 from '@/assets/images/login-avatar-2.jpg';
import loginAvatar3 from '@/assets/images/login-avatar-3.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

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
      const res = await api.auth.login({ email, password });
      const data = res.data;
      if (data.error) {
        setGeneralError(data.error.message);
        return;
      }
      login(data.accessToken, {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      });
      const destination = data.role === 'admin' ? '/admin/submissions' : '/';
      navigate(destination, { replace: true });
    } catch {
      setGeneralError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-grow flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-[#f7f3ee] rounded-lg overflow-hidden editorial-shadow border border-[#dcc1b6]/10">

          {/* Branding / Value Prop (Left Column) */}
          <div className="relative hidden md:flex flex-col justify-center p-12 bg-[#e6e2dd]">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img
                alt="Delicious office lunch"
                className="w-full h-full object-cover"
                src={loginHero}
              />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#ffc247] text-[#715000] px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                <span>Quyết định bữa trưa chỉ trong 3 phút</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#56423a] font-headline tracking-tight leading-tight mb-6">
                Bữa trưa văn phòng<br />
                <span className="text-[#9a410f] italic">không còn là gánh nặng.</span>
              </h1>
              <p className="text-lg text-[#56423a]/80 font-medium max-w-md leading-relaxed">
                LunchSync đồng bộ sở thích của đồng nghiệp, đề xuất những quán ngon nhất gần bạn chỉ trong tích tắc.
              </p>
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img
                    className="w-10 h-10 rounded-full border-2 border-[#fdf9f4]"
                    alt="User avatar 1"
                    src={loginAvatar1}
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-[#fdf9f4]"
                    alt="User avatar 2"
                    src={loginAvatar2}
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-[#fdf9f4]"
                    alt="User avatar 3"
                    src={loginAvatar3}
                  />
                </div>
                <span className="text-sm font-semibold text-[#56423a]">+500 dân văn phòng tin dùng</span>
              </div>
            </div>
          </div>

          {/* Form Section (Right Column) */}
          <div className="p-8 md:p-16 bg-white flex flex-col justify-center">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#1c1c19] font-headline mb-2">Đăng nhập</h2>
              <p className="text-[#56423a]/70 font-medium">Chào mừng bạn quay trở lại với LunchSync.</p>
            </div>

            {generalError && (
              <div className="mb-6 px-4 py-3 bg-[#ffdad6] text-[#93000a] rounded-lg flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-sm">error</span>
                {generalError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-bold text-[#56423a] mb-2 ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#897269]">mail</span>
                  <input
                    id="email"
                    type="email"
                    className={`w-full pl-12 pr-4 py-4 rounded-lg bg-[#f7f3ee] border-none focus:ring-2 focus:ring-[#9a410f]/20 focus:bg-white transition-all placeholder:text-[#dcc1b6] outline-none ${errors.email ? 'ring-2 ring-[#ba1a1a]' : ''}`}
                    placeholder="nguyenvana@gmail.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#ba1a1a] mt-1 ml-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-sm font-bold text-[#56423a]" htmlFor="password">
                    Mật khẩu
                  </label>
                  <button type="button" className="text-sm font-semibold text-[#9a410f] hover:underline transition-all">
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#897269]">lock</span>
                  <input
                    id="password"
                    type="password"
                    className={`w-full pl-12 pr-4 py-4 rounded-lg bg-[#f7f3ee] border-none focus:ring-2 focus:ring-[#9a410f]/20 focus:bg-white transition-all placeholder:text-[#dcc1b6] outline-none ${errors.password ? 'ring-2 ring-[#ba1a1a]' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-[#ba1a1a] mt-1 ml-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-[#9a410f] to-[#ba5826] text-white py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span>Đăng nhập ngay</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#dcc1b6]/20 text-center">
              <p className="text-[#56423a] font-medium">
                Chưa có tài khoản?
                <Link className="text-[#9a410f] font-bold hover:underline ml-1" to="/register">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
