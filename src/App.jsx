import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SessionProvider } from '@/providers/SessionContext';
import Toast from '@/components/common/Toast';
import { useAuthStore } from '@/store/authStore';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CreateSessionPage from '@/pages/CreateSessionPage';
import LobbyPage from '@/pages/LobbyPage';
import JoinPage from '@/pages/JoinPage';
import VotingPage from '@/pages/VotingPage';
import VotingWaitPage from '@/pages/VotingWaitPage';
import ResultsPage from '@/pages/ResultsPage';
import BoomPage from '@/pages/BoomPage';
import DonePage from '@/pages/DonePage';
import CrowdsourcePage from '@/pages/CrowdsourcePage';
import ProfilePage from '@/pages/ProfilePage';
import CollectionPage from '@/pages/CollectionPage';

function RequireAuth({ children }) {
  const isAuth = useAuthStore((s) => !!s.accessToken);
  if (!isAuth) return <Navigate to="/login" />;
  return children;
}

function RootRoute() {
  return <CreateSessionPage />;
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <SessionProvider>
          <Toast />
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/explore" element={<HomePage />} />
            <Route path="/collection/:id" element={<CollectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/join" element={<Navigate to="/" replace />} />
            <Route path="/join/:pin" element={<JoinPage />} />
            <Route path="/suggest" element={<CrowdsourcePage />} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/create" element={<CreateSessionPage />} />
            <Route path="/lobby/:pin" element={<LobbyPage />} />
            <Route path="/vote/:pin" element={<VotingPage />} />
            <Route path="/voting-wait/:pin" element={<VotingWaitPage />} />
            <Route path="/results/:pin" element={<ResultsPage />} />
            <Route path="/boom/:pin" element={<BoomPage />} />
            <Route path="/done/:pin" element={<DonePage />} />
          </Routes>
        </SessionProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
