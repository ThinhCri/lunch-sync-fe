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
            <p className="font-bold text-on-surface text-lg">{p.nickname} {isYou && '(bạn)'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Guest
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

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 phút

export default function LobbyPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants = [], setParticipants, sessionId, participantId, nickname, isHost, shareLink, reset } = useSessionStore();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
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
        return 0; // maintain original order for other guests
      });
      setParticipants(apiParticipants);

      if (infoData.status === 'voting') {
        navigate(`/vote/${pin}`);
      }
    } catch (err) {
      console.error('[Lobby] fetchStatus error:', err);
    } finally {
      setLoading(false);
    }
  }, [pin, sessionId, navigate, setParticipants]);

  useSession({ pin, onStatus: fetchStatus, interval: 2000, enabled: true });
  useReconnect({ onReconnect: fetchStatus, enabled: true });

  // Security check: if not in session, push to join
  useEffect(() => {
    if (!participantId && !sessionId) {
      navigate(`/join/${pin}`, { replace: true });
    }
  }, [pin, participantId, sessionId, navigate]);

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



  const handleCopyPin = () => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopied(true);
      message.success('Đã copy mã phòng!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyShareLink = () => {
    const link = shareLink || `${window.location.origin}/join/${pin}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      message.success('Đã copy link chia sẻ!');
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  const shareUrl = shareLink || `${window.location.origin}/join/${pin}`;

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
                  onClick={handleCopyPin}
                  className="bg-primary-container/20 p-2 rounded-full text-primary hover:bg-primary-container/40 transition-colors"
                  title="Copy Mã PIN"
                >
                  <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
              {/* Share Section */}
              <div className="pt-2">
                <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">link</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-on-surface leading-tight">Mời bạn bè tham gia</p>
                      <p className="text-xs text-on-surface-variant">Sao chép đường dẫn và gửi cho mọi người</p>
                    </div>
                  </div>

                  {/* URL display + copy button */}
                  <div className="flex items-center gap-2 bg-surface-container p-1 pl-4 rounded-xl border border-outline-variant/30">
                    <span className="material-symbols-outlined text-base text-on-surface-variant shrink-0">public</span>
                    <p className="flex-1 text-xs text-on-surface-variant truncate font-mono select-all">{shareUrl}</p>
                    <button
                      onClick={handleCopyShareLink}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 active:scale-95 ${
                        linkCopied
                          ? 'bg-emerald-500 text-white'
                          : 'bg-primary text-on-primary hover:opacity-90'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{linkCopied ? 'check' : 'content_copy'}</span>
                      <span className="whitespace-nowrap">{linkCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
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
                  <p className="font-bold text-on-surface">{sessionInfo?.priceDisplay || priceTier?.priceDisplay || 'Tùy chọn'}</p>
                </div>
              </div>
            </section>

            {/* Participants Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-headline">Thành viên ({sessionInfo?.participantCount || 0})</h2>
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
            <section className="space-y-4 pt-4">
              {isHost ? (
                <button 
                  onClick={handleStart}
                  disabled={!enough || starting}
                  className={`w-full h-16 rounded-full font-headline font-bold text-lg transition-transform ${(!enough || starting) ? 'bg-primary/50 text-white/70 cursor-not-allowed' : 'bg-primary text-on-primary shadow-xl shadow-primary/20 active:scale-95'}`}
                >
                  {starting ? 'Đang chuẩn bị...' : 'Bắt đầu bình chọn'}
                </button>
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
