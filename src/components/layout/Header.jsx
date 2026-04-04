import { useNavigate } from 'react-router-dom';

export default function Header({ title = "LunchSync", rightContent = null }) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_4px_16px_rgba(44,47,48,0.03)] border-b border-outline-variant/10 cursor-pointer" onClick={() => navigate('/')}>
      <div className="flex items-center justify-between px-6 py-4 w-full relative">
        {rightContent ? (
          <>
            <div className="w-1/3"></div>
            <div className="flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              <span className="font-headline font-black tracking-tighter text-xl text-orange-700 dark:text-orange-500">{title}</span>
            </div>
            <div className="flex justify-end w-1/3" onClick={(e) => e.stopPropagation()}>
              {rightContent}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              <span className="font-headline font-black tracking-tighter text-xl text-orange-700 dark:text-orange-500">{title}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
