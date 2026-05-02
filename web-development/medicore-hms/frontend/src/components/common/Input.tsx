import React, { memo } from 'react';

interface InputProps {
  label?: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
  step?: string;
  autoComplete?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input: React.FC<InputProps> = memo(({
  label, name, type = 'text', value, onChange, error, hint, required = false,
  placeholder, disabled = false, className = '', min, max, step, autoComplete, prefix, suffix,
}) => {
  const id = `input-${name}`;
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
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          id={id} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} required={required}
          min={min} max={max} step={step} autoComplete={autoComplete}
          aria-required={required} aria-invalid={!!error} aria-describedby={error ? errorId : undefined}
          className={`field ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''} ${error ? 'field-error' : ''}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
