import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';
import { api } from '@/api';
import { API_CONFIG } from '@/config';
import { useSessionStore } from '@/store/sessionStore';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { MIN_PARTICIPANTS, MAX_PARTICIPANTS, PRICE_TIERS } from '@/utils/constants';
import { MOCK_EXTRA_PARTICIPANTS } from '@/api/mock';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AVATAR_COLORS = [
  'bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400',
  'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-violet-400',
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function dedupeByNickname(list = []) {
  const seen = new Set();
  return list.filter((p) => {
    const key = (p?.nickname || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ParticipantAvatar({ name, isHost, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-10 h-10 text-xs' : size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm';
  return (
    <div className="relative">
      <div className={`${sizeClass} rounded-full ${getAvatarColor(name)} flex items-center justify-center font-black text-white shadow-sm select-none`}>
        {getInitials(name)}
      </div>
      {isHost && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow border-2 border-white">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 10 }}>star</span>
        </div>
      )}
    </div>
  );
}

function ParticipantCard({ name, isHost, isYou }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
      isHost
        ? 'bg-primary/5 border-2 border-primary/30'
        : 'bg-white border border-outline/40'
    }`}>
      <ParticipantAvatar name={name} isHost={isHost} />
      <p className={`font-bold text-sm truncate max-w-full ${isHost ? 'text-primary' : 'text-on-surface'}`}>
        {name}
        {isYou && <span className="text-[10px] font-normal text-on-surface-variant ml-1">(bạn)</span>}
      </p>
      {isHost && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-[10px] font-black uppercase rounded-full">
          <span className="material-symbols-outlined" style={{ fontSize: 10 }}>star</span>
          Host
        </span>
      )}
    </div>
  );
}

export default function LobbyPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants = [], setParticipants, reset } = useSessionStore();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [copied, setCopied] = useState(false);

  const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 phút

  // Tính countdown
  useEffect(() => {
    if (!sessionInfo?.createdAt) return;
    const tick = () => {
      const elapsed = Date.now() - new Date(sessionInfo.createdAt).getTime();
      const remaining = Math.max(0, SESSION_DURATION_MS - elapsed);
      setTimeLeft(Math.floor(remaining / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionInfo?.createdAt]);

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
      const apiParticipants = infoData.participants || [];
      const existingHost = apiParticipants.find((p) => p.isHost);
      const existingOthers = apiParticipants.filter((p) => !p.isHost);
      if (API_CONFIG.USE_MOCK) {
        const merged = dedupeByNickname([
          ...(existingHost ? [existingHost] : [{ id: 'mock-host', nickname: 'Bạn', isHost: true }]),
          ...existingOthers,
          ...MOCK_EXTRA_PARTICIPANTS,
        ]);
        setParticipants(merged.slice(0, MAX_PARTICIPANTS));
      } else {
        setParticipants(apiParticipants);
      }
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
      // In mock mode, add fake participants into mock session before start.
      if (API_CONFIG.USE_MOCK) {
        const existingNames = new Set(
          (sessionInfo?.participants || []).map((p) => (p.nickname || '').trim().toLowerCase())
        );
        for (const p of MOCK_EXTRA_PARTICIPANTS) {
          const key = (p.nickname || '').trim().toLowerCase();
          if (!existingNames.has(key)) {
            await api.sessions.join(pin, { nickname: p.nickname });
            existingNames.add(key);
          }
        }
      }

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
    setShowCancelModal(false);
    try {
      await api.sessions.cancel(pin);
    } catch {
      // ignore API errors on cancel
    }
    reset();
    navigate('/');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${pin}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      message.success('Đã copy link!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const formatTime = (seconds) => {
    if (seconds == null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const priceTier = sessionInfo?.priceTier
    ? PRICE_TIERS.find((t) => t.key === sessionInfo.priceTier)
    : null;

  const safeParticipants = Array.isArray(participants) ? participants : [];
  const enough = safeParticipants.length >= MIN_PARTICIPANTS;
  const slotsLeft = MAX_PARTICIPANTS - safeParticipants.length;

  const hostName = safeParticipants.find((p) => p.isHost)?.nickname || 'Host';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />
      <main className="flex-grow pt-28 container mx-auto px-6 py-10 max-w-3xl">

        {/* Decorative blobs */}
        <div className="absolute top-20 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-semibold">Đang kết nối...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">

            {/* ── Top: PIN + Timer ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">Mã PIN</p>
                <div className="flex gap-2">
                  {pin.split('').map((digit, i) => (
                    <div
                      key={i}
                      className="w-10 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-xl font-black font-headline shadow-lg shadow-primary/20"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Session info + timer */}
              <div className="flex flex-col items-end gap-2">
                {/* Collection + price pills */}
                <div className="flex flex-wrap gap-2 justify-end">
                  {sessionInfo?.collectionName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-outline/50 rounded-full text-xs font-semibold text-on-surface shadow-sm">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      {sessionInfo.collectionName}
                    </span>
                  )}
                  {priceTier && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-outline/50 rounded-full text-xs font-semibold text-on-surface shadow-sm">
                      <span className="material-symbols-outlined text-primary text-sm">payments</span>
                      {priceTier.priceDisplay}
                    </span>
                  )}
                </div>
                {/* Timer */}
                {timeLeft != null && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                    timeLeft < 180
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-white text-on-surface-variant border border-outline/50'
                  }`}>
                    <span className="material-symbols-outlined text-sm">timer</span>
                    Hết hạn trong {formatTime(timeLeft)}
                  </div>
                )}
              </div>
            </div>

            {/* ── Invite section ── */}
            <div className="bg-white border border-outline/50 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">group_add</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">Mời đồng nghiệp</p>
                    <p className="text-xs text-on-surface-variant">Chia sẻ mã PIN hoặc link bên dưới</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                    copied
                      ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                      : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {copied ? 'check_circle' : 'content_copy'}
                  </span>
                  {copied ? 'Đã copy!' : 'Copy link mời'}
                </button>
              </div>
            </div>

            {/* ── Participants ── */}
            <div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline font-extrabold text-on-surface text-lg tracking-tight">Người tham gia</h2>
                  {/* Host label */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                    <span className="material-symbols-outlined" style={{ fontSize: 10 }}>star</span>
                    Host: {hostName}
                  </span>
                </div>
                {/* Count badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${
                  enough
                    ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className="material-symbols-outlined text-base">{enough ? 'check_circle' : 'hourglass_empty'}</span>
                  {safeParticipants.length}/{MAX_PARTICIPANTS}
                  {enough ? ' — Sẵn sàng!' : ` — Cần thêm ${MIN_PARTICIPANTS - safeParticipants.length} người`}
                </div>
              </div>

              {/* Grid */}
              {safeParticipants.length === 0 ? (
                <div className="text-center py-16 bg-white border-2 border-dashed border-outline/60 rounded-2xl">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl mb-4 block">person_add</span>
                  <p className="font-bold text-on-surface mb-1">Chưa có ai tham gia</p>
                  <p className="text-sm text-on-surface-variant">Chia sẻ mã PIN để mời đồng nghiệp nhé!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {safeParticipants.map((p, i) => (
                    <ParticipantCard
                      key={p.id || p.nickname + i}
                      name={p.nickname}
                      isHost={p.isHost}
                    isYou={p.nickname === 'Bạn' || p.isHost}
                    />
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, Math.min(slotsLeft, 4)) }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-outline/40 bg-surface-container/20 opacity-60"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-outline bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">person_add</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-semibold">Chờ...</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Min requirement warning */}
              {!enough && (
                <div className="mt-4 flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="material-symbols-outlined text-amber-600">info</span>
                  <p className="text-sm font-semibold text-amber-800">
                    Cần tối thiểu <strong>{MIN_PARTICIPANTS} người</strong> để bắt đầu bình chọn ({safeParticipants.length}/{MIN_PARTICIPANTS})
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer: Start + Cancel ── */}
            <div className="space-y-3">
              <button
                onClick={handleStart}
                disabled={!enough || starting}
                className={`w-full py-5 rounded-full font-headline font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-2xl ${
                  !enough || starting
                    ? 'bg-outline/40 text-white/50 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark active:scale-[0.99] shadow-primary/30'
                }`}
              >
                {starting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang bắt đầu...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">how_to_vote</span>
                    BẮT ĐẦU BÌNH CHỌN
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 text-center text-sm font-semibold text-on-surface-variant hover:text-red-500 transition-colors"
              >
                Hủy phiên này
              </button>
            </div>
          </div>
        )}
      </main>

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

      <Footer />
    </div>
  );
}
