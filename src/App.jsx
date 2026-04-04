import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { SessionProvider } from '@/contexts/SessionContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAuthStore } from '@/store/authStore';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CreateSessionPage from '@/pages/CreateSessionPage';
import LobbyPage from '@/pages/LobbyPage';
import JoinPage from '@/pages/JoinPage';
import WaitingRoomPage from '@/pages/WaitingRoomPage';
import VotingPage from '@/pages/VotingPage';
import VotingWaitPage from '@/pages/VotingWaitPage';
import ResultsPage from '@/pages/ResultsPage';
import BoomPage from '@/pages/BoomPage';
import DonePage from '@/pages/DonePage';
import CrowdsourcePage from '@/pages/CrowdsourcePage';
import ProfilePage from '@/pages/ProfilePage';
import SubmissionsPage from '@/pages/admin/SubmissionsPage';
import DishManagementPage from '@/pages/admin/DishManagementPage';

function RequireAuth({ children }) {
  const isAuth = useAuthStore((s) => !!s.token);
  if (!isAuth) return <Navigate to="/login" />;
  return children;
}

function RequireAdmin({ children }) {
  const isAuth = useAuthStore((s) => !!s.token);
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  if (!isAuth) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/create" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#9c3f00',
              colorSuccess: '#176a21',
              colorError: '#b02500',
              colorWarning: '#c47d00',
              colorInfo: '#4953ac',
              borderRadius: 16,
              fontFamily: "'Inter', sans-serif",
            },
            components: {
              Button: { controlHeight: 56, borderRadius: 28 },
              Input: { controlHeight: 56 },
              Modal: { borderRadius: 28 },
              message: { top: 80 },
            },
          }}
        >
          <SessionProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/join" element={<Navigate to="/" replace />} />
              <Route path="/join/:pin" element={<JoinPage />} />
              <Route path="/suggest" element={<CrowdsourcePage />} />
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/create" element={<CreateSessionPage />} />
              <Route path="/lobby/:pin" element={<RequireAuth><LobbyPage /></RequireAuth>} />
              <Route path="/waiting/:pin" element={<WaitingRoomPage />} />
              <Route path="/vote/:pin" element={<VotingPage />} />
              <Route path="/voting-wait/:pin" element={<VotingWaitPage />} />
              <Route path="/results/:pin" element={<ResultsPage />} />
              <Route path="/boom/:pin" element={<BoomPage />} />
              <Route path="/done/:pin" element={<DonePage />} />
              <Route path="/admin/submissions" element={<RequireAdmin><SubmissionsPage /></RequireAdmin>} />
              <Route path="/admin/dishes" element={<RequireAdmin><DishManagementPage /></RequireAdmin>} />
            </Routes>
          </SessionProvider>
        </ConfigProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
