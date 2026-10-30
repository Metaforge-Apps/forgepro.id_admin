import React, { useState, ReactNode } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { BRAND_CONFIG } from '../../config/branding';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' wajib dipakai untuk aksi destruktif (hapus, nonaktifkan paksa, tolak, blokir, paksa keluar) */
  variant?: 'primary' | 'danger';
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  children?: ReactNode;
}

/**
 * Reusable Confirmation Dialog Component (Fase 0: 0.4 & 0.5)
 * Mendukung varian normal dan varian destruktif (merah) serta input alasan opsional/wajib.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = BRAND_CONFIG.commonStates.confirmProceedLabel,
  cancelLabel = BRAND_CONFIG.commonStates.confirmCancelLabel,
  variant = 'primary',
  requireReason = false,
  reasonLabel = 'Alasan tindakan',
  reasonPlaceholder = 'Tuliskan alasan singkat untuk dicatat ke log audit...',
  children,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return;
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const isDanger = variant === 'danger';

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-[#F7F5F0] dark:bg-surface-hover border-border-subtle text-content-primary'
            }`}
          >
            {isDanger ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#D9B06F]" />
            )}
          </div>
          <h3 className="font-serif text-2xl font-medium text-content-primary">
            {title}
          </h3>
        </div>

        <div className="text-xs text-content-muted leading-relaxed">
          {description}
        </div>

        {children}

        {requireReason && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-semibold text-content-primary">
              {reasonLabel} *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary select-none transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={requireReason && !reason.trim()}
            onClick={handleConfirm}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold select-none transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500'
                : 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-[#D9B06F]/60'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
