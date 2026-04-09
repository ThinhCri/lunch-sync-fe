import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const handleNavigation = (path) => {
    if (path === '/profile') {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }
    }
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/explore' || location.pathname === '/suggest';
    if (path === '/create') return location.pathname === '/create' || location.pathname.startsWith('/lobby');
    if (path === '/profile') return location.pathname === '/profile';
    return false;
  };

  const getTabClass = (path) => {
    const activeClass = "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 scale-98";
    const inactiveClass = "text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400";
    return `flex flex-col items-center justify-center rounded-full px-5 py-2 transition-transform duration-200 cursor-pointer ${isActive(path) ? activeClass : inactiveClass}`;
  };



  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[2rem] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(44,47,48,0.06)] flex justify-around items-center px-4 pt-3 pb-8">
      <div 
        onClick={() => handleNavigation('/')}
        className={getTabClass('/')}
      >
        <svg 
          className="w-6 h-6 mb-0.5" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/>
        </svg>
        <span className="font-be-vietnam text-label-sm font-medium">Explore</span>
      </div>
      <div 
        onClick={() => handleNavigation('/create')}
        className={getTabClass('/create')}
      >
        <svg 
          className="w-6 h-6 mb-0.5" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span className="font-be-vietnam text-label-sm font-medium">LunchSync</span>
      </div>
      <div 
        onClick={() => handleNavigation('/profile')}
        className={getTabClass('/profile')}
      >
        <svg 
          className="w-6 h-6 mb-0.5" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span className="font-be-vietnam text-label-sm font-medium">Profile</span>
      </div>
    </nav>
  );
}
