import { Inbox, LucideIcon } from 'lucide-react';
import React, { memo } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = memo(({ icon: Icon = Inbox, title = 'No data found', message, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in" role="status">
    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
      <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" aria-hidden="true" />
    </div>
    <h3 className="text-base font-600 text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs leading-relaxed">{message}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} variant="primary" size="sm">{actionLabel}</Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';
export default EmptyState;
