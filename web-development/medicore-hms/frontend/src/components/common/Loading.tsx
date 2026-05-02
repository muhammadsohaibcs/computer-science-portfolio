import { Loader2 } from 'lucide-react';
import React, { memo } from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = memo(({ size = 'md', text, fullScreen = false }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-9 h-9', lg: 'w-12 h-12' };
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 animate-fade-in">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-brand-100 dark:border-brand-900`} />
        <Loader2 className={`${sizes[size]} text-brand-600 dark:text-brand-400 animate-spin absolute inset-0`} />
      </div>
      {text && <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
  if (fullScreen) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50" role="status">
      {content}
    </div>
  );
  return <div className="flex items-center justify-center py-16" role="status">{content}</div>;
});

Loading.displayName = 'Loading';
export default Loading;
