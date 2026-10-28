import React from 'react';

export interface BadgeProps {
  status?: string;
  label?: string;
  variant?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Reusable Badge / Status Pill Component
 * Sesuai gaya status di tabel Figma ForgePro.id
 */
export function Badge({
  status,
  label,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const normalized = (status || label || variant || '').toLowerCase();

  let styles =
    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  let displayLabel = label || status;

  if (
    normalized.includes('dibayar') ||
    normalized.includes('paid') ||
    normalized.includes('success')
  ) {
    styles =
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    displayLabel = label || 'Dibayar';
  } else if (
    normalized.includes('menunggu') ||
    normalized.includes('pending') ||
    normalized.includes('warning')
  ) {
    styles =
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    displayLabel = label || 'Menunggu';
  } else if (
    normalized.includes('diproses') ||
    normalized.includes('process') ||
    normalized.includes('info')
  ) {
    styles =
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    displayLabel = label || 'Diproses';
  } else if (
    normalized.includes('gagal') ||
    normalized.includes('failed') ||
    normalized.includes('error')
  ) {
    styles =
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    displayLabel = label || 'Gagal';
  } else if (normalized.includes('gold') || normalized.includes('accent')) {
    styles =
      'bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/40';
  }

  const sizeClasses =
    size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium rounded-full border
        tracking-wide select-none transition-colors
        ${sizeClasses}
        ${styles}
        ${className}
      `}
    >
      {displayLabel}
    </span>
  );
}

export default Badge;
