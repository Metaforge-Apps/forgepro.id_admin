import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  widthClass?: string;
  isDirty?: boolean;
}

/**
 * Reusable Slide-Over Drawer Component (Fase 0: 0.4)
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = 'max-w-lg',
  isDirty = false,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={() => {
        if (!isDirty) onClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${widthClass} h-full bg-surface-card border-l border-border-card shadow-2xl flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border-subtle shrink-0">
          <div>
            {title && (
              <h3 className="font-serif text-xl font-medium text-content-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-content-muted mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-card shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Drawer;
