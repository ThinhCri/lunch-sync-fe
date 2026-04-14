import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import JoinModal from '@/components/modals/JoinModal';
import BottomNav from '@/components/layout/BottomNav';
import { api } from '@/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faUtensils, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Collections state
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);

  // Restaurants state
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [errorRestaurants, setErrorRestaurants] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  // Fetch Collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.collections.list();
        const data = Array.isArray(res.data) ? res.data : res.data?.collections || [];
        setCollections(data);
        if (data.length > 0) {
          setSelectedCollectionId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch collections:', err);
      } finally {
        setLoadingCollections(false);
      }
    };
    fetchCollections();
  }, []);

  // Fetch Restaurants when collection changes
  useEffect(() => {
    if (!selectedCollectionId) return;

    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      setErrorRestaurants('');
      try {
        const res = await api.collections.getById(selectedCollectionId);
        const data = res.data;
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (data.restaurants && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        } else {
          setRestaurants([]);
        }
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to fetch collection details:', err);
        setErrorRestaurants('Không thể lấy danh sách quán trong khu vực này.');
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, [selectedCollectionId]);

  const totalPages = Math.ceil(restaurants.length / ITEMS_PER_PAGE);
  const currentRestaurants = restaurants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <Header title="LunchSync Explore" />

      <main className="pt-24 pb-56 px-4 max-w-2xl mx-auto space-y-8">
        {/* Header & Collection Selector */}
        <section className="space-y-6">
          <h2 className="font-headline text-4xl tracking-tight font-extrabold text-on-surface">
            Explore
          </h2>

          {loadingCollections ? (
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-24 bg-surface-container-low animate-pulse rounded-full shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollectionId(col.id)}
                  className={`snap-start shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${selectedCollectionId === col.id
                      ? 'bg-primary text-on-primary shadow-md ring-2 ring-primary/20'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                    }`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Restaurants Feed */}
        <section className="space-y-6">
          {loadingRestaurants ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-surface-container-low h-32 rounded-2xl w-full" />
              ))}
            </div>
          ) : errorRestaurants ? (
            <div className="text-center py-10 bg-error-container/20 border border-error/50 rounded-2xl">
              <p className="text-error font-medium">{errorRestaurants}</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-dashed border-outline/20">
              <span className="material-symbols-outlined text-outline/30 text-5xl mb-4">search_off</span>
              <p className="text-on-surface-variant font-medium">Khu vực này hiện chưa có quán nào.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {currentRestaurants.map((res) => (
                  <article key={res.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline/10 flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 h-48 sm:h-auto bg-surface-container relative shrink-0">
                      {res.thumbnail_url ? (
                        <img src={res.thumbnail_url} alt={res.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline/30 bg-surface-container-low">
                          <FontAwesomeIcon icon={faUtensils} className="text-4xl" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-amber-500 font-bold text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <FontAwesomeIcon icon={faStar} /> {res.rating ? parseFloat(res.rating).toFixed(1) : 'N/A'}
                      </div>
                    </div>
                    <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{res.name}</h3>
                        <p className="text-on-surface-variant text-xs mb-3 flex items-start gap-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5 text-outline shrink-0" />
                          <span className="line-clamp-2">{res.address}</span>
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="inline-block bg-primary-container/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-primary/20">
                          {res.price_display}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center pt-8 pb-4">
                  <div className="flex items-center bg-surface-container-low rounded-full p-1.5 shadow-sm border border-outline/5 hover:border-outline/10 transition-colors">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${currentPage === 1
                          ? 'text-on-surface/20 cursor-not-allowed'
                          : 'text-on-surface hover:bg-surface-container-highest hover:text-primary active:scale-95'
                        }`}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="text-base" />
                    </button>

                    <div className="px-5 font-headline font-semibold text-base text-on-surface flex items-center gap-1.5 select-none md:text-sm">
                      <span className="text-primary">{currentPage}</span>
                      <span className="text-on-surface-variant/40">/</span>
                      <span className="text-on-surface-variant font-medium">{totalPages}</span>
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${currentPage === totalPages
                          ? 'text-on-surface/20 cursor-not-allowed'
                          : 'text-on-surface hover:bg-surface-container-highest hover:text-primary active:scale-95'
                        }`}
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="text-base" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
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
        className="fixed bottom-32 right-6 z-50 bg-primary text-on-primary flex items-center gap-2 px-6 py-4 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
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
