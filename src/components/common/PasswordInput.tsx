import React, { useState, forwardRef, InputHTMLAttributes } from 'react';

export interface PasswordInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Reusable Password Input Component
 * Dilengkapi dengan teks toggle 'Tampilkan' / 'Sembunyikan' sesuai referensi Figma
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label = 'Password',
      error,
      helperText,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const inputId = id || 'password-input';

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-content-secondary select-none tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`
              w-full rounded-xl text-sm transition-all duration-200 outline-none
              bg-surface-input text-content-primary placeholder-content-muted/60
              border ${
                error
                  ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                  : 'border-border-input focus:border-[#D9B06F] focus:ring-1 focus:ring-[#D9B06F]/30'
              }
              py-3 pl-4 pr-24
              ${className}
            `}
            {...props}
          />

          {/* Tombol Tampilkan / Sembunyikan gaya Figma */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-xs font-medium text-content-muted hover:text-[#D9B06F] transition-colors focus:outline-none select-none py-1 px-1.5 rounded"
          >
            {showPassword ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>

        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-content-muted mt-0.5">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
