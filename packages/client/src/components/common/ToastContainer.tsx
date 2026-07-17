import { useToastStore } from '../../store/toast-store';
import { IconX } from './Icons';

export function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let bgClass: string;
        let borderClass: string;
        let textClass: string;

        switch (toast.type) {
          case 'success':
            bgClass = 'bg-black/90';
            borderClass = 'border-success/30';
            textClass = 'text-success';
            break;
          case 'error':
            bgClass = 'bg-black/90';
            borderClass = 'border-danger/30';
            textClass = 'text-danger';
            break;
          default: /* info */
            bgClass = 'bg-black/90';
            borderClass = 'border-white/10';
            textClass = 'text-cream';
            break;
        }

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto animate-slide-up
              flex items-start justify-between gap-3 px-4 py-3 rounded-lg
              border backdrop-blur-md shadow-2xl
              text-sm font-sans tracking-wide
              ${bgClass} ${borderClass} ${textClass}
            `}
            role="alert"
          >
            <span className="flex-1 min-w-0 pr-2">
              {typeof toast.message === 'string' ? (
                <span>{toast.message}</span>
              ) : (
                toast.message
              )}
            </span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="opacity-50 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              <IconX size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
