import React, { memo } from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = memo(({ children, title, subtitle, actions, className = '', padding = 'md', onClick }) => {
  const pads = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <div
      className={`card ${pads[padding]} ${onClick ? 'cursor-pointer hover:shadow-card-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-600 text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
