import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { parseApiError } from '@/utils/error';
import { MIN_PARTICIPANTS, MAX_PARTICIPANTS, formatPriceDisplay } from '@/utils/constants';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { Copy, Check, Link, Globe, MapPin, Banknote, X } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ParticipantCard({ p, isYou }) {
  const isHost = p.isHost;
  const initials = getInitials(p.nickname);

  if (isHost) {
    return (
      <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-lg border-2 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-4 border-primary shadow-lg flex items-center justify-center bg-primary-container text-primary font-bold text-xl">{initials}</div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white">HOST</div>
          </div>
          <div>
            <p className="font-bold text-on-surface text-lg">{p.nickname} {isYou && '(bạn)'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-surface-container-lowest/50 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant font-bold text-lg">{initials}</div>
        <div>
          <p className="font-bold text-on-surface text-lg">{p.nickname} {isYou && '(bạn)'}</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, title, message: msg, confirmText, cancelText, onConfirm, onCancel, danger, alwaysClosable }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      {alwaysClosable && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onCancel} />}
      <div className="relative bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in pointer-events-auto">
        <h3 className="font-headline font-bold text-lg text-on-surface mb-2">{title}</h3>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{msg}</p>
        <div className="flex gap-3">
          {cancelText && (
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-full font-headline font-semibold text-sm bg-surface-container text-on-surface hover:bg-surface-container-high active:scale-95 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 h-12 rounded-full font-headline font-semibold text-sm text-white active:scale-95 transition-all ${
              danger
                ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LobbyPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants = [], setParticipants, sessionId, participantId, nickname, isHost, shareLink, reset } = useSessionStore();
  const { isAuthenticated } = useAuthStore();
  const { show } = useToastStore();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const expiredShownRef = useRef(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  const showExpiredModal = useCallback((reason) => {
    if (expiredShownRef.current) return;
    expiredShownRef.current = true;
    const loggedIn = isAuthenticated();
    setConfirmDialog({
      open: true,
      title: 'Phiên đã kết thúc',
      message: reason,
      confirmText: loggedIn ? 'Tạo phiên mới' : 'Tham gia phòng khác',
      cancelText: null,
      danger: false,
      onConfirm: () => {
        setConfirmDialog({ open: false });
        reset();
        navigate(loggedIn ? '/create' : '/', { replace: true });
      },
    });
  }, [reset, navigate, isAuthenticated]);

  const fetchStatus = useCallback(async () => {
    if (expiredShownRef.current) return;
    if (!pin || !sessionId) {
      console.warn('[Lobby] Missing pin or sessionId — skipping poll', { pin, sessionId });
      setLoading(false);
      return;
    }
    try {
      const statusRes = await api.sessions.getStatus(pin, sessionId);
      const currentStatus = statusRes.data?.status;

      if (currentStatus === 'cancelled' || currentStatus === 'expired' || currentStatus === 'completed') {
        const reasons = {
          cancelled: 'Phiên này đã bị hủy bởi chủ phòng.',
          expired: 'Phiên đã hết hạn do quá thời gian chờ.',
          completed: 'Phiên này đã kết thúc.',
        };
        showExpiredModal(reasons[currentStatus] || 'Phiên không còn hoạt động.');
        return;
      }
      if (currentStatus === 'voting') {
        navigate(`/vote/${pin}`);
        return;
      }

      const infoRes = await api.sessions.getInfo(pin, sessionId);
      const infoData = infoRes.data;

      setSessionInfo({
        ...infoData,
        collectionName: infoData.collection_name,
        priceDisplay: infoData.price_display,
        participantCount: infoData.participant_count,
      });

      const apiParticipants = (infoData.participants || []).map(p => ({
        ...p,
        isHost: p.is_host,
      })).sort((a, b) => {
        if (a.isHost) return -1;
        if (b.isHost) return 1;
        return 0;
      });
      setParticipants(apiParticipants);
    } catch (err) {
      console.error('[Lobby] fetchStatus caught error:', err);
      const httpStatus = err?.status ?? err?.response?.status;
      const isExpiredCode = err?.code === 'SESSION_NOT_FOUND' || err?.code === 'SESSION_EXPIRED';

      if (httpStatus || isExpiredCode) {
        const msg = httpStatus === 404
          ? 'Mã phòng không còn tồn tại. Phiên có thể đã bị hủy hoặc hết hạn.'
          : httpStatus === 410
          ? 'Phiên này đã bị đóng bởi chủ phòng hoặc hệ thống.'
          : 'Phiên không còn hoạt động.';
        showExpiredModal(msg);
      } else {
        showExpiredModal('Không thể kết nối tới phiên. Phiên có thể đã kết thúc.');
      }
    } finally {
      setLoading(false);
    }
  }, [pin, sessionId, navigate, setParticipants, showExpiredModal]);

  useSession({ pin, onStatus: fetchStatus, interval: 2000, enabled: !expiredShownRef.current });
  useReconnect({ onReconnect: fetchStatus, enabled: true });

  useEffect(() => {
    if (!participantId && !sessionId && !expiredShownRef.current) {
      navigate(`/join/${pin}`, { replace: true });
    }
  }, [pin, participantId, sessionId, navigate]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStart = async () => {
    if (!enough) return;
    setStarting(true);
    try {
      const res = await api.sessions.start(pin);
      if (res.data.status === 'voting') {
        navigate(`/vote/${pin}`);
      }
    } catch (err) {
      show(parseApiError(err).message, 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleCancel = () => {
    setConfirmDialog({
      open: true,
      title: 'Hủy phòng chờ?',
      message: 'Tất cả thành viên sẽ bị đưa ra khỏi phiên. Hành động này không thể hoàn tác.',
      confirmText: 'Hủy phòng',
      cancelText: 'Giữ lại',
      danger: true,
      onConfirm: async () => {
        setConfirmDialog({ open: false });
        try {
          await api.sessions.cancel(pin);
          show('Đã hủy phòng thành công.');
          expiredShownRef.current = true;
          reset();
          navigate('/create', { replace: true });
        } catch (err) {
          show(parseApiError(err).message, 'error');
        }
      },
      onCancel: () => setConfirmDialog({ open: false }),
    });
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopied(true);
      show('Đã copy mã phòng!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyShareLink = () => {
    const link = shareLink || `${window.location.origin}/join/${pin}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      show('Đã copy link chia sẻ!');
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  const shareUrl = shareLink || `${window.location.origin}/join/${pin}`;

  const priceDisplay = sessionInfo?.priceDisplay
    ? formatPriceDisplay(sessionInfo.priceDisplay)
    : '';

  const safeParticipants = Array.isArray(participants) ? participants : [];
  const enough = safeParticipants.length >= MIN_PARTICIPANTS;

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body selection:bg-primary-container selection:text-on-primary-container">
      <Header title="LunchSync" />
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel || (() => setConfirmDialog({ open: false }))}
        danger={confirmDialog.danger}
        alwaysClosable={!!confirmDialog.cancelText}
      />
      <main className="max-w-xl mx-auto px-6 pt-24 space-y-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-semibold">Đang tải sảnh...</p>
          </div>
        ) : (
          <>
            {/* PIN Code Section */}
            <section className="text-center space-y-4">
              <p className="text-on-surface-variant font-label text-sm tracking-widest uppercase">Mã phòng chờ</p>
              <div className="inline-flex items-center gap-4 bg-surface-container-lowest px-8 py-6 rounded-xl shadow-[0_4px_16px_rgba(44,47,48,0.04)] group">
                <span className="text-4xl font-extrabold tracking-[0.2em] text-primary font-headline">{pin}</span>
                <button
                  onClick={handleCopyPin}
                  className={`p-2 rounded-full transition-colors ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-primary-container/20 text-primary hover:bg-primary-container/40'
                  }`}
                  title="Copy Mã PIN"
                >
                  {copied ? <Check /> : <Copy />}
                </button>
              </div>
              {/* Share Section */}
              <div className="pt-2">
                <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Link className="text-xl" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-on-surface leading-tight">Mời bạn bè tham gia</p>
                      <p className="text-xs text-on-surface-variant">Sao chép đường dẫn và gửi cho mọi người</p>
                    </div>
                  </div>

                  {/* URL display + copy button */}
                  <div className="flex items-center gap-2 bg-surface-container p-1 pl-4 rounded-xl border border-outline-variant/30">
                    <Globe className="text-base text-on-surface-variant shrink-0" />
                    <p className="flex-1 text-xs text-on-surface-variant truncate font-mono select-all">{shareUrl}</p>
                    <button
                      onClick={handleCopyShareLink}
                      className={`shrink-0 p-2 rounded-full transition-colors ${
                        linkCopied
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : 'bg-primary-container/20 text-primary hover:bg-primary-container/40'
                      }`}
                      title="Copy link"
                    >
                      {linkCopied ? <Check className="text-base" /> : <Copy className="text-base" />}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Session Details Card */}
            <section className="bg-surface-container-low rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-headline">Chi tiết phiên ăn</h2>
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Sắp diễn ra</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1 text-on-surface-variant">
                    <MapPin className="text-[18px]" />
                    <span className="text-xs font-semibold">Khu vực</span>
                  </div>
                  <p className="font-bold text-on-surface truncate">{sessionInfo?.collectionName || 'Không xác định'}</p>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1 text-on-surface-variant">
                    <Banknote className="text-[18px]" />
                    <span className="text-xs font-semibold">Mức giá</span>
                  </div>
                  <p className="font-bold text-on-surface">{priceDisplay || 'Tùy chọn'}</p>
                </div>
              </div>
            </section>

            {/* Participants Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-headline">
                  Thành viên ({sessionInfo?.participantCount || 0}
                  <span className="text-xs text-on-surface-variant font-medium"> / {MAX_PARTICIPANTS}</span>)
                </h2>
                {safeParticipants.length >= MAX_PARTICIPANTS && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                    Đã đầy
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {safeParticipants.map((p, i) => (
                  <ParticipantCard key={p.id || p.nickname + i} p={p} isYou={p.nickname === nickname} />
                ))}
              </div>
              {!enough && (
                <p className="text-center text-xs text-on-surface-variant font-medium mt-2">Cần thêm {MIN_PARTICIPANTS - safeParticipants.length} người để có thể bắt đầu.</p>
              )}
            </section>

            {/* Action Buttons */}
            <section className="space-y-3 pt-4">
              {isHost ? (
                <>
                  <button
                    onClick={handleStart}
                    disabled={!enough || starting}
                    className={`w-full h-16 rounded-full font-headline font-bold text-lg transition-transform ${(!enough || starting) ? 'bg-primary/50 text-white/70 cursor-not-allowed' : 'bg-primary text-on-primary shadow-xl shadow-primary/20 active:scale-95'}`}
                  >
                    {starting ? 'Đang chuẩn bị...' : 'Bắt đầu bình chọn'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full h-12 rounded-full font-headline font-semibold text-sm text-rose-500 border border-rose-300/50 bg-rose-50/50 hover:bg-rose-100/60 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="text-base" />
                    Hủy phòng chờ
                  </button>
                </>
              ) : (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center space-y-2">
                  <div className="flex justify-center flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-headline font-bold text-primary">Đang chờ chủ phòng bắt đầu...</p>
                  </div>
                  <p className="text-xs text-on-surface-variant px-4">Khi chủ phòng nhấn bắt đầu, màn hình của bạn sẽ tự động chuyển sang phần bình chọn.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
