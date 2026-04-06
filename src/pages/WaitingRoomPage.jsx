import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { api } from '@/api';
import { useSessionStore } from '@/store/sessionStore';
import { useSession } from '@/hooks/useSession';
import { useReconnect } from '@/hooks/useReconnect';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserGroup, faCircleNotch, 
  faUserClock, faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';

export default function WaitingRoomPage() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const { participants, isHost } = useSessionStore();
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.sessions.getStatus(pin);
      const data = res.data;
      if (data.error) {
        message.error(data.error.message);
        navigate('/');
        return;
      }
      if (data.status === 'voting') {
        navigate(`/vote/${pin}`);
      } else if (data.status === 'results') {
        navigate(`/results/${pin}`);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  }, [pin, navigate]);

  useSession({ pin, onStatus: fetchStatus, enabled: true });
  useReconnect({ onReconnect: fetchStatus, enabled: true });

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

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
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Header title="LunchSync Lobby" />
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-24 pb-32 max-w-2xl mx-auto w-full relative">
        
        {/* Decorative blobs */}
        <div className="absolute top-40 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-40 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="w-full space-y-8">
          {/* Header Area */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-on-surface-variant font-bold text-xs uppercase tracking-widest border border-outline/10">
              <FontAwesomeIcon icon={faUserClock} className="text-primary" />
              Phòng chờ
            </div>
            <h1 className="text-3xl sm:text-4xl font-headline font-black text-on-surface tracking-tight">
              Chờ mọi người tham gia
            </h1>
            <p className="text-on-surface-variant font-medium">Bữa trưa sẽ bắt đầu khi đủ người.</p>
          </div>

          {/* PIN Card */}
          <div className="bg-white border border-outline/30 rounded-3xl p-8 shadow-sm text-center space-y-4">
             <p className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">Mã PIN của phiên</p>
             <div className="flex justify-center gap-2">
                {pin.split('').map((digit, i) => (
                  <div key={i} className="w-12 h-14 bg-primary text-white rounded-xl flex items-center justify-center text-2xl font-black font-headline shadow-lg shadow-primary/20">
                    {digit}
                  </div>
                ))}
             </div>
          </div>

          {/* Participants section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUserGroup} className="text-primary" />
                <h2 className="font-headline font-extrabold text-on-surface text-lg tracking-tight">Người tham gia</h2>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">
                {participants.length} Thành viên
              </span>
            </div>

            {loading ? (
              <div className="bg-white border border-outline/20 rounded-2xl p-12 text-center space-y-4">
                <FontAwesomeIcon icon={faCircleNotch} className="text-primary text-4xl animate-spin" />
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Đang tải...</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="bg-white border border-outline/20 rounded-2xl p-12 text-center border-dashed">
                <p className="text-on-surface-variant font-medium italic">Chưa có ai tham gia</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {participants.map((p) => (
                  <div key={p.id || p.nickname} className="flex items-center gap-3 p-3 bg-white border border-outline/20 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-black text-sm">
                      {p.nickname[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-on-surface text-sm truncate">{p.nickname}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hint */}
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <FontAwesomeIcon icon={faInfoCircle} className="text-primary" />
            <p className="text-sm font-semibold text-primary/80 italic">Chờ host bắt đầu bình chọn...</p>
          </div>

          {/* Host action (Optional button) */}
          {isHost && (
            <button
              onClick={handleStart}
              className="w-full py-5 bg-primary text-white rounded-full font-headline font-extrabold text-base shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95"
            >
              BẮT ĐẦU NGAY
            </button>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
