import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faRedoAlt, faStar, faQuoteLeft, faCircleNotch, faTrophy, faCar } from '@fortawesome/free-solid-svg-icons';

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
    navigate('/create');
  };

  if (!restaurant) {
    return (
      <Layout>
        <div className="flex-grow flex flex-col items-center justify-center gap-4 pt-24">
          <FontAwesomeIcon icon={faCircleNotch} className="text-primary text-4xl animate-spin" />
          <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 flex-grow flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full pb-32 overflow-hidden relative">
        
        <div className="w-full text-center space-y-10">
          {/* Header */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-primary/10">
               <FontAwesomeIcon icon={faStar} className="text-amber-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-headline font-black text-on-surface tracking-tighter italic leading-none">
                CHỐT RỒI! <FontAwesomeIcon icon={faTrophy} className="text-primary" />
              </h1>
              <p className="text-lg text-on-surface-variant font-medium uppercase tracking-widest opacity-60">
                Chúc bạn ngon miệng!
              </p>
            </div>
          </motion.div>

          {/* Restaurant Card (Premium Bento Style) */}
          <motion.div
            className="relative group overflow-hidden bg-white border border-outline/30 rounded-[3rem] shadow-2xl shadow-primary/5 p-2 transition-all hover:shadow-primary/10"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <FontAwesomeIcon icon={faQuoteLeft} className="text-9xl" />
            </div>

            {restaurant.thumbnailUrl && (
              <div className="relative h-64 overflow-hidden rounded-[2.5rem]">
                <img
                  src={restaurant.thumbnailUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-8 text-white">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        Quán thắng cuộc
                      </span>
                   </div>
                   <h2 className="text-3xl font-headline font-black tracking-tight">{restaurant.name}</h2>
                </div>
              </div>
            )}
            
            <div className="p-8 text-left space-y-6">
              {!restaurant.thumbnailUrl && (
                <h2 className="text-4xl font-headline font-black text-on-surface tracking-tight leading-none mb-4">{restaurant.name}</h2>
              )}

              <div className="flex items-start gap-4 p-4 bg-surface-container rounded-2xl border border-outline/5 transition-colors group-hover:bg-primary/5">
                <div className="mt-1 w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="flex-grow">
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Địa chỉ</p>
                  <p className="text-sm font-bold text-on-surface-variant leading-relaxed">
                    {restaurant.address}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {restaurant.priceDisplay && (
                  <div className="px-4 py-2 bg-secondary/10 text-on-secondary-container rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    {restaurant.priceDisplay}
                  </div>
                )}
                {restaurant.rating && (
                  <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} />
                    {restaurant.rating}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <a
              href={getMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-6 bg-primary text-white rounded-full font-headline font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
            >
              <FontAwesomeIcon icon={faCar} />
              CHỈ ĐƯỜNG
            </a>
            <button 
              className="py-5 text-on-surface-variant/40 hover:text-primary font-bold text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
              onClick={handleRestart}
            >
              <FontAwesomeIcon icon={faRedoAlt} className="text-xs" />
              Làm lại bữa trưa khác
            </button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
