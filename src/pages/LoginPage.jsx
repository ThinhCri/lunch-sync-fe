import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      const destination = data.role === 'admin' ? '/admin/submissions' : '/create';
      navigate(destination, { replace: true });
    } catch {
      setGeneralError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf9f4] font-body text-[#1c1c19] flex flex-col">

      {/* ── TopAppBar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold tracking-tight text-[#8a4b31] font-['Plus_Jakarta_Sans',sans-serif]">
            LunchSync
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/suggest')}
              className="px-6 py-2 border-2 border-[#897269] text-[#56423a] rounded-full font-bold hover:bg-[#ebe8e3] transition-all active:scale-95 duration-300"
            >
              Đề xuất quán mới
            </button>
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f7f3ee] rounded-full hover:bg-[#ebe8e3] transition-all"
                >
                  <span className="material-symbols-outlined text-[#9a410f]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                  <span className="font-medium text-[#56423a]">{user?.fullName}</span>
                  <span className="material-symbols-outlined text-[#56423a] text-sm">expand_more</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[#56423a] hover:bg-[#f7f3ee] transition-all"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-[#56423a] font-medium hover:bg-[#f7f3ee]/50 transition-all active:scale-95"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-[#9a410f] text-white rounded-full font-bold hover:bg-[#ba5826] transition-all active:scale-95"
                  style={{ boxShadow: '0 20px 40px rgba(28, 28, 25, 0.06)' }}
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-grow pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-[#f7f3ee] rounded-lg overflow-hidden editorial-shadow border border-[#dcc1b6]/10">

          {/* Branding / Value Prop (Left Column) */}
          <div className="relative hidden md:flex flex-col justify-center p-12 bg-[#e6e2dd]">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img
                alt="Delicious office lunch"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdHi4Jhonq30MssGJDdhkLSgqVslVX22pXJCb9jtCto6BY7TacgawfomtzuPF1hemFtIwFObre1946hgWuRM2IB93Qg0ocIMC5AW8_8Wiiv0IbgMtU8waUpdQwMtYI-wF29ppnx7z-qv82rrTJ2QaO9eNh8mpd-kbpsVma9v4VdD8ZJPMg1dj04IutuIRlzY67pj9Z2RQIGgpZAI0vC6Wu_uXSaWIFQRF6G8RUdLQQJelIbihBIvzgSSpm7s1NNsJT0mw1bPH5Nl0f"
              />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#ffc247] text-[#715000] px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                <span>Quyết định trong 3 phút</span>
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
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIOo_UhsF8OVkyWoMpJv2NguT_eVdRhHMM2JO5NdC6qlN046fnKJSCEZp5s5kbWERhaON10jOfmc3eN_Zok0uUST9nawLYXkEgRvC-wWWAyfC4ADOK6HSDhGgqiOc0_DFeKvAmGNNis-n2Nc_b5kZOpgsGaxL242ZNJTpu4g2rw7DsyhFBsyUFsKvgeZVByi53hNSVVo4dd5aygwNVGgZeMOjy3O4UGwIc3RdwjlIo4ElJYTQP9N86rkJC1mIhwEmmRgCpTbnfgbg2"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-[#fdf9f4]"
                    alt="User avatar 2"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRppqcgFT1pmc1MNAyFBypMRNm0JouRUd261JElrnacYxVupLvPl0NwNBXC6tXBhFYSWgMDaFvAlLcJ-_vHTYN8lFeJxcL-R9CQpaTHePTdk1JDPALIQnXYmI0CU8zTtY3nNkIJP1TsHRbca7RFJeEdYABDK8cl5zkBdzlkOhnmmfr8Ouwz9F4HjqSgen3FAWD38EXEOEwoV_BQaZyEcoivqC8TO6XTc1Xaorj3Hi6zTEXhUPTh2o80yX0Qby_XYVN2ulx_mtY46jv"
                  />
                  <img
                    className="w-10 h-10 rounded-full border-2 border-[#fdf9f4]"
                    alt="User avatar 3"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpeiR7QCISlWe2wNylxN_Pk4McOYi4Mu9dyYRUFHcdfE9_IKBdnUI_NGuFXekWETEPUhpG_NrWsZVzA5bR9UtfW_9kENgiYnel2Q1cGS5pQEzsAAYm98i4nyVn1fq9YbA55XhstF9BhyQ_ufScS5NCvq6q9_MqWpUt12l0mbxWWxDecBGI5i81VnJEhJJEe87LId0LYjbfFGrpTGgXEmpzDEy-UT-DTng8iPR9C0DMjYpZ2msNl0MYAqpXhYOTq5l_vfDu2XM1qZMn"
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
              {/* Email */}
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
                    placeholder="ten@congty.com"
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

              {/* Password */}
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

              {/* Remember */}
              <div className="flex items-center gap-3 py-2">
                <input
                  className="w-5 h-5 rounded border-[#dcc1b6] text-[#9a410f] focus:ring-[#9a410f]/30 accent-[#9a410f]"
                  id="remember"
                  type="checkbox"
                />
                <label className="text-sm font-medium text-[#56423a]" htmlFor="remember">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit */}
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
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#f7f3ee]">
        <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-lg font-semibold text-[#56423a] font-['Plus_Jakarta_Sans',sans-serif]">LunchSync</div>
            <p className="text-sm text-[#56423a]">© 2024 LunchSync Editorial. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#" className="text-sm font-medium text-[#56423a] hover:text-[#9a410f] transition-all">Chính sách bảo mật</a>
            <a href="#" className="text-sm font-medium text-[#56423a] hover:text-[#9a410f] transition-all">Điều khoản dịch vụ</a>
            <a href="#" className="text-sm font-medium text-[#56423a] hover:text-[#9a410f] transition-all">Hỗ trợ khách hàng</a>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-[#9a410f] cursor-pointer">social_leaderboard</span>
            <span className="material-symbols-outlined text-[#9a410f] cursor-pointer">language</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
