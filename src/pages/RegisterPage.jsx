import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api';
import Layout from '@/components/layout/Layout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = 'Vui lòng nhập họ tên';
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Họ tên tối thiểu 2 ký tự';
    }
    if (!email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Email không hợp lệ';
    }
    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 8) {
      errs.password = 'Mật khẩu tối thiểu 8 ký tự';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Mật khẩu không khớp';
    }
    if (!termsAccepted) {
      errs.terms = 'Bạn cần đồng ý với điều khoản';
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
      const res = await api.auth.register({ email, password, fullName: fullName.trim() });
      const data = res.data;
      if (data.error) {
        setGeneralError(data.error.message);
        return;
      }
      navigate('/login', { replace: true });
    } catch {
      setGeneralError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6 py-16">

        {/* ── Left: Value Proposition ── */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffc247] text-[#715000] rounded-full text-sm font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            <span>Quyết định bữa trưa chỉ trong 3 phút</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1c1c19] leading-tight tracking-tight">
            Nâng tầm bữa trưa<br />
            <span className="text-[#9a410f] italic">văn phòng của bạn.</span>
          </h1>

          <p className="text-xl text-[#56423a] max-w-md leading-relaxed">
            Đừng lãng phí thời gian quý báu để suy nghĩ "Trưa nay ăn gì?". Hãy để LunchSync kết nối bạn với những quán ngon nhất quanh công ty.
          </p>

          {/* Testimonial image */}
          <div className="relative overflow-hidden rounded-lg aspect-video bg-[#ebe8e3] group">
            <img
              alt="Colleagues having lunch"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeAh0AJwJi7DshkaJXubij29KOjLY4qXg1945W9R04uCQ-NhiPxaXU0g-uc3ffsed4PmbX9JtIuQ6jnZ8V-3fp5i2ccrDHvN20KoUI660v3UemF9U3GVHeHzNgSy4XlxKG3ok_oujp-G4MWw29IRFJt1CMN-HylXiVV9cU0baqIlQrLOtGe9rNUuYCzx1-3XSswV8AcYE5nwp4-DrS_xMbTbNOekkotxD_PnYye1M0DtUmAK592juIADm5psKaoiDyhPyMyZBFcKAW"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c19]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                <img
                  alt="Minh Anh avatar"
                  className="object-cover w-full h-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeAh0AJwJi7DshkaJXubij29KOjLY4qXg1945W9R04uCQ-NhiPxaXU0g-uc3ffsed4PmbX9JtIuQ6jnZ8V-3fp5i2ccrDHvN20KoUI660v3UemF9U3GVHeHzNgSy4XlxKG3ok_oujp-G4MWw29IRFJt1CMN-HylXiVV9cU0baqIlQrLOtGe9rNUuYCzx1-3XSswV8AcYE5nwp4-DrS_xMbTbNOekkotxD_PnYye1M0DtUmAK592juIADm5psKaoiDyhPyMyZBFcKAW"
                />
              </div>
              <div className="text-white">
                <p className="text-sm font-bold">Minh Anh, Tech Hub</p>
                <p className="text-xs opacity-80">"LunchSync giúp tôi tiết kiệm 20p mỗi ngày."</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Registration Form ── */}
        <div className="relative">
          {/* Decorative blob */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#ffb599]/30 rounded-full blur-3xl -z-10" />

          <div className="bg-white p-8 md:p-12 rounded-xl shadow-[0px_20px_40px_rgba(28,28,25,0.06)] border border-[#dcc1b6]/20">

            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-[#1c1c19] mb-2">Tham gia cộng đồng</h2>
              <p className="text-[#56423a]">Quyết định bữa trưa chỉ trong 3 phút và tận hưởng bữa ăn chất lượng cùng đồng nghiệp.</p>
            </div>

            {generalError && (
              <div className="mb-6 px-4 py-3 bg-[#ffdad6] text-[#93000a] rounded-lg flex items-center gap-2 text-sm font-medium">
                <span className="material-symbols-outlined text-sm">error</span>
                {generalError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Họ và tên */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#56423a] ml-2" htmlFor="fullName">
                  Họ và tên
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#897269]">person</span>
                  <input
                    id="fullName"
                    type="text"
                    className={`w-full pl-12 pr-4 py-4 bg-[#f7f3ee] border-none rounded-md focus:ring-2 focus:ring-[#ffb599] focus:bg-white transition-all duration-300 outline-none ${errors.fullName ? 'ring-2 ring-[#ba1a1a]' : ''}`}
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }}
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
                {errors.fullName && <p className="text-xs text-[#ba1a1a] ml-2">{errors.fullName}</p>}
              </div>

              {/* Email công ty */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#56423a] ml-2" htmlFor="email">
                  Email công ty
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#897269]">mail</span>
                  <input
                    id="email"
                    type="email"
                    className={`w-full pl-12 pr-4 py-4 bg-[#f7f3ee] border-none rounded-md focus:ring-2 focus:ring-[#ffb599] focus:bg-white transition-all duration-300 outline-none ${errors.email ? 'ring-2 ring-[#ba1a1a]' : ''}`}
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-xs text-[#ba1a1a] ml-2">{errors.email}</p>}
              </div>

              {/* Mật khẩu + Xác nhận — 2 cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#56423a] ml-2" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#897269]">lock</span>
                    <input
                      id="password"
                      type="password"
                      className={`w-full pl-12 pr-4 py-4 bg-[#f7f3ee] border-none rounded-md focus:ring-2 focus:ring-[#ffb599] focus:bg-white transition-all duration-300 outline-none ${errors.password ? 'ring-2 ring-[#ba1a1a]' : ''}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-[#ba1a1a] ml-2">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#56423a] ml-2" htmlFor="confirmPassword">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#897269]">verified_user</span>
                    <input
                      id="confirmPassword"
                      type="password"
                      className={`w-full pl-12 pr-4 py-4 bg-[#f7f3ee] border-none rounded-md focus:ring-2 focus:ring-[#ffb599] focus:bg-white transition-all duration-300 outline-none ${errors.confirmPassword ? 'ring-2 ring-[#ba1a1a]' : ''}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                      autoComplete="new-password"
                      disabled={loading}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-[#ba1a1a] ml-2">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 px-2 pt-2">
                <input
                  className="mt-1 w-5 h-5 rounded border-[#dcc1b6] text-[#9a410f] focus:ring-[#9a410f]/30 accent-[#9a410f]"
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => { setTermsAccepted(e.target.checked); setErrors((p) => ({ ...p, terms: '' })); }}
                  disabled={loading}
                />
                <label className="text-sm text-[#56423a] leading-snug" htmlFor="terms">
                  Tôi đồng ý với <a className="text-[#9a410f] font-semibold hover:underline" href="#">Điều khoản sử dụng</a> và <a className="text-[#9a410f] font-semibold hover:underline" href="#">Chính sách bảo mật</a> của LunchSync.
                </label>
              </div>
              {errors.terms && <p className="text-xs text-[#ba1a1a] ml-2">{errors.terms}</p>}

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 px-8 bg-gradient-to-br from-[#9a410f] to-[#ba5826] text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex justify-center items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    Tạo tài khoản
                    <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#dcc1b6]/10 text-center">
              <p className="text-[#56423a]">
                Đã có tài khoản?{' '}
                <Link className="text-[#7c5800] font-bold hover:underline" to="/login">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
