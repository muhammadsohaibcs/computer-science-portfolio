import React from 'react';

type BadgeVariant = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'orange' | 'teal';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  blue:   'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  green:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  red:    'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800',
  yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
  gray:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
  teal:   'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
};

const dotColors: Record<BadgeVariant, string> = {
  blue: 'bg-blue-500', green: 'bg-emerald-500', red: 'bg-red-500', yellow: 'bg-amber-500',
  purple: 'bg-purple-500', gray: 'bg-slate-400', orange: 'bg-orange-500', teal: 'bg-teal-500',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', dot = false, className = '' }) => (
  <span className={`badge ${variants[variant]} ${className}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />}
    {children}
  </span>
);

export default Badge;
