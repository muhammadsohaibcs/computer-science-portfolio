import { ChevronDown } from 'lucide-react';
import React, { memo } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = memo(({
  label, name, value, onChange, options, error, hint, required = false,
  disabled = false, placeholder = 'Select an option', className = '',
}) => {
  const id = `select-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id} name={name} value={value} onChange={onChange}
          disabled={disabled} required={required}
          aria-required={required} aria-invalid={!!error} aria-describedby={error ? errorId : undefined}
          className={`field appearance-none pr-8 ${error ? 'field-error' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      {error && <p id={errorId} className="text-xs text-red-500 dark:text-red-400" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
