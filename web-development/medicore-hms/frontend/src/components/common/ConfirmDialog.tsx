import { AlertTriangle, HelpCircle } from 'lucide-react';
import React from 'react';
import Button from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title = 'Confirm Action', message,
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', loading = false,
}) => {
  const icons = { danger: AlertTriangle, warning: AlertTriangle, info: HelpCircle };
  const iconColors = { danger: 'text-red-500', warning: 'text-amber-500', info: 'text-brand-500' };
  const btnVariants = { danger: 'danger' as const, warning: 'primary' as const, info: 'primary' as const };
  const Icon = icons[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 dark:bg-red-950' : variant === 'warning' ? 'bg-amber-50 dark:bg-amber-950' : 'bg-brand-50 dark:bg-brand-950'}`}>
          <Icon className={`w-7 h-7 ${iconColors[variant]}`} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full mt-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            {cancelText}
          </Button>
          <Button variant={btnVariants[variant]} onClick={onConfirm} loading={loading} disabled={loading} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
