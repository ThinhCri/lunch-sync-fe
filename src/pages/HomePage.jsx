import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import JoinModal from '@/components/modals/JoinModal';
import BottomNav from '@/components/layout/BottomNav';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <Header title="LunchSync Explore" />

      <main className="pt-24 pb-32 px-4 max-w-2xl mx-auto space-y-10">
        {/* Header & Search */}
        <section className="space-y-4">
          <h2 className="font-headline text-4xl tracking-tight font-extrabold text-on-surface">
            Explore
          </h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              className="w-full bg-surface-container-lowest border-none rounded-full py-4 pl-12 pr-6 shadow-sm focus:ring-2 focus:ring-primary-container placeholder:text-outline-variant text-body-md font-medium outline-none"
              placeholder="Tìm món ngon hôm nay..."
              type="text"
            />
          </div>
        </section>

        {/* Discovery Feed */}
        <div className="space-y-12">
          {/* Restaurant Card 1 */}
          <article className="group relative bg-surface-container-lowest rounded-lg overflow-hidden transition-transform duration-300 active:scale-[0.98]">
            <div className="relative h-72 overflow-hidden">
              <img
                alt="Mediterranean Bowl"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDllzSyIfPYZUF8ZGjHa0snqJsrBH-enobY7QC6VfteK8JbANSWhtt7fgOlF7E_4xaL2Mf5qxsmc7xO6_1OTXjYp2uHTo3ej1ztYGITxTKSS2itobPy-cSsw3tWy4xmliG3bCPXDqeRrFomz1Qfln3HrjagFc3RldNUJvG99czpJ-66UjrUDXJMrAE42lFR4f6rU4o3zwKXEA26Z234_v03Rb0qLlDN0tAl52ps0zV463W3oIROICqQ9qMoz4WF-ReOxHRcqVKFsf4"
              />
              <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                <svg className="w-4 h-4 text-orange-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="font-label text-label-sm font-bold text-on-surface">4.8</span>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Bếp Nhà Lành</h3>
                <span className="px-3 py-1 bg-primary-container/10 text-primary font-label text-xs font-bold rounded-full">Dưới 40k</span>
              </div>
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                123 Lê Lợi, Quận 1
              </p>
            </div>
          </article>

          {/* Restaurant Card 2 */}
          <article className="group relative bg-surface-container-lowest rounded-lg overflow-hidden transition-transform duration-300 active:scale-[0.98]">
            <div className="relative h-72 overflow-hidden">
              <img
                alt="Vietnamese Pho"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBybUEy8PtuNXCAZL5mwono4kDd7D9lRIyLPzWyulP7wvchJ-E5XIv6f9-1EsZeJXdaBNRaHvxNudcYUZOg-rjrWvRCBdA_5yOhGCtiih6kKz2GwoKuxiuCLaTiIwm2MHRHE-Kt4lt84Ko2d9kjQ_bzrHBun7rj6y-pcMnrEJ1joNPBrf4eyN_FjovXi_55zZAGl0ZL-USeyuAQeq8az6OCT0Q53SCqK90OXlZEsBwD58kxeDaXgF-ZU2fUKqBJPzLrk_Lz5jza-Fc"
              />
              <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                <svg className="w-4 h-4 text-orange-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="font-label text-label-sm font-bold text-on-surface">4.5</span>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Phở Gia Truyền</h3>
                <span className="px-3 py-1 bg-primary-container/10 text-primary font-label text-xs font-bold rounded-full">40k - 80k</span>
              </div>
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                45 Nguyễn Huệ, Quận 1
              </p>
            </div>
          </article>

          {/* Restaurant Card 3 */}
          <article className="group relative bg-surface-container-lowest rounded-lg overflow-hidden transition-transform duration-300 active:scale-[0.98]">
            <div className="relative h-72 overflow-hidden">
              <img
                alt="Gourmet Pizza"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4l5zgg4C8bz3rkFF0JfolHVB8DuZ2JhBX71FpCW9LM9neOt_yClDyfVt5suQTZLK13rqXM8YqQX6vfR4H4KFSg6V7HkiJ1IfdWHD9lMrePi6Ev3G5SohVTDXoB9fnf1z2x8ewORxVRUtAxtQDMR8VC4XO90QGif76WhY4rRMJv623MKrYUsK8bWpyPNG-I0J2oyXbjGokF9qnJzJxlW7GRNL2SqzmhSkIJjWHeQvYVQFbT8Nb2oOA73yFyb8CCQB_Nh06EiomIYA"
              />
              <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                <svg className="w-4 h-4 text-orange-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="font-label text-label-sm font-bold text-on-surface">4.9</span>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">The Artisan Crust</h3>
                <span className="px-3 py-1 bg-primary-container/10 text-primary font-label text-xs font-bold rounded-full">Trên 100k</span>
              </div>
              <p className="text-on-surface-variant flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                88 Thảo Điền, Quận 2
              </p>
            </div>
          </article>
        </div>
      </main>

      {/* FAB: Đề xuất quán */}
      <button 
        onClick={() => {
          if (isAuthenticated()) {
            navigate('/suggest');
          } else {
            navigate('/login');
          }
        }}
        className="fixed bottom-32 right-6 z-50 bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center gap-2 px-6 py-4 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
        <span className="material-symbols-outlined">add_circle</span>
        <span className="font-label font-bold text-sm tracking-wide">Đề xuất quán</span>
      </button>

      {/* BottomNavBar */}
      <BottomNav />

      <JoinModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
}
