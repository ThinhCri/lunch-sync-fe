import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/store/toastStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { MapPin, Star, Map, Utensils } from 'lucide-react';

const PRICE_MAP = {
  Under50k: 'Dưới 50k',
  From50To70k: '50k - 70k',
  From70To120k: '70k - 120k',
  Over120k: 'Trên 120k',
};

export default function DonePage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { isHost, reset } = useSessionStore();
  const { show } = useToastStore();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('lunchsync_final_restaurant');
    if (saved) {
      try {
        const rest = JSON.parse(saved);
        setRestaurant({
          id: rest.id,
          name: rest.name,
          address: rest.address || rest.location,
          thumbnailUrl: rest.thumbnail_url || rest.thumbnailUrl || rest.image_url || rest.imageUrl,
          rating: rest.rating || rest.score,
          priceDisplay: PRICE_MAP[rest.price_tier] || PRICE_MAP[rest.priceDisplay] || null,
          mapsUrl: rest.google_maps_url || rest.mapsUrl || null,
          matchedDishes: rest.matched_dishes || rest.matchedDishes || [],
        });
        localStorage.removeItem('lunchsync_final_restaurant');
      } catch {
        localStorage.removeItem('lunchsync_final_restaurant');
        show('Không tìm thấy thông tin quán ăn.', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      api.sessions.getResults(pin).then((res) => {
        const data = res.data;
        const rest = data.final_restaurant || data.finalRestaurant || data.winner || data;
        if (rest && rest.name) {
          setRestaurant({
            id: rest.id,
            name: rest.name,
            address: rest.address || rest.location,
            thumbnailUrl: rest.thumbnailUrl || rest.thumbnail_url || rest.image_url || rest.imageUrl,
            rating: rest.rating || rest.score,
            priceDisplay: PRICE_MAP[rest.priceDisplay] || PRICE_MAP[rest.price_tier] || null,
            mapsUrl: rest.google_maps_url || rest.mapsUrl || null,
            matchedDishes: rest.matched_dishes || rest.matchedDishes || [],
          });
        }
      }).catch(() => {
        show('Không tìm thấy thông tin quán ăn.', 'error');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [pin, show]);

  const getMapsUrl = () => {
    if (!restaurant) return '#';
    if (restaurant.mapsUrl) return restaurant.mapsUrl;
    const encoded = encodeURIComponent(`${restaurant.name} ${restaurant.address}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  };

  const goNext = () => {
    localStorage.removeItem('lunchsync-session');
    localStorage.removeItem('lunchsync-session-store');
    reset();
    if (isHost) {
      navigate('/create');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-[100dvh] flex flex-col items-center justify-center gap-4 pt-24 pb-32">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Đang tải...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-surface min-h-screen font-body text-on-surface">
        <Header title="LunchSync" />
        <main className="pt-24 pb-32 px-4 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-on-surface-variant font-medium text-sm">Không tìm thấy thông tin quán ăn.</p>
          <button
            className="mt-6 w-full max-w-xs h-12 bg-primary text-white rounded-full font-headline font-bold text-sm active:scale-95 transition-transform"
            onClick={goNext}
          >
            Tiếp tục
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Header title="LunchSync" />

      <main className="pt-24 pb-32 px-4 max-w-xl mx-auto">
        {/* Hero Image */}
        {restaurant.thumbnailUrl && (
          <div className="w-full rounded-xl overflow-hidden mb-6 shadow-sm">
            <img
              alt={restaurant.name}
              className="w-full h-52 object-cover"
              src={restaurant.thumbnailUrl}
            />
          </div>
        )}

        {/* Restaurant Info Card */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mb-4 space-y-4">
          {/* Name & Address */}
          <div className="space-y-2">
            <h1 className="font-headline text-2xl font-extrabold text-on-surface leading-tight tracking-tight">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <p className="text-on-surface-variant text-sm flex items-start gap-1.5 leading-snug">
                <MapPin className="text-sm shrink-0 mt-0.5" />
                {restaurant.address}
              </p>
            )}
          </div>

          {/* Rating & Price */}
          <div className="flex items-center gap-3">
            {restaurant.rating && (
              <div className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full">
                <Star className="text-xs fill-primary text-primary" />
                <span className="text-sm font-bold">{restaurant.rating}</span>
              </div>
            )}
            {restaurant.priceDisplay && (
              <div className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full">
                <span className="text-sm font-bold">{restaurant.priceDisplay}</span>
              </div>
            )}
          </div>
        </div>

        {/* Matched Dishes */}
        {restaurant.matchedDishes?.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm mb-6 space-y-3">
            <div className="flex items-center gap-2 text-on-surface">
              <Utensils className="text-primary text-base" />
              <span className="text-sm font-bold">Món ăn phù hợp</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {restaurant.matchedDishes.map((dish, i) => (
                <span
                  key={i}
                  className="bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-xs font-bold"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button - Google Maps */}
        <a
          className="flex items-center justify-center gap-2 w-full h-14 bg-primary text-white rounded-full font-headline font-bold text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          href={getMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Map className="text-lg" />
          Mở Google Maps
        </a>
      </main>

      <BottomNav />
    </div>
  );
}
