import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const { token, user, isAuthenticated, login, logout, restoreSession } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return {
    token,
    user,
    isAuthenticated: isAuthenticated(),
    login,
    logout: handleLogout,
    restoreSession,
  };
}
