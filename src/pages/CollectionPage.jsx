import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { api } from '@/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar, faMapMarkerAlt, faUtensils } from '@fortawesome/free-solid-svg-icons';

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await api.collections.getById(id);
        const data = res.data;
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (data.restaurants && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
        } else {
          setRestaurants([]);
        }
      } catch (err) {
        console.error('Failed to fetch collection details:', err);
        setError('Không thể lấy danh sách quán trong khu vực này.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCollection();
    }
  }, [id]);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <Header
        title="LunchSync Collections"
        leftElement={
          <button onClick={() => navigate(-1)} className="text-on-surface hover:text-primary transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </button>
        }
      />

      <main className="pt-24 pb-32 px-4 max-w-2xl mx-auto space-y-8">
        <section className="space-y-2">
          <h2 className="font-headline text-3xl tracking-tight font-extrabold text-on-surface">
            Danh sách quán
          </h2>
          <p className="text-on-surface-variant text-sm">
            Khám phá {restaurants.length} quán ngon trong khu vực này.
          </p>
        </section>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-surface-container-low h-32 rounded-2xl w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-error-container/20 border border-error/50 rounded-2xl">
            <p className="text-error font-medium">{error}</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline/20">
            <p className="text-on-surface-variant font-medium">Khu vực này hiện chưa có quán nào.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {restaurants.map((res) => (
              <article key={res.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline/10 flex flex-col sm:flex-row">
                <div className="sm:w-1/3 h-48 sm:h-auto bg-surface-container relative">
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
        )}
      </main>
    </div>
  );
}
