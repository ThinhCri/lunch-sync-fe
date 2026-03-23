import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { ParticipantAvatar } from '@/components/common/AppHeader';
import { ParticipantCount } from '@/components/common/ParticipantCount';
import styles from './WaitingRoomPage.module.css';

export default function WaitingRoomPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants, setParticipants, isHost } = useSessionStore();

  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.sessions.getStatus(pin);
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        navigate('/');
        return;
      }
      // Note: getStatus does NOT return participants. For participant list,
      // we rely on SessionContext/localStorage which is updated by other pages.
      if (data.status === 'voting') {
        navigate(`/vote/${pin}`);
      } else if (data.status === 'results') {
        navigate(`/results/${pin}`);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useSession({ pin, onStatus: fetchStatus, enabled: true });
  useReconnect({ onReconnect: fetchStatus, enabled: true });

  useEffect(() => {
    fetchStatus();
  }, [pin]);

  const handleStart = async () => {
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
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>Chờ người khác</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        <div className={styles.pinBadge}>
          <span className={styles.pinLabel}>Mã PIN</span>
          <span className={styles.pinValue}>{pin}</span>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Người tham gia</h2>
            <ParticipantCount current={participants.length} />
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots}>
                <span /><span /><span />
              </div>
              <p className={styles.loadingText}>Đang kết nối...</p>
            </div>
          ) : participants.length === 0 ? (
            <p className={styles.emptyText}>Chưa có ai tham gia</p>
          ) : (
            <div className={styles.participantList}>
              {participants.map((p) => (
                <div key={p.id || p.nickname} className={styles.participantItem}>
                  <ParticipantAvatar name={p.nickname} size={44} />
                  <span className={styles.participantName}>{p.nickname}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.hint}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>Chờ host bắt đầu bình chọn...</span>
        </div>
      </div>
    </div>
  );
}
