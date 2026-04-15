import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JoinModal from '@/components/modals/JoinModal';
import { useSessionStore } from '@/store/sessionStore';

export default function JoinPage() {
  const navigate = useNavigate();
  const { pin } = useParams();
  const { pin: savedPin, participantId: savedParticipantId } = useSessionStore();

  // Restore: nếu đã có participantId với cùng PIN → auto-redirect waiting
  useEffect(() => {
    if (pin && savedPin === pin && savedParticipantId) {
      navigate(`/lobby/${pin}`, { replace: true });
    }
  }, [pin, savedPin, savedParticipantId, navigate]);

  const handleClose = () => {
    navigate('/', { replace: true });
  };

  // For direct /join URL (no pin) redirect to home
  if (!pin) {
    navigate('/', { replace: true });
    return null;
  }

  return <JoinModal open={true} defaultPin={pin} onClose={handleClose} />;
}
