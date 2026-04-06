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
    const activeClass = "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 scale-98";
    const inactiveClass = "text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-300";
    return `flex flex-col items-center justify-center rounded-full px-5 py-2 transition-transform duration-200 cursor-pointer ${isActive(path) ? activeClass : inactiveClass}`;
  };

  const getIconStyle = (path) => {
    return isActive(path) ? { fontVariationSettings: "'FILL' 1" } : {};
  };

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[2rem] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(44,47,48,0.06)] flex justify-around items-center px-4 pt-3 pb-8">
      <div 
        onClick={() => handleNavigation('/')}
        className={getTabClass('/')}
      >
        <span className="material-symbols-outlined" style={getIconStyle('/')}>explore</span>
        <span className="font-be-vietnam text-label-sm font-medium">Explore</span>
      </div>
      <div 
        onClick={() => handleNavigation('/create')}
        className={getTabClass('/create')}
      >
        <span className="material-symbols-outlined" style={getIconStyle('/create')}>group_work</span>
        <span className="font-be-vietnam text-label-sm font-medium">LunchSync</span>
      </div>
      <div 
        onClick={() => handleNavigation('/profile')}
        className={getTabClass('/profile')}
      >
        <span className="material-symbols-outlined" style={getIconStyle('/profile')}>person</span>
        <span className="font-be-vietnam text-label-sm font-medium">Profile</span>
      </div>
    </nav>
  );
}
