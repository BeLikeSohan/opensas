import type { ToastData } from '../hooks/useToast';

interface ToastProps {
  toast: ToastData;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const ok = toast.variant === 'ok';

  return (
    <div className={`toast toast--${toast.variant}`} role={ok ? 'status' : 'alert'}>
      {ok ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7DD3A6" strokeWidth="2.2" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A12C2C" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5.5M12 16.5v.5" />
        </svg>
      )}
      <div className="toast__body">
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      <button type="button" className="toast__close" onClick={onClose} aria-label="বন্ধ করুন">
        ×
      </button>
    </div>
  );
}

export default Toast;
