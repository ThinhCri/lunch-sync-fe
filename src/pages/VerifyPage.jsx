import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmRegistration, resendConfirmationCode } from '@/services/cognito';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationCircle, faEnvelope, faRotateRight, faCheck } from '@fortawesome/free-solid-svg-icons';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const returnTo = location.state?.returnTo;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef(null);

  // Redirect if no email in state (direct access)
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus hidden input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(val);
    setError('');
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) return;
    setLoading(true);
    setError('');
    try {
      await confirmRegistration(email, code);
      setSuccess(true);
      // Wait a moment for the success animation, then redirect to login
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { returnTo, verified: true },
        });
      }, 1500);
    } catch (err) {
      const msg = err?.message || 'Mã xác thực không đúng. Vui lòng thử lại.';
      if (msg.includes('Invalid verification code')) {
        setError('Mã xác thực không đúng. Vui lòng kiểm tra lại.');
      } else if (msg.includes('expired')) {
        setError('Mã đã hết hạn. Hãy gửi lại mã mới.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await resendConfirmationCode(email);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err?.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && code.length === CODE_LENGTH) {
      handleVerify();
    }
  };

  if (!email) return null;

  return (
    <div className="bg-surface text-on-surface h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Decorative Elements */}
      <div className="fixed top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <Header title="LunchSync Xác thực" />

      <main className="flex-grow flex flex-col items-center px-6 pt-28 pb-32 relative z-10 w-full">
        <div className="w-full max-w-md flex flex-col shrink-0">
          
          {/* Icon + Heading */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl"></div>
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-[0_8px_24px_rgba(44,47,48,0.06)] transition-all duration-500 ${
                success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-primary-container/20 border-surface-container-lowest'
              }`}>
                <FontAwesomeIcon 
                  icon={success ? faCheck : faEnvelope} 
                  className={`text-3xl transition-all duration-500 ${success ? 'text-green-600' : 'text-primary'}`} 
                />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
              {success ? 'Xác thực thành công!' : 'Xác thực email'}
            </h1>
            <p className="text-on-surface-variant text-sm font-medium">
              {success 
                ? 'Đang chuyển hướng đến trang đăng nhập...' 
                : <>Nhập mã 6 số đã gửi đến <span className="text-primary font-bold">{email}</span></>
              }
            </p>
          </div>

          {!success && (
            <>
              {/* Verification Card */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_4px_16px_rgba(44,47,48,0.03)] border border-outline-variant/10">
                
                {error && (
                  <div className="mb-6 px-4 py-3 bg-error-container/20 text-error rounded-lg flex items-center gap-2 text-sm font-medium">
                    <FontAwesomeIcon icon={faExclamationCircle} className="text-sm flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* OTP Code Input */}
                <div className="mb-6">
                  <div
                    className="flex gap-2.5 justify-center cursor-text"
                    onClick={() => inputRef.current?.focus()}
                  >
                    {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                      <div
                        key={i}
                        className={`
                          w-12 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-150
                          ${code[i]
                            ? 'border-primary bg-primary/5 text-primary'
                            : i === code.length
                            ? 'border-primary/40 bg-surface-container-lowest text-on-surface'
                            : 'border-outline-variant/30 bg-surface-container-low text-on-surface'
                          }
                        `}
                      >
                        {code[i] || ''}
                      </div>
                    ))}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    className="sr-only"
                    aria-label="Verification code input"
                  />
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== CODE_LENGTH}
                  className={`
                    w-full py-4 rounded-full text-lg font-bold transition-all duration-200 flex items-center justify-center gap-2
                    ${loading || code.length !== CODE_LENGTH
                      ? 'bg-surface-variant/50 text-on-surface-variant/40 cursor-not-allowed'
                      : 'bg-primary text-on-primary shadow-lg shadow-primary/20 active:scale-[0.98]'
                    }
                  `}
                >
                  {loading ? (
                    <><FontAwesomeIcon icon={faSpinner} spin /> Đang xác thực...</>
                  ) : (
                    'Xác nhận'
                  )}
                </button>
              </div>

              {/* Resend Section */}
              <div className="text-center mt-8 space-y-2">
                <p className="text-on-surface-variant text-sm font-medium">
                  Không nhận được mã?
                </p>
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className={`
                    inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all
                    ${cooldown > 0 || resending
                      ? 'text-outline cursor-not-allowed'
                      : 'text-primary hover:bg-primary/5 active:scale-[0.98]'
                    }
                  `}
                >
                  <FontAwesomeIcon icon={resending ? faSpinner : faRotateRight} spin={resending} />
                  {resending
                    ? 'Đang gửi...'
                    : cooldown > 0
                    ? `Gửi lại sau ${cooldown}s`
                    : 'Gửi lại mã'
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
