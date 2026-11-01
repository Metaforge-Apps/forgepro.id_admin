import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/branding';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Reusable EmptyState Component (Fase 0: 0.4)
 */
export function EmptyState({
  title = BRAND_CONFIG.commonStates.emptyTitle,
  description = BRAND_CONFIG.commonStates.emptyDescription,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-[#F4F1EA] dark:bg-surface-hover border border-border-subtle flex items-center justify-center text-content-muted mb-3">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h4 className="font-serif text-base font-medium text-content-primary">
        {title}
      </h4>
      <p className="text-xs text-content-muted max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
