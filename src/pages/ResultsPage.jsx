import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { mockHandlers } from '@/api/mock';
import { useSessionStore } from '@/store/sessionStore';
import styles from './ResultsPage.module.css';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const RANK_LABELS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function DishCard({ dish, rank, index }) {
  const pct = Math.round((dish.score || 0) * 100);
  return (
    <motion.div
      className={styles.dishCard}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <div className={styles.dishRank}>{RANK_LABELS[rank - 1]}</div>
      <div className={styles.dishInfo}>
        <div className={styles.dishName}>{dish.name}</div>
        <div className={styles.dishCategory}>{dish.category}</div>
      </div>
      <div className={styles.dishScore}>
        <span className={styles.scoreNum}>{pct}</span>
        <span className={styles.scoreUnit}>%</span>
      </div>
      <div className={styles.scoreBar}>
        <motion.div
          className={styles.scoreBarFill}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.1 + index * 0.15, ease: 'easeOut' }}
          style={{ background: RANK_COLORS[rank - 1] }}
        />
      </div>
    </motion.div>
  );
}

function RestaurantCard({ restaurant, rank, index }) {
  return (
    <motion.div
      className={styles.restaurantCard}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <img
        src={restaurant.thumbnailUrl}
        alt={restaurant.name}
        className={styles.restaurantThumb}
        loading="lazy"
      />
      <div className={styles.restaurantInfo}>
        <div className={styles.restaurantRank}>#{rank}</div>
        <div className={styles.restaurantName}>{restaurant.name}</div>
        <div className={styles.restaurantMeta}>
          <span className={styles.restaurantPrice}>{restaurant.priceDisplay}</span>
          <span className={styles.restaurantRating}>★ {restaurant.rating}</span>
        </div>
        <div className={styles.restaurantAddress}>{restaurant.address}</div>
        {restaurant.matchedDishes?.length > 0 && (
          <div className={styles.matchedDishes}>
            {restaurant.matchedDishes.map((d) => (
              <span key={d} className={styles.dishTag}>{d}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ResultsPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { isHost, status } = useSessionStore();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booming, setBooming] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const res = await mockHandlers.getResults(pin);
      if (res.error) {
        message.error(res.error.message);
        return;
      }
      setResults(res);

      if (res.status === 'picking') {
        navigate(`/boom/${pin}`);
      } else if (res.status === 'done') {
        navigate(`/done/${pin}`);
      }
    } catch {
      message.error('Không thể tải kết quả.');
    } finally {
      setLoading(false);
    }
  }, [pin, navigate]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Poll status for auto-redirect
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await mockHandlers.getStatus(pin);
        if (res.error) return;
        if (res.status === 'picking') {
          clearInterval(interval);
          navigate(`/boom/${pin}`);
        } else if (res.status === 'done') {
          clearInterval(interval);
          navigate(`/done/${pin}`);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [pin, navigate]);

  const handleBoom = async () => {
    if (booming) return;
    setBooming(true);
    try {
      const res = await mockHandlers.boom(pin);
      if (res.error) {
        message.error(res.error.message);
        setBooming(false);
        return;
      }
      navigate(`/boom/${pin}`);
    } catch {
      message.error('Không thể kích hoạt Boom.');
      setBooming(false);
    }
  };

  const handleCloseVoting = async () => {
    try {
      await mockHandlers.closeVoting(pin);
      message.success('Đã chốt kết quả!');
      fetchResults();
    } catch {
      message.error('Thao tác thất bại.');
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}><span /><span /><span /></div>
          <p>Đang tổng hợp kết quả...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <p>Chưa có kết quả. Vui lòng chờ host chốt phiếu.</p>
          {isHost && (
            <button className={styles.primaryBtn} onClick={handleCloseVoting}>
              Chốt kết quả
            </button>
          )}
        </div>
      </div>
    );
  }

  const { topDishes = [], topRestaurants = [] } = results;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.title}>Kết quả bình chọn</h1>
          <p className={styles.subtitle}>Top món ăn được yêu thích nhất</p>
        </motion.div>

        {/* Top 3 Dishes */}
        <motion.section
          className={styles.section}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className={styles.sectionTitle}>Món ăn nổi bật</h2>
          {topDishes.map((dish, i) => (
            <DishCard key={dish.id} dish={dish} rank={dish.rank} index={i} />
          ))}
        </motion.section>

        {/* Top 5 Restaurants */}
        <motion.section
          className={styles.section}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className={styles.sectionTitle}>Top quán ăn</h2>
          {topRestaurants.slice(0, 5).map((rest, i) => (
            <RestaurantCard key={rest.id} restaurant={rest} rank={rest.rank || i + 1} index={i} />
          ))}
        </motion.section>

        {/* Host Actions */}
        {isHost && (
          <motion.div
            className={styles.hostActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              className={styles.boomBtn}
              onClick={handleBoom}
              disabled={booming}
            >
              {booming ? 'Đang kích hoạt...' : 'Boom 🔥 Thu hẹp còn 3 quán'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
