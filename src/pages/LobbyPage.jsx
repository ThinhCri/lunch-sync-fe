import { useState, useEffect, useCallback } from 'react';
import { Button, message, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { MIN_PARTICIPANTS } from '@/utils/constants';
import { ParticipantAvatar } from '@/components/common/AppHeader';
import { ParticipantCount } from '@/components/common/ParticipantCount';
import { SessionTimer } from '@/components/common/SessionTimer';
import styles from './LobbyPage.module.css';

export default function LobbyPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants, setParticipants, reset } = useSessionStore();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [infoRes, statusRes] = await Promise.all([
        api.sessions.getInfo(pin),
        api.sessions.getStatus(pin),
      ]);
      const infoData = infoRes.data;
      const statusData = statusRes.data;
      if (infoData.error) {
        message.error(infoData.error.message);
        navigate('/');
        return;
      }
      setSessionInfo(infoData);
      setParticipants(infoData.participants || []);
      setCreatedAt(infoData.createdAt || Date.now());
      if (statusData.status === 'voting') {
        navigate(`/vote/${pin}`);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pin, navigate, setParticipants]);

  useSession({ pin, onStatus: fetchStatus, enabled: true });
  useReconnect({ onReconnect: fetchStatus, enabled: true });

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await api.sessions.start(pin);
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        return;
      }
      navigate(`/vote/${pin}`);
    } catch {
      message.error('Không thể bắt đầu');
    } finally {
      setStarting(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.sessions.cancel(pin);
    } catch {
      // ignore API errors on cancel
    }
    reset();
    navigate('/');
  };

  const handleExpired = () => {
    message.warning('Phiên đã hết hạn');
    reset();
    navigate('/');
  };

  const enough = participants.length >= MIN_PARTICIPANTS;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => setShowCancelModal(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>Phòng chờ</span>
        {createdAt && (
          <SessionTimer createdAt={createdAt} onExpire={handleExpired} />
        )}
      </div>

      <div className={styles.content}>
        {/* PIN */}
        <div className={styles.pinWrap}>
          <div className={styles.pinBadge}>
            <span className={styles.pinLabel}>Mã PIN</span>
            <span className={styles.pinValue}>{pin}</span>
          </div>
        </div>

        {/* Share hint */}
        <p className={styles.shareHint}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Chia sẻ mã PIN để mời bạn bè tham gia
        </p>

        {/* Participants */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Người tham gia</h2>
            <ParticipantCount current={participants.length} min={MIN_PARTICIPANTS} />
          </div>

          {loading ? (
            <div className={styles.loadingList}>Đang tải...</div>
          ) : participants.length === 0 ? (
            <p className={styles.emptyText}>Chưa có ai tham gia</p>
          ) : (
            <div className={styles.participantList}>
              {participants.map((p) => (
                <div key={p.id || p.nickname} className={styles.participantItem}>
                  <ParticipantAvatar name={p.nickname} size={44} />
                  <span className={styles.participantName}>{p.nickname}</span>
                  {p.nickname === 'Host' && (
                    <span className={styles.hostBadge}>Host</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!enough && (
            <div className={styles.warning}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Cần tối thiểu {MIN_PARTICIPANTS} người để bắt đầu
            </div>
          )}
        </div>

        {/* Start button */}
        <div className={styles.footer}>
          <Button
            type="primary"
            size="large"
            block
            className={styles.startBtn}
            disabled={!enough || starting}
            loading={starting}
            onClick={handleStart}
          >
            {starting ? 'Đang bắt đầu...' : 'Bắt đầu bình chọn 🚀'}
          </Button>
          <button className={styles.cancelLink} onClick={() => setShowCancelModal(true)}>
            Hủy phiên
          </button>
        </div>
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        open={showCancelModal}
        title="Hủy phiên?"
        okText="Hủy phiên"
        cancelText="Ở lại"
        okButtonProps={{ danger: true }}
        onOk={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      >
        <p>Phiên sẽ bị xóa và mọi người sẽ không thể tham gia.</p>
      </Modal>
    </div>
  );
}
