import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { mockHandlers } from '@/api/mock';
import { useSessionStore } from '@/store/sessionStore';
import { PRICE_TIERS, MIN_PARTICIPANTS } from '@/utils/constants';
import styles from './CreateSessionPage.module.css';

const PRICE_EMOJI = {
  duoi_40k: '💸',
  '40_70k': '🍜',
  '70_120k': '🥘',
  tren_120k: '🎉',
};

export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { setSession, setParticipants } = useSessionStore();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

  // Load collections
  useEffect(() => {
    mockHandlers.getCollections().then((res) => {
      setCollections(res);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!selectedCollection || !selectedTier) return;
    setCreating(true);
    try {
      const res = await mockHandlers.createSession({
        collectionId: selectedCollection.id,
        priceTier: selectedTier.key,
      });
      if (res.error) {
        message.error(res.error.message);
        return;
      }
      setCreatedSession(res);
      setSession({
        pin: res.pin,
        sessionId: res.sessionId,
        participantId: null,
        isHost: true,
        collectionId: selectedCollection.id,
        collectionName: selectedCollection.name,
        priceTier: selectedTier.key,
      });
      // Host tự join vào session
      const joinRes = await mockHandlers.joinSession(res.pin, 'Host');
      setParticipants([{ id: joinRes.participantId, nickname: 'Host', joinedAt: new Date().toISOString() }]);
    } catch (err) {
      message.error('Tạo phiên thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdSession) return;
    const link = `${window.location.origin}/join/${createdSession.pin}`;
    navigator.clipboard.writeText(link).then(() => {
      message.success('Đã copy link!');
    });
  };

  const handleCancel = async () => {
    setCreatedSession(null);
    setSelectedCollection(null);
    setSelectedTier(null);
    setStep(1);
  };

  // Đã tạo xong → hiển thị PIN
  if (createdSession) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={handleCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <span className={styles.headerTitle}>Đã tạo bữa trưa</span>
          <div style={{ width: 40 }} />
        </div>

        <div className={styles.content}>
          <div className={styles.successIcon}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="#e8f5e9"/>
              <circle cx="28" cy="28" r="20" fill="#51CF66"/>
              <path d="M20 28l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.successTitle}>Bữa trưa đã sẵn sàng!</h2>
          <p className={styles.successSubtitle}>Chia sẻ mã PIN để mời mọi người tham gia</p>

          <div className={styles.pinDisplay}>
            {createdSession.pin.split('').map((digit, i) => (
              <div key={i} className={styles.pinDigit}>{digit}</div>
            ))}
          </div>

          <p className={styles.collectionName}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {createdSession.collectionName}
          </p>

          <Button
            type="primary"
            size="large"
            block
            className={styles.shareBtn}
            onClick={handleCopyLink}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            }
          >
            Copy link mời bạn bè
          </Button>

          <Button
            size="large"
            block
            className={styles.enterBtn}
            onClick={() => navigate(`/lobby/${createdSession.pin}`)}
          >
            Vào phòng chờ
          </Button>

          <button className={styles.newSession} onClick={handleCancel}>
            + Tạo phiên mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>Tạo bữa trưa</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        {/* Step indicator */}
        <div className={styles.steps}>
          <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`}>
            <span>1</span>
            <p>Chọn khu vực</p>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`}>
            <span>2</span>
            <p>Chọn giá</p>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.stepDot} ${step >= 3 ? styles.active : ''}`}>
            <span>3</span>
            <p>Tạo xong</p>
          </div>
        </div>

        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Chọn khu vực ăn trưa</h2>
            <p className={styles.stepDesc}>Chọn khu vực gần nhóm của bạn</p>
            <div className={styles.collectionList}>
              {loading ? (
                <p className={styles.loading}>Đang tải...</p>
              ) : (
                collections.map((col) => (
                  <div
                    key={col.id}
                    className={`${styles.collectionCard} ${selectedCollection?.id === col.id ? styles.selected : ''}`}
                    onClick={() => setSelectedCollection(col)}
                  >
                    <div className={styles.collectionInfo}>
                      <p className={styles.collectionName}>{col.name}</p>
                      <p className={styles.collectionDesc}>{col.description}</p>
                    </div>
                    <div className={styles.collectionCount}>
                      <span>{col.restaurantCount}</span>
                      <small>quán</small>
                    </div>
                    {selectedCollection?.id === col.id && (
                      <div className={styles.checkmark}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <Button
              type="primary"
              size="large"
              block
              disabled={!selectedCollection}
              className={styles.nextBtn}
              onClick={() => setStep(2)}
            >
              Tiếp tục
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Mức giá thoải mái</h2>
            <p className={styles.stepDesc}>Chọn khoảng giá cho mỗi người</p>
            <div className={styles.tierGrid}>
              {PRICE_TIERS.map((tier) => (
                <div
                  key={tier.key}
                  className={`${styles.tierCard} ${selectedTier?.key === tier.key ? styles.selected : ''}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  <span className={styles.tierEmoji}>{PRICE_EMOJI[tier.key]}</span>
                  <span className={styles.tierLabel}>{tier.label}</span>
                </div>
              ))}
            </div>
            <div className={styles.actionRow}>
              <Button
                size="large"
                className={styles.backStepBtn}
                onClick={() => setStep(1)}
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                className={styles.createBtn}
                disabled={!selectedTier}
                loading={creating}
                onClick={handleCreate}
              >
                Tạo bữa trưa 🍱
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
