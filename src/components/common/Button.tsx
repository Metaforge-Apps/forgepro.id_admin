import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Reusable Button Component — ForgePro.id
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#D9B06F]/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-semibold',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    // Tombol emas khas ForgePro.id
    primary:
      'bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] active:bg-[#C49B5A] shadow-sm',
    // Tombol dark border seperti pada tombol 'Masuk' di figma login
    dark:
      'bg-[#111A2C] text-[#F7F5F0] border border-[#2B3952] hover:border-[#D9B06F] hover:bg-[#292F45] active:bg-[#0E1524]',
    // Tombol outline emas
    outline:
      'bg-transparent text-[#D9B06F] border border-[#D9B06F] hover:bg-[#D9B06F]/10 active:bg-[#D9B06F]/20',
    // Ghost
    ghost:
      'bg-transparent text-content-secondary hover:bg-surface-hover hover:text-content-primary',
    // Danger
    danger:
      'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 active:bg-red-500/30',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.primary}
        ${widthStyle}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;
