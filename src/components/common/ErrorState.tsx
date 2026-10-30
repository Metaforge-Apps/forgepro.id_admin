import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Reusable ErrorState Component (Fase 0: 0.4 & 0.5)
 */
export function ErrorState({
  title = BRAND_CONFIG.commonStates.errorTitle,
  description = BRAND_CONFIG.commonStates.errorDescription,
  onRetry,
  retryLabel = BRAND_CONFIG.feedback.retryButton,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 ${className}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="font-serif text-base font-medium text-content-primary">
        {title}
      </h4>
      <p className="text-xs text-content-muted max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}

export default ErrorState;
