import { useEffect } from 'react';
import { useToastStore } from '@/store/toastStore';
import { Check, X } from 'lucide-react';

function ToastItem({ id, message, type }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), 2500);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed top-24 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-semibold animate-slide-down pointer-events-none ${
        isSuccess
          ? 'bg-emerald-500 text-white'
          : 'bg-rose-500 text-white'
      }`}
      style={{ left: '50%', transform: 'translateX(-50%)' }}
    >
      {isSuccess ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <>
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </>
  );
}
