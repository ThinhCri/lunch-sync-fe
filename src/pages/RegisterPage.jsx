import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { COGNITO_CONFIG } from '@/config';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';

const buildCognitoSignupUrl = () => {
  const params = new URLSearchParams({
    client_id: COGNITO_CONFIG.CLIENT_ID,
    redirect_uri: COGNITO_CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: COGNITO_CONFIG.SCOPE,
  });
  return `${COGNITO_CONFIG.DOMAIN}/signup?${params.toString()}`;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo, { replace: true });
    }
  }, [accessToken, location.state, navigate]);

  const handleRegister = () => {
    if (!COGNITO_CONFIG.DOMAIN || !COGNITO_CONFIG.CLIENT_ID) {
      console.error('COGNITO_CONFIG missing:', COGNITO_CONFIG);
      alert('Cognito chưa được config. Vui lòng kiểm tra .env file.');
      return;
    }
    const returnTo = location.state?.returnTo || '/';
    sessionStorage.setItem('auth_return_to', returnTo);
    window.location.href = buildCognitoSignupUrl();
  };

  return (
    <div className="bg-surface text-on-surface h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container relative">
      <Header title="LunchSync" />

      <main className="flex-grow flex flex-col items-center px-6 pt-28 pb-32 w-full max-w-xl mx-auto">
        <div className="w-full mb-10 text-center md:text-left">
          <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-3 tracking-tight">Join LunchSync</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">Kết nối ẩm thực, chia sẻ trải nghiệm cùng cộng đồng sành ăn.</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_4px_16px_rgba(44,47,48,0.03)] border border-outline-variant/10 w-full">
          <button
            className="w-full bg-primary text-on-primary font-bold h-14 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-3"
            onClick={handleRegister}
            type="button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor"/>
            </svg>
            Đăng ký với Email
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant font-medium">
            Đã có tài khoản?
            <button className="text-primary font-bold ml-1 hover:underline underline-offset-4" onClick={() => navigate('/login', { state: { returnTo: location.state?.returnTo } })}>Đăng nhập</button>
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
