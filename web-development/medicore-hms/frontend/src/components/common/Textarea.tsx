import React, { memo } from 'react';

interface TextareaProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = memo(({
  label, name, value, onChange, error, required = false,
  placeholder, disabled = false, rows = 3, className = '',
}) => {
  const id = `textarea-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={id} name={name} value={value} onChange={onChange} placeholder={placeholder}
        disabled={disabled} required={required} rows={rows}
        aria-required={required} aria-invalid={!!error} aria-describedby={error ? errorId : undefined}
        className={`field resize-y min-h-[80px] ${error ? 'field-error' : ''}`}
      />
      {error && <p id={errorId} className="text-xs text-red-500 dark:text-red-400" role="alert">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
