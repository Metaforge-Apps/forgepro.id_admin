import React from 'react';
import {
  getStatusBadgeClasses,
  TONE_BADGE_CLASSES,
  type SemanticFeedbackTone,
} from '../../config/statusColors';

export interface BadgeProps {
  status?: string;
  label?: string;
  variant?: SemanticFeedbackTone | string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Reusable Badge / Status Pill Component (Fase 0: 0.4 & 0.5)
 * Mengikuti aturan warna semantik terpusat (Hijau = sukses/dibayar/tayang, Merah = gagal/dibatalkan/ditolak/kedaluwarsa/nonaktif, Kuning = menunggu/antre/perlu ditinjau, Biru/Abu = diproses/draf).
 */
export function Badge({
  status,
  label,
  variant,
  size = 'md',
  className = '',
}: BadgeProps) {
  const displayLabel = label || status || '';
  const lookupKey = status || label || variant || 'neutral';

  const styles =
    variant && variant in TONE_BADGE_CLASSES
      ? TONE_BADGE_CLASSES[variant as SemanticFeedbackTone]
      : getStatusBadgeClasses(lookupKey);

  const sizeClasses =
    size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium rounded-full border
        tracking-wide select-none transition-colors whitespace-nowrap
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
