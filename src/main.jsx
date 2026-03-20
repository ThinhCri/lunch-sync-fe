import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import App from './App.jsx';
import { useAuthStore } from '@/store/authStore';

// Restore auth session (kiểm tra token hết hạn)
useAuthStore.getState().restoreSession?.();

createRoot(document.getElementById('root')).render(<App />);
