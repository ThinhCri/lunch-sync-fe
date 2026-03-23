import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        <div
          className="text-2xl font-bold tracking-tight text-[#8a4b31] font-['Plus_Jakarta_Sans',sans-serif] cursor-pointer"
          onClick={() => navigate('/')}
        >
          LunchSync
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/suggest')}
            className="px-6 py-2 border-2 border-[#897269] text-[#56423a] rounded-full font-bold hover:bg-[#ebe8e3] transition-all active:scale-95 duration-300"
          >
            Đề xuất quán mới
          </button>
          {isAuthenticated() ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-[#f7f3ee] rounded-full hover:bg-[#ebe8e3] transition-all"
              >
                <span className="material-symbols-outlined text-[#9a410f]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                <span className="font-medium text-[#56423a]">{user?.fullName}</span>
                <span className="material-symbols-outlined text-[#56423a] text-sm">expand_more</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-[#56423a] hover:bg-[#f7f3ee] transition-all"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-[#56423a] font-medium hover:bg-[#f7f3ee]/50 transition-all active:scale-95"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-[#9a410f] text-white rounded-full font-bold hover:bg-[#ba5826] transition-all active:scale-95"
                style={{ boxShadow: '0 20px 40px rgba(28, 28, 25, 0.06)' }}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
