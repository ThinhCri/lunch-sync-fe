import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, loginWithTokens, logout, restoreSession } = useAuthStore();

  const handleLogout = useCallback(() => {
    const refreshToken = useAuthStore.getState().refreshToken;
    authApi.revoke(refreshToken).catch(() => {});
    logout();
    navigate('/');
  }, [logout, navigate]);

  return {
    user,
    accessToken,
    isLoggedIn: isAuthenticated(),
    loginWithTokens,
    logout: handleLogout,
    restoreSession,
  };
}
