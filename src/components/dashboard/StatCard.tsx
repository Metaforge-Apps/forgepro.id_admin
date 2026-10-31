import React from 'react';
import { Card } from '../common/Card';

export interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendType?: 'positive' | 'negative';
  trendLabel?: string;
}

/**
 * Single Stat Summary Card
 * Menampilkan metrik utama dengan perbandingan minggu lalu
 */
export function StatCard({
  label,
  value,
  trend,
  trendType = 'positive',
  trendLabel = 'vs minggu lalu',
}: StatCardProps) {
  const isPositive = trendType === 'positive';

  return (
    <Card padding="p-6" className="flex flex-col justify-between">
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-medium text-content-muted tracking-wide">
          {label}
        </span>
        <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
          {value}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mt-4 text-xs font-normal">
        <span className="text-content-muted">{trendLabel}</span>
        <span
          className={`font-semibold ${
            isPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {trend}
        </span>
      </div>
    </Card>
  );
}

export default StatCard;
