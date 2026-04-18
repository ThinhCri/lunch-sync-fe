import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { COGNITO_CONFIG } from '@/config';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

const buildCognitoLoginUrl = () => {
  const params = new URLSearchParams({
    client_id: COGNITO_CONFIG.CLIENT_ID,
    redirect_uri: COGNITO_CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: COGNITO_CONFIG.SCOPE,
  });
  return `${COGNITO_CONFIG.DOMAIN}/login?${params.toString()}`;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) {
      const returnTo = location.state?.returnTo || '/';
      navigate(returnTo, { replace: true });
    }
  }, [accessToken, location.state, navigate]);

  const handleLogin = () => {
    if (!COGNITO_CONFIG.DOMAIN || !COGNITO_CONFIG.CLIENT_ID) {
      console.error('COGNITO_CONFIG missing:', COGNITO_CONFIG);
      alert('Cognito chưa được config. Vui lòng kiểm tra .env file.');
      return;
    }
    const returnTo = location.state?.returnTo || '/';
    sessionStorage.setItem('auth_return_to', returnTo);
    window.location.href = buildCognitoLoginUrl();
  };

  return (
    <div className="bg-background text-on-background h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container relative">
      <div className="fixed top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <Header title="LunchSync" />

      <main className="flex-grow flex flex-col items-center px-4 pt-28 pb-32 relative z-10 w-full">
        <div className="w-full max-w-md mt-6 flex flex-col shrink-0">
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

          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_4px_16px_rgba(44,47,48,0.03)] border border-outline-variant/10">
            <button
              className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[0.99] active:scale-95 transition-all duration-200 flex justify-center items-center gap-3"
              onClick={handleLogin}
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M21.5 12h-3V10.5C18.5 8.5 16.5 7 14 7h-4C8 7 6 8.5 6 10.5V12H3C2.5 12 2 12.5 2 13S2.5 14 3 14h3v3c0 1.5 1 2.5 2.5 2.5h7C16.5 19.5 17.5 18.5 17.5 17V14h3c.5 0 1-.5 1-1s-.5-1-1-1zM10 10.5C10 9.7 10.7 9 11.5 9h1C13.3 9 14 9.7 14 10.5V12H10v-1.5z" fill="currentColor"/>
              </svg>
              Đăng nhập với Email
            </button>
          </div>

          <div className="text-center mt-10">
            <p className="text-on-surface-variant font-medium">Chưa có tài khoản? <button className="text-primary font-bold hover:underline ml-1" onClick={() => navigate('/register', { state: { returnTo: location.state?.returnTo } })}>Đăng ký</button></p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
