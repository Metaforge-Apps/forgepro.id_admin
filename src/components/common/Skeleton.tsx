import React from 'react';

export interface SkeletonProps {
  className?: string;
  rows?: number;
}

/**
 * Reusable Loading Skeleton Component (Fase 0: 0.4)
 */
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/70 ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 py-3" aria-busy="true" aria-label="Memuat data tabel">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, cIdx) => (
            <Skeleton key={cIdx} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
