import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, loginWithTokens, setUser, logout, restoreSession } = useAuthStore();

  const handleLogout = useCallback(() => {
    authApi.logout().catch(() => {});
    logout();
    navigate('/');
  }, [logout, navigate]);

  return {
    user,
    accessToken,
    isLoggedIn: isAuthenticated(),
    loginWithTokens,
    setUser,
    logout: handleLogout,
    restoreSession,
  };
}
