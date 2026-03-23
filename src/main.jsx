import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { useAuthStore } from '@/store/authStore';

useAuthStore.getState().restoreSession?.();

createRoot(document.getElementById('root')).render(<App />);
