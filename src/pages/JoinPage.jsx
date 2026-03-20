import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import { mockHandlers } from '@/api/mock';
import { useSessionStore } from '@/store/sessionStore';
import styles from './JoinPage.module.css';

export default function JoinPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { setSession } = useSessionStore();

  const [pin, setPin] = useState(params.pin || '');
  const [nickname, setNickname] = useState('');
  const [step, setStep] = useState(params.pin ? 'nickname' : 'pin');
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const handlePinSubmit = () => {
    if (pin.length !== 6) {
      setPinError('PIN phải là 6 chữ số');
      return;
    }
    setPinError('');
    setStep('nickname');
  };

  const handleNicknameSubmit = async () => {
    if (!nickname.trim() || nickname.length < 2 || nickname.length > 12) {
      message.error('Nickname từ 2–12 ký tự');
      return;
    }

    setLoading(true);
    try {
      // Optimistic redirect
      navigate(`/waiting/${pin}`);

      const res = await mockHandlers.joinSession(pin, nickname.trim());
      if (res.error) {
        message.error(res.error.message);
        navigate(`/join/${pin}`);
        return;
      }

      setSession({
        pin,
        sessionId: res.sessionId,
        participantId: res.participantId,
        isHost: false,
      });
    } catch (err) {
      message.error('Không thể tham gia phiên');
      navigate(`/join/${pin}`);
    } finally {
      setLoading(false);
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
        <span className={styles.headerTitle}>Tham gia</span>
        <div style={{ width: 40 }} />
      </div>

      <div className={styles.content}>
        {step === 'pin' ? (
          <div className={styles.stepSection}>
            <h2 className={styles.stepTitle}>Nhập mã PIN</h2>
            <p className={styles.stepDesc}>Mã PIN 6 số được chia sẻ bởi host</p>
            <div className={styles.pinDisplay}>
              {[0,1,2,3,4,5].map(i => (
                <div
                  key={i}
                  className={`${styles.pinCell} ${pin[i] ? styles.filled : ''}`}
                  onClick={() => {
                    const input = document.querySelector('[data-pin-input]');
                    input?.focus();
                  }}
                >
                  {pin[i] || ''}
                </div>
              ))}
            </div>
            <input
              data-pin-input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
                setPinError('');
              }}
              className={styles.hiddenInput}
              autoFocus
            />
            {pinError && <p className={styles.error}>{pinError}</p>}
            <Button
              type="primary"
              size="large"
              block
              disabled={pin.length !== 6}
              onClick={handlePinSubmit}
              className={styles.ctaBtn}
            >
              Tiếp tục
            </Button>
          </div>
        ) : (
          <div className={styles.stepSection}>
            <h2 className={styles.stepTitle}>Bạn tên gì?</h2>
            <p className={styles.stepDesc}>Nhập nickname để tham gia phiên</p>
            <div className={styles.pinBadge}>
              <span className={styles.pinLabel}>Mã PIN</span>
              <span className={styles.pinValue}>{pin}</span>
            </div>
            <Input
              size="large"
              placeholder="Nickname (2–12 ký tự)"
              maxLength={12}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onPressEnter={handleNicknameSubmit}
              className={styles.nicknameInput}
              autoFocus
            />
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              disabled={!nickname.trim() || nickname.length < 2}
              onClick={handleNicknameSubmit}
              className={styles.ctaBtn}
            >
              Vào bàn
            </Button>
            <button className={styles.changePin} onClick={() => { setStep('pin'); setNickname(''); }}>
              Đổi mã PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
