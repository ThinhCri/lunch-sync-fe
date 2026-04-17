import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

// useAuth: hook tiện ích cho auth, trả về:
//   - user: thông tin user (từ authStore)
//   - userToken: JWT từ server (từ authStore)
//   - isLoggedIn: true khi userToken != null
//   - login/logout/restoreSession: actions từ authStore
export function useAuth() {
  const navigate = useNavigate();
  const { user, userToken, isAuthenticated, login, logout, restoreSession } = useAuthStore();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return {
    user,
    userToken,
    isLoggedIn: isAuthenticated(),
    login,
    logout: handleLogout,
    restoreSession,
  };
}
