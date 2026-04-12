import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faKey, faXmark, faExclamationCircle, faArrowRight, 
  faDoorOpen, faUser, faSpinner, faRightToBracket 
} from '@fortawesome/free-solid-svg-icons';

const PIN_LENGTH = 6;

export default function JoinModal({ open, defaultPin = '', onClose }) {
  const navigate = useNavigate();
  const { setSession } = useSessionStore();

  const [step, setStep] = useState('pin');
  const [pin, setPin] = useState(defaultPin);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPin(defaultPin);
      setStep(defaultPin ? 'nickname' : 'pin');
      setError('');
      setNickname('');
    }
  }, [open, defaultPin]);

  useEffect(() => {
    if (open && step === 'pin') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, step]);

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(val);
    setError('');
  };

  const handlePinKeyDown = (e) => {
    if (e.key === 'Enter' && pin.length === PIN_LENGTH) {
      handlePinSubmit();
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== PIN_LENGTH) return;
    setStep('nickname');
    setError('');
  };

  const handleNicknameSubmit = async () => {
    if (!nickname.trim() || nickname.length < 2 || nickname.length > 12) {
      message.error('Nickname từ 2–12 ký tự');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sessions.join(pin, { nickname: nickname.trim() });
      const data = res.data;

      setSession({
        pin,
        sessionId: data.sessionId,
        participantId: data.participantId,
        isHost: false,
      });

      onClose();
      navigate(`/waiting/${pin}`);
    } catch (err) {
      message.error(err.message || 'Không thể tham gia phiên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = () => {
    setStep('pin');
    setPin('');
    setNickname('');
    setError('');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(28,28,25,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#9a410f]/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faKey} className="text-[#9a410f]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1c1c19]">
                {step === 'pin' ? 'LunchSync Join' : 'Nhập nickname'}
              </h2>
              <p className="text-sm text-[#56423a]">
                {step === 'pin' ? 'Nhập mã PIN để tham gia voting bữa trưa' : 'Đặt nickname để mọi người nhận biết bạn'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#ebe8e3] flex items-center justify-center text-[#56423a] hover:bg-[#e6e2dd] transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
          {step === 'pin' ? (
            <div className="flex flex-col items-center gap-6">
              {/* PIN Input */}
              <div className="w-full">
                <div
                  className="flex gap-2 justify-center cursor-text"
                  onClick={() => inputRef.current?.focus()}
                >
                  {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                    <div
                      key={i}
                      className={`
                        w-11 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-150
                        ${pin[i]
                          ? 'border-[#9a410f] bg-[#fff5f0] text-[#1c1c19]'
                          : i === pin.length
                          ? 'border-[#dcc1b6] bg-white text-[#1c1c19]'
                          : 'border-[#e6e2dd] bg-white text-[#1c1c19]'
                        }
                        ${error ? 'border-[#ba1a1a] bg-[#fff5f5]' : ''}
                      `}
                    >
                      {pin[i] || ''}
                    </div>
                  ))}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={pin}
                  onChange={handlePinChange}
                  onKeyDown={handlePinKeyDown}
                  className="sr-only"
                  aria-label="PIN input"
                />
                {error && (
                  <p className="text-xs text-[#ba1a1a] text-center mt-2 flex items-center justify-center gap-1">
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-xs" />
                    {error}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== PIN_LENGTH}
                className={`
                  w-full py-4 rounded-full text-lg font-bold transition-all duration-200 flex items-center justify-center gap-2
                  ${pin.length === PIN_LENGTH
                    ? 'bg-[#9a410f] text-white shadow-lg hover:shadow-xl active:scale-95'
                    : 'bg-[#ebe8e3] text-[#897269] cursor-not-allowed'
                  }
                `}
              >
                Tiếp tục
                {pin.length === PIN_LENGTH && (
                  <FontAwesomeIcon icon={faArrowRight} />
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* PIN badge */}
              <div className="flex items-center justify-center gap-3 bg-[#fff5f0] rounded-xl py-3 px-4">
                <div className="w-8 h-8 rounded-full bg-[#9a410f]/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faDoorOpen} className="text-[#9a410f] text-base" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#897269]">Phòng</span>
                  <span className="text-lg font-bold text-[#1c1c19] font-mono tracking-widest">{pin}</span>
                </div>
                <button
                  onClick={() => { setStep('pin'); setNickname(''); }}
                  className="ml-auto text-xs text-[#9a410f] hover:underline font-medium"
                >
                  Đổi
                </button>
              </div>

              {/* Nickname Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#56423a] ml-1">
                  Nickname của bạn
                </label>
                <div className="relative">
                  <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#897269]" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-[#f7f3ee] rounded-xl border-2 border-transparent focus:border-[#9a410f] focus:bg-white transition-all duration-200 outline-none text-[#1c1c19] placeholder:text-[#c4b8b1]"
                    placeholder="VD: Tuấn, Minh, Bình..."
                    maxLength={12}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && nickname.trim().length >= 2) {
                        handleNicknameSubmit();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-[#897269] ml-1">
                  2–12 ký tự, sẽ hiển thị với mọi người trong phòng
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleNicknameSubmit}
                disabled={loading || !nickname.trim() || nickname.length < 2}
                className={`
                  w-full py-4 rounded-full text-lg font-bold transition-all duration-200 flex items-center justify-center gap-2
                  ${loading || !nickname.trim() || nickname.length < 2
                    ? 'bg-[#ebe8e3] text-[#897269] cursor-not-allowed'
                    : 'bg-[#9a410f] text-white shadow-lg hover:shadow-xl active:scale-95'
                  }
                `}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Đang tham gia...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faRightToBracket} />
                    Vào bàn
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
