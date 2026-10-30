import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  TONE_BANNER_CLASSES,
  type SemanticFeedbackTone,
} from '../../config/statusColors';
import { BRAND_CONFIG } from '../../config/branding';

export interface AlertProps {
  variant?: SemanticFeedbackTone;
  title?: string;
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const ICONS: Record<SemanticFeedbackTone, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
  neutral: Info,
  accent: Info,
};

/**
 * Reusable Feedback Alert / Banner Component (Fase 0: 0.4 & 0.5)
 * Hijau = berhasil disimpan, Merah = dibatalkan / gagal simpan (dengan tombol "Coba lagi"), Kuning = peringatan.
 */
export function Alert({
  variant = 'info',
  title,
  message,
  onClose,
  onRetry,
  retryLabel = BRAND_CONFIG.feedback.retryButton,
  className = '',
}: AlertProps) {
  const Icon = ICONS[variant] || Info;
  const toneClass = TONE_BANNER_CLASSES[variant];

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-medium animate-fade-in ${toneClass} ${className}`}
    >
      <div className="flex items-start sm:items-center gap-2.5">
        <Icon className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          {title && <span className="font-semibold">{title}</span>}
          <span>{message}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-current/30 bg-white/10 hover:bg-white/20 text-[11px] font-semibold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{retryLabel}</span>
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pesan"
            className="p-1 rounded-lg opacity-75 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Alert;
