import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/api';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    } else {
      const passwordErrors = [];
      if (password.length < 8) {
        passwordErrors.push('tối thiểu 8 ký tự');
      }
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push('ít nhất 1 hoa');
      }
      if (!/[0-9]/.test(password)) {
        passwordErrors.push('ít nhất 1 số');
      }
      if (passwordErrors.length > 0) {
        errs.password = 'Mật khẩu: ' + passwordErrors.join(', ');
      }
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
      const res = await api.auth.register({ email, password, fullName: fullName.trim() });
      const data = res.data;
      if (data.error) {
        setGeneralError(data.error.message);
        return;
      }
      navigate('/login', { replace: true, state: { returnTo: location.state?.returnTo } });
    } catch {
      setGeneralError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container relative">
      
      {/* Top Navigation Bar */}
      <Header title="LunchSync Đăng ký" />

      <main className="flex-grow flex flex-col items-center px-6 pt-28 pb-32 w-full max-w-xl mx-auto">
        {/* Header Content */}
        <div className="w-full mb-10 text-center md:text-left">
          <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-3 tracking-tight">Tham gia cùng LunchSync</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">Kết nối ẩm thực, chia sẻ trải nghiệm cùng cộng đồng sành ăn.</p>
        </div>

        {generalError && (
          <div className="w-full mb-6 px-4 py-3 bg-error-container/20 text-error rounded-lg flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
            {generalError}
          </div>
        )}

        {/* Registration Form */}
        <form className="w-full space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant ml-4">Họ và tên</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className={`material-symbols-outlined transition-colors ${errors.fullName ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>person</span>
              </div>
              <input 
                className={`w-full bg-surface-container-lowest border-none ring-1 ring-inset h-14 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/60 transition-all ${errors.fullName ? 'ring-error focus:ring-2 focus:ring-error' : 'ring-surface-container-highest focus:ring-2 focus:ring-primary'}`}
                placeholder="Nguyễn Văn A" 
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors(p => ({...p, fullName: ''})) }}
                disabled={loading}
              />
            </div>
            {errors.fullName && <p className="text-[11px] font-bold text-error ml-4 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant ml-4">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className={`material-symbols-outlined transition-colors ${errors.email ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>mail</span>
              </div>
              <input 
                className={`w-full bg-surface-container-lowest border-none ring-1 ring-inset h-14 pl-12 pr-4 rounded-full text-on-surface placeholder:text-outline/60 transition-all ${errors.email ? 'ring-error focus:ring-2 focus:ring-error' : 'ring-surface-container-highest focus:ring-2 focus:ring-primary'}`}
                placeholder="example@gmail.com" 
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-[11px] font-bold text-error ml-4 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant ml-4">Mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className={`material-symbols-outlined transition-colors ${errors.password ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>lock</span>
              </div>
              <input 
                className={`w-full bg-surface-container-lowest border-none ring-1 ring-inset h-14 pl-12 pr-12 rounded-full text-on-surface placeholder:text-outline/60 transition-all ${errors.password ? 'ring-error focus:ring-2 focus:ring-error' : 'ring-surface-container-highest focus:ring-2 focus:ring-primary'}`}
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
                disabled={loading}
              />
              <button 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors" 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.password && <p className="text-[11px] font-bold text-error ml-4 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant ml-4">Xác nhận mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className={`material-symbols-outlined transition-colors ${errors.confirmPassword ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>lock</span>
              </div>
              <input 
                className={`w-full bg-surface-container-lowest border-none ring-1 ring-inset h-14 pl-12 pr-12 rounded-full text-on-surface placeholder:text-outline/60 transition-all ${errors.confirmPassword ? 'ring-error focus:ring-2 focus:ring-error' : 'ring-surface-container-highest focus:ring-2 focus:ring-primary'}`}
                placeholder="••••••••" 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})) }}
                disabled={loading}
              />
              <button 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors" 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                <span className="material-symbols-outlined">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[11px] font-bold text-error ml-4 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold h-14 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : 'Đăng ký ngay'}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-on-surface-variant font-medium">
            Đã có tài khoản? 
            <Link className="text-primary font-bold ml-1 hover:underline underline-offset-4" to="/login" state={{ returnTo: location.state?.returnTo }}>Đăng nhập</Link>
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
