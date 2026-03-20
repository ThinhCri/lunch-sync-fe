import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { SessionProvider } from '@/contexts/SessionContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAuthStore } from '@/store/authStore';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CreateSessionPage from '@/pages/CreateSessionPage';
import LobbyPage from '@/pages/LobbyPage';
import JoinPage from '@/pages/JoinPage';
import WaitingRoomPage from '@/pages/WaitingRoomPage';

function RequireAuth({ children }) {
  const isAuth = useAuthStore((s) => !!s.token);
  if (!isAuth) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#6C63FF',
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
            },
            components: {
              Button: { controlHeight: 48 },
              Input: { controlHeight: 48 },
            },
          }}
        >
          <SessionProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/join/:pin" element={<JoinPage />} />

              <Route path="/create" element={<RequireAuth><CreateSessionPage /></RequireAuth>} />
              <Route path="/lobby/:pin" element={<RequireAuth><LobbyPage /></RequireAuth>} />
              <Route path="/waiting/:pin" element={<WaitingRoomPage />} />
            </Routes>
          </SessionProvider>
        </ConfigProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
