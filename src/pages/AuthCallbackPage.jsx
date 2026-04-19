import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="bg-background text-on-background h-[100dvh] w-full flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface-variant font-medium">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
