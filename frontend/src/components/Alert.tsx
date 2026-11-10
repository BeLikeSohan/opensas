interface AlertProps {
  variant: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

function Alert({ variant, message, onClose }: AlertProps) {
  return (
    <div className={`alert alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="বন্ধ করুন">
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
