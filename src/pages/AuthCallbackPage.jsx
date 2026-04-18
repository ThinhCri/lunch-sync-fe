import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      setError(errorDescription || 'Đăng nhập thất bại. Vui lòng thử lại.');
      return;
    }

    if (!code) {
      setError('Không nhận được mã xác thực. Vui lòng thử lại.');
      return;
    }

    authApi
      .callback(code)
      .then((res) => {
        loginWithTokens(res.data);
        const returnTo = sessionStorage.getItem('auth_return_to') || '/';
        sessionStorage.removeItem('auth_return_to');
        navigate(returnTo, { replace: true });
      })
      .catch(() => {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      });
  }, [searchParams, loginWithTokens, navigate]);

  return (
    <div className="bg-background text-on-background h-[100dvh] w-full flex flex-col items-center justify-center px-4">
      {error ? (
        <div className="text-center">
          <p className="text-error font-semibold mb-4">{error}</p>
          <button
            className="px-6 py-3 bg-primary text-on-primary font-bold rounded-full"
            onClick={() => navigate('/login', { replace: true })}
          >
            Quay lại đăng nhập
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant font-medium">Đang đăng nhập...</p>
        </div>
      )}
    </div>
  );
}
