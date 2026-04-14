import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import confetti from 'canvas-confetti';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

const BRAND_COLORS = ['#9c3f00', '#ff7a2f', '#4953ac', '#176a21', '#FFD700', '#ff6b00'];

function fireConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 }, colors: BRAND_COLORS };

  function burst(overrides) {
    confetti({
      ...defaults,
      ...overrides,
      particleCount: Math.floor(count / 2),
      spread: 60,
      scalar: 1,
    });
  }

  burst({ spread: 26, startVelocity: 55 });
  burst({ spread: 60 });
  burst({ spread: 100, decay: 0.91, scalar: 0.8 });
  burst({ spread: 120, decay: 0.9, scalar: 1.2 });
}

export default function DonePage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { reset } = useSessionStore();

  const [restaurant, setRestaurant] = useState(null);
  const confettiFired = useRef(false);

  useEffect(() => {
    // Try to get final restaurant from results
    api.sessions.getResults(pin).then((res) => {
      const data = res.data;
      if (data.finalRestaurant) {
        setRestaurant(data.finalRestaurant);
      }
      // Fallback is handled by the mock - returning the first restaurant
    });
  }, [pin]);

  // Fire confetti once on mount
  useEffect(() => {
    if (restaurant && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(fireConfetti, 400);
    }
  }, [restaurant]);

  const getMapsUrl = () => {
    if (!restaurant) return '#';
    const encoded = encodeURIComponent(`${restaurant.name} ${restaurant.address}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  };

  const handleRestart = () => {
    reset();
    navigate('/');
  };

  if (!restaurant) {
    return (
      <div className="bg-surface min-h-[100dvh] flex flex-col items-center justify-center gap-4 pt-24 pb-32">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Header title="LunchSync Done" />

      <main className="pt-20 pb-32 px-4 max-w-2xl mx-auto">
        {/* Success Hero Section */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-container/20 rounded-full mb-6">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">Bữa trưa đã sẵn sàng!</h2>
          <p className="text-on-surface-variant font-medium">Chúc bạn ngon miệng tại điểm đến tuyệt vời này.</p>
        </section>

        {/* Kinetic Restaurant Card */}
        <div className="relative group mb-10">
          <div className="absolute -inset-4 bg-primary/5 rounded-xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0_8px_24px_rgba(44,47,48,0.06)]">
            {/* Signature Image */}
            <div className="h-72 w-full relative">
              <img 
                alt={restaurant.name} 
                className="w-full h-full object-cover" 
                src={restaurant.thumbnailUrl || `https://picsum.photos/seed/${restaurant.id}/800/600`}
              />
              {/* Overlapping Rating Chip */}
              <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-orange-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-headline font-bold text-sm text-on-surface">{restaurant.rating || '4.9'}</span>
              </div>
            </div>
            
            {/* Restaurant Content */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-1">{restaurant.name}</h3>
                  <p className="text-on-surface-variant flex items-center gap-1 mb-4">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {restaurant.address}
                  </p>
                </div>
                {restaurant.priceDisplay && (
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                    {restaurant.priceDisplay}
                  </span>
                )}
              </div>
              
              {/* Main CTA: Google Maps */}
              <a 
                className="flex items-center justify-center gap-3 w-full bg-primary text-on-primary py-5 rounded-full font-headline font-bold text-lg active:scale-[0.98] transition-transform shadow-lg shadow-primary/20" 
                href={getMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined">map</span>
                Xem trên Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button 
            className="bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 py-4 rounded-lg font-headline font-bold text-on-surface active:scale-[0.98]"
            onClick={handleRestart}
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Về trang chủ
          </button>
          <button 
            className="bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 py-4 rounded-lg font-headline font-bold text-on-surface active:scale-[0.98]"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Bữa trưa hôm nay!',
                  text: `Tụi mình sẽ đi ăn ở ${restaurant.name} nha!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(`Tụi mình sẽ đi ăn ở ${restaurant.name} nha! ${window.location.href}`);
                message.success('Đã copy link');
              }
            }}
          >
            <span className="material-symbols-outlined text-lg">share</span>
            Chia sẻ bạn bè
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
