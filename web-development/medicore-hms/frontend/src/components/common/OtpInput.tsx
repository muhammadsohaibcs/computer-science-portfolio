import React, { memo, useEffect, useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = memo(({
  length = 6, value, onChange, error, disabled = false, autoFocus = false,
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = value.split('').slice(0, length);
    while (arr.length < length) arr.push('');
    return arr;
  });

  // sync internal digits → parent value
  useEffect(() => {
    onChange(digits.join(''));
  }, [digits]);

  // sync parent value → internal digits (e.g. on reset)
  useEffect(() => {
    if (!value) {
      setDigits(Array(length).fill(''));
      inputs.current[0]?.focus();
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (i: number, raw: string) => {
    const char = raw.replace(/[^0-9]/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[i] = char;
      return next;
    });
    if (char && i < length - 1) {
      setTimeout(() => inputs.current[i + 1]?.focus(), 0);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        setDigits(prev => { const n = [...prev]; n[i] = ''; return n; });
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        setDigits(prev => { const n = [...prev]; n[i - 1] = ''; return n; });
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    pasted.split('').forEach((c, idx) => { next[idx] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, length - 1);
    setTimeout(() => inputs.current[focusIdx]?.focus(), 0);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <React.Fragment key={i}>
            <input
              ref={el => { inputs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1}
              value={d} disabled={disabled}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onFocus={e => e.target.select()}
              aria-label={`OTP digit ${i + 1}`}
              className={`
                w-11 h-12 text-center text-lg font-700 rounded-xl border-2 transition-all duration-150
                bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900
                disabled:opacity-50 disabled:cursor-not-allowed
                ${d ? 'border-brand-400 dark:border-brand-600 bg-brand-50 dark:bg-brand-950/50' : 'border-slate-200 dark:border-slate-700'}
                ${error ? 'border-red-400 dark:border-red-600' : ''}
              `}
            />
            {i === 2 && (
              <span className="text-slate-300 dark:text-slate-600 font-600 text-sm select-none">—</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {error && (
        <p className="text-center text-xs text-red-500 dark:text-red-400" role="alert">{error}</p>
      )}
    </div>
  );
});

OtpInput.displayName = 'OtpInput';
export default OtpInput;
