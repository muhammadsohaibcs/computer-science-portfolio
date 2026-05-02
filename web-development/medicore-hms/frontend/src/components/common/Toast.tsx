import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const configs = {
  success: { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/80', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-200', iconCls: 'text-emerald-500' },
  error:   { icon: XCircle,       bg: 'bg-red-50 dark:bg-red-950/80',       border: 'border-red-200 dark:border-red-800',       text: 'text-red-800 dark:text-red-200',       iconCls: 'text-red-500' },
  warning: { icon: AlertCircle,   bg: 'bg-amber-50 dark:bg-amber-950/80',   border: 'border-amber-200 dark:border-amber-800',   text: 'text-amber-800 dark:text-amber-200',   iconCls: 'text-amber-500' },
  info:    { icon: Info,           bg: 'bg-blue-50 dark:bg-blue-950/80',     border: 'border-blue-200 dark:border-blue-800',     text: 'text-blue-800 dark:text-blue-200',     iconCls: 'text-blue-500' },
};

const Toast: React.FC<ToastProps> = ({ message, type, duration = 4500, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const t = setTimeout(onClose, duration);
      return () => clearTimeout(t);
    }
  }, [duration, onClose]);

  const c = configs[type];
  const Icon = c.icon;

  return (
    <div
      role="alert" aria-live="assertive"
      className={`
        fixed bottom-5 right-5 z-[9999] flex items-start gap-3 p-4 pr-5
        rounded-xl border shadow-modal max-w-sm w-full
        ${c.bg} ${c.border}
        animate-toast-in
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.iconCls}`} />
      <p className={`flex-1 text-sm font-500 leading-snug ${c.text}`}>{message}</p>
      <button onClick={onClose} className={`flex-shrink-0 ${c.iconCls} hover:opacity-70 transition-opacity -mt-0.5`} aria-label="Close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
