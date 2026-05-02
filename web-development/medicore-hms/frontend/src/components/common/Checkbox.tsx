import { Check } from 'lucide-react';
import React, { memo } from 'react';

interface CheckboxProps {
  label?: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = memo(({ label, name, checked, onChange, disabled, className = '' }) => (
  <label className={`flex items-center gap-2.5 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
    <div className="relative flex-shrink-0">
      <input
        type="checkbox" name={name} id={`cb-${name}`} checked={checked} onChange={onChange}
        disabled={disabled} className="sr-only peer"
      />
      <div className={`
        w-4.5 h-4.5 w-[18px] h-[18px] rounded border-2 transition-all duration-150 flex items-center justify-center
        ${checked ? 'bg-brand-600 border-brand-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}
        peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1
        group-hover:border-brand-500
      `}>
        {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
      </div>
    </div>
    {label && <span className="text-sm text-slate-700 dark:text-slate-300 select-none">{label}</span>}
  </label>
));

Checkbox.displayName = 'Checkbox';
export default Checkbox;
