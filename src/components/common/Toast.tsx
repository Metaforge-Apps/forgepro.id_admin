import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Alert } from './Alert';
import type { SemanticFeedbackTone } from '../../config/statusColors';

export interface ToastItem {
  id: string;
  variant: SemanticFeedbackTone;
  title?: string;
  message: string;
  onRetry?: () => void;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (
    message: string,
    variant?: SemanticFeedbackTone,
    options?: { title?: string; durationMs?: number; onRetry?: () => void }
  ) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      variant: SemanticFeedbackTone = 'success',
      options?: { title?: string; durationMs?: number; onRetry?: () => void }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const item: ToastItem = {
        id,
        variant,
        title: options?.title,
        message,
        onRetry: options?.onRetry,
      };
      setToasts((prev) => [...prev.slice(-3), item]);
      const duration = options?.durationMs ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
        >
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto shadow-xl rounded-xl bg-surface-card">
              <Alert
                variant={t.variant}
                title={t.title}
                message={t.message}
                onRetry={t.onRetry}
                onClose={() => dismissToast(t.id)}
              />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return ctx;
}
