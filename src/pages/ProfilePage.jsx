import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Edit2, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-background min-h-screen pb-32 font-body text-on-surface antialiased">
      <Header title="LunchSync Profile" />

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Profile Header Section (Identity) */}
        <section className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-on-primary text-5xl font-bold border-4 border-white shadow-[0_8px_24px_rgba(44,47,48,0.06)]">
              {getInitial(user?.fullName)}
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(44,47,48,0.06)] border-2 border-white active:scale-95 transition-transform">
              <Edit2 className="text-[20px]" />
            </button>
          </div>

          <h2 className="font-headline text-3xl text-on-background font-bold tracking-tight mb-1 text-center">
            {user?.fullName || 'Người dùng'}
          </h2>
          <p className="font-body text-on-surface-variant mb-6">
            {user?.email || 'user@lunchsync.com'}
          </p>

          <div className="mt-12 w-full max-w-xs mx-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-4 bg-error-container/10 text-error rounded-xl font-bold hover:bg-error-container/20 transition-colors border border-error/20 active:scale-[0.98]"
            >
              <LogOut className="text-lg" />
              Đăng xuất
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
