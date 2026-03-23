import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import styles from './DonePage.module.css';

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
  const [copied, setCopied] = useState(false);
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

  const getShareText = () => {
    if (!restaurant) return '';
    return `Mình chốt ăn trưa rồi! ${restaurant.name} — ${restaurant.address}`;
  };

  const handleShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'LunchSync', text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      message.success('Đã copy kết quả!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRestart = () => {
    reset();
    navigate('/');
  };

  if (!restaurant) {
    return (
      <div className={styles.page}>
        <div className={styles.centerContent}>
          <div className={styles.loadingDots}><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Heading */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
        >
          <div className={styles.confettiIcon}>
            <motion.span
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              🎉
            </motion.span>
          </div>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Chốt rồi!
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Cùng đi ăn thôi nào!
          </motion.p>
        </motion.div>

        {/* Restaurant Card */}
        <motion.div
          className={styles.restaurantCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {restaurant.thumbnailUrl && (
            <img
              src={restaurant.thumbnailUrl}
              alt={restaurant.name}
              className={styles.cardImage}
            />
          )}
          <div className={styles.cardBody}>
            <div className={styles.cardName}>{restaurant.name}</div>
            <div className={styles.cardAddress}>
              <span className={styles.addressIcon}>📍</span>
              {restaurant.address}
            </div>
            <div className={styles.cardMeta}>
              {restaurant.priceDisplay && (
                <span className={styles.metaTag}>{restaurant.priceDisplay}</span>
              )}
              {restaurant.rating && (
                <span className={styles.metaTag}>★ {restaurant.rating}</span>
              )}
              {restaurant.dishes?.length > 0 && (
                <span className={styles.metaTag}>{restaurant.dishes.slice(0, 2).join(', ')}</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <a
            href={getMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapsBtn}
          >
            Chỉ đường 🚗
          </a>
          <button className={styles.shareBtn} onClick={handleShare}>
            {copied ? 'Đã copy! ✓' : 'Chia sẻ kết quả'}
          </button>
          <button className={styles.restartBtn} onClick={handleRestart}>
            Làm lại bữa trưa khác
          </button>
        </motion.div>

        {/* PIN footer */}
        <motion.div
          className={styles.pinFooter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          PIN: <strong>{pin}</strong>
        </motion.div>
      </div>
    </div>
  );
}
