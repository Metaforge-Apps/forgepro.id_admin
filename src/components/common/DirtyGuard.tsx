import React, { useEffect, useState, useCallback } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { BRAND_CONFIG } from '../../config/branding';

/**
 * Dirty Form Guard & Hook (Fase 0: 0.4 & 0.9)
 * - Indikator "Perubahan belum disimpan" HANYA muncul ketika nilai form berbeda dari data tersimpan (isDirty === true).
 * - Tombol "Simpan" nonaktif ketika belum ada perubahan.
 * - Mencegah kehilangan data saat berpindah halaman atau menutup tab (beforeunload).
 */
export function useDirtyForm<T>(savedValue: T, currentValue: T) {
  const isDirty =
    JSON.stringify(savedValue) !== JSON.stringify(currentValue);

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const guardAction = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
      } else {
        setPendingAction(() => action);
      }
    },
    [isDirty]
  );

  const confirmLeave = useCallback(() => {
    if (pendingAction) {
      const fn = pendingAction;
      setPendingAction(null);
      fn();
    }
  }, [pendingAction]);

  const cancelLeave = useCallback(() => {
    setPendingAction(null);
  }, []);

  return {
    isDirty,
    hasPendingLeave: Boolean(pendingAction),
    guardAction,
    confirmLeave,
    cancelLeave,
  };
}

export interface DirtyStatusBadgeProps {
  isDirty: boolean;
  savedLabel?: string;
}

export function DirtyStatusBadge({ isDirty, savedLabel }: DirtyStatusBadgeProps) {
  if (!isDirty) {
    if (!savedLabel) return null;
    return (
      <span className="text-xs text-content-muted">{savedLabel}</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>{BRAND_CONFIG.feedback.dirtyBadge}</span>
    </span>
  );
}

export interface DirtyGuardModalProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function DirtyGuardModal({ open, onStay, onLeave }: DirtyGuardModalProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onStay}
      onConfirm={onLeave}
      title={BRAND_CONFIG.feedback.unsavedNavigationTitle}
      description={BRAND_CONFIG.feedback.unsavedNavigationMessage}
      cancelLabel={BRAND_CONFIG.feedback.unsavedStayButton}
      confirmLabel={BRAND_CONFIG.feedback.unsavedLeaveButton}
      variant="danger"
    />
  );
}

/** Nama event global untuk menyiarkan status "perubahan belum disimpan" ke Header. */
export const DIRTY_STATE_EVENT = 'forgepro-dirty-change';

/**
 * Menyiarkan status dirty halaman ke Header (tombol "Simpan" nonaktif jika belum ada perubahan,
 * lencana "Perubahan belum disimpan" hanya tampil bila dirty).
 */
export function useBroadcastDirty(isDirty: boolean): void {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent<boolean>(DIRTY_STATE_EVENT, { detail: isDirty }));
  }, [isDirty]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent<boolean>(DIRTY_STATE_EVENT, { detail: false }));
    };
  }, []);
}
