import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';
import { useSessionExit } from '@/hooks/useSessionReset';

export default function Header({ title = "LunchSync", rightContent = null }) {
  const navigate = useNavigate();
  const { pin, sessionId } = useSessionStore();
  const sessionExit = useSessionExit();

  const handleLogoClick = async () => {
    if (pin && sessionId) {
      await sessionExit();
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border-b border-outline/10 cursor-pointer select-none"
      style={{ paddingTop: 'var(--safe-area-inset-top)' }}
      onClick={handleLogoClick}
    >
      <div className="flex items-center justify-between px-6 py-4 w-full relative">
        {rightContent ? (
          <>
            <div className="w-1/3"></div>
            <div className="flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2">
              <svg
                className="text-primary w-6 h-6 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11 9H9V2H7V9H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
              </svg>
              <span className="font-headline font-black tracking-tighter text-xl text-primary whitespace-nowrap">{title}</span>
            </div>
            <div className="flex justify-end w-1/3" onClick={(e) => e.stopPropagation()}>
              {rightContent}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center gap-2">
              <svg
                className="text-primary w-6 h-6 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11 9H9V2H7V9H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
              </svg>
              <span className="font-headline font-black tracking-tighter text-xl text-primary whitespace-nowrap">{title}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
