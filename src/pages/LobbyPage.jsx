import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';
import { api } from '@/api';
import { API_CONFIG } from '@/config';
import { useSessionStore } from '@/store/sessionStore';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import { MIN_PARTICIPANTS, MAX_PARTICIPANTS, PRICE_TIERS } from '@/utils/constants';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

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

function dedupeByNickname(list = []) {
  const seen = new Set();
  return list.filter((p) => {
    const key = (p?.nickname || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
            <p className="font-bold text-on-surface">{p.nickname} {isYou && '(bạn)'}</p>
            <p className="text-xs text-on-surface-variant">Đã sẵn sàng</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
    );
  }

  // Guest
  return (
    <div className="flex items-center justify-between bg-surface-container-lowest/50 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant font-bold text-lg">{initials}</div>
        <div>
          <p className="font-bold text-on-surface">{p.nickname} {isYou && '(bạn)'}</p>
          <p className="text-xs text-on-surface-variant">Đang chờ...</p>
        </div>
      </div>
      <span className="material-symbols-outlined text-outline-variant">hourglass_empty</span>
    </div>
  );
}

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 phút

export default function LobbyPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants = [], setParticipants, reset } = useSessionStore();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [infoRes, statusRes] = await Promise.all([
        api.sessions.getInfo(pin),
        api.sessions.getStatus(pin),
      ]);
      const infoData = infoRes.data;
      const statusData = statusRes.data;
      setSessionInfo(infoData);
      const apiParticipants = infoData.participants || [];
      setParticipants(apiParticipants);

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
      await api.sessions.start(pin);
      navigate(`/vote/${pin}`);
    } catch (err) {
      message.error(err.message || 'Không thể bắt đầu');
    } finally {
      setStarting(false);
    }
  };



  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${pin}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      message.success('Đã copy link!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const priceTier = sessionInfo?.priceTier
    ? PRICE_TIERS.find((t) => t.key === sessionInfo.priceTier)
    : null;

  const safeParticipants = Array.isArray(participants) ? participants : [];
  const enough = safeParticipants.length >= MIN_PARTICIPANTS;

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body selection:bg-primary-container selection:text-on-primary-container">
      <Header title="LunchSync Lobby" />

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
                  onClick={handleCopyLink}
                  className="bg-primary-container/20 p-2 rounded-full text-primary hover:bg-primary-container/40 transition-colors"
                >
                  <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
              <p className="text-on-surface-variant text-sm">Chia sẻ mã này để bạn bè cùng tham gia</p>
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
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="text-xs font-semibold">Khu vực</span>
                  </div>
                  <p className="font-bold text-on-surface truncate">{sessionInfo?.collectionName || 'Không xác định'}</p>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    <span className="text-xs font-semibold">Mức giá</span>
                  </div>
                  <p className="font-bold text-on-surface">{priceTier?.priceDisplay || 'Tùy chọn'}</p>
                </div>
              </div>
            </section>

            {/* Participants Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-headline">Thành viên ({safeParticipants.length})</h2>
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full border-2 border-surface bg-red-50 flex items-center justify-center text-[10px] font-bold text-primary">SYNC</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {safeParticipants.map((p, i) => (
                  <ParticipantCard key={p.id || p.nickname + i} p={p} isYou={p.nickname === 'Bạn' || p.isHost} />
                ))}
              </div>
              {!enough && (
                <p className="text-center text-xs text-on-surface-variant font-medium mt-2">Cần thêm {MIN_PARTICIPANTS - safeParticipants.length} người để có thể bắt đầu.</p>
              )}
            </section>

            {/* Action Buttons */}
            <section className="space-y-4 pt-4">
              <button 
                onClick={handleStart}
                disabled={!enough || starting}
                className={`w-full h-16 rounded-full font-headline font-bold text-lg transition-transform ${(!enough || starting) ? 'bg-primary/50 text-white/70 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-xl shadow-primary/20 active:scale-95'}`}
              >
                {starting ? 'Đang chuẩn bị...' : 'Bắt đầu bình chọn'}
              </button>
            </section>
          </>
        )}
      </main>



      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
