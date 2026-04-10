import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import JoinModal from '@/components/modals/JoinModal';
import BottomNav from '@/components/layout/BottomNav';
import { api } from '@/api';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.collections.list();
        const data = Array.isArray(res.data) ? res.data : res.data?.collections || [];
        setCollections(data);
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <Header title="LunchSync Explore" />

      <main className="pt-24 pb-56 px-4 max-w-2xl mx-auto space-y-10">
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
              placeholder="Tìm khu vực hoặc món ngon..."
              type="text"
            />
          </div>
        </section>

        {/* Discovery Feed */}
        <div className="space-y-6">
          {loading ? (
            // Skeleton Loading
            [1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-surface-container-low h-48 rounded-2xl w-full" />
            ))
          ) : collections.length > 0 ? (
            collections.map((col) => (
              <article 
                key={col.id}
                onClick={() => navigate('/create')} // Directing to create for now as specific browse is post-MVP
                className="group relative bg-surface-container-lowest p-6 rounded-2xl border border-outline/5 hover:border-primary/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-on-surface-variant text-sm line-clamp-2">
                      {col.description}
                    </p>
                  </div>
                  <div className="bg-primary-container/10 px-3 py-1 rounded-full text-primary font-bold text-xs ring-1 ring-primary/20">
                    {col.restaurantCount} quán
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-outline font-medium pt-2 border-t border-outline/5">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Bán kính {col.coverageRadiusMeters}m
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Hoạt động
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-dashed border-outline/20">
              <span className="material-symbols-outlined text-outline/30 text-5xl mb-4">search_off</span>
              <p className="text-on-surface-variant font-medium">Không tìm thấy khu vực nào.</p>
            </div>
          )}
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
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
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
