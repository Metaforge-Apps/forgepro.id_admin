import React, { useState } from 'react';
import { Card } from '../common/Card';
import { DashboardPeriodKey } from './Header';

interface ChartPointData {
  label: string;
  value: number;
  display: string;
}

const CHART_DATA: Record<DashboardPeriodKey, ChartPointData[]> = {
  Hari: [
    { label: '08:00', value: 1.2, display: 'Rp1,2 jt' },
    { label: '11:00', value: 3.4, display: 'Rp3,4 jt' },
    { label: '14:00', value: 2.8, display: 'Rp2,8 jt' },
    { label: '17:00', value: 5.6, display: 'Rp5,6 jt' },
    { label: '20:00', value: 4.1, display: 'Rp4,1 jt' },
    { label: '23:00', value: 2.5, display: 'Rp2,5 jt' },
  ],
  Minggu: [
    { label: 'SEN', value: 8.4, display: 'Rp8,4 jt' },
    { label: 'SEL', value: 12.1, display: 'Rp12,1 jt' },
    { label: 'RAB', value: 10.5, display: 'Rp10,5 jt' },
    { label: 'KAM', value: 16.8, display: 'Rp16,8 jt' },
    { label: 'JUM', value: 14.2, display: 'Rp14,2 jt' },
    { label: 'SAB', value: 22.5, display: 'Rp22,5 jt' },
    { label: 'MIN', value: 19.3, display: 'Rp19,3 jt' },
  ],
  Bulan: [
    { label: 'MGG 1', value: 64.0, display: 'Rp64 jt' },
    { label: 'MGG 2', value: 78.5, display: 'Rp78,5 jt' },
    { label: 'MGG 3', value: 89.2, display: 'Rp89,2 jt' },
    { label: 'MGG 4', value: 96.8, display: 'Rp96,8 jt' },
  ],
};

/**
 * Revenue Chart Component
 * Menampilkan kurva Tren Pendapatan berwarna emas dengan area gradient
 * serta menyinkronkan periode terpilih ke Header Dashboard
 */
export function RevenueChart() {
  const [period, setPeriod] = useState<DashboardPeriodKey>('Minggu');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleSelectPeriod = (p: DashboardPeriodKey) => {
    setPeriod(p);
    setHoverIndex(null);
    window.dispatchEvent(new CustomEvent('forgepro-period-change', { detail: p }));
  };

  const data = CHART_DATA[period];
  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value)) * 0.7;

  // ViewBox SVG dimensions
  const width = 600;
  const height = 220;
  const paddingX = 24;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((d.value - minVal) / (maxVal - minVal || 1)) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Buat path garis sesuai referensi Figma
  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    return `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Buat polygon tertutup untuk background gradient
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <Card className="flex flex-col justify-between h-full">
      {/* Header Card: Judul dan Pill Tab Periode */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-content-primary">
          Tren pendapatan
        </h3>

        {/* Pill Tab Filter Periode */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['Hari', 'Minggu', 'Bulan'] as DashboardPeriodKey[]).map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handleSelectPeriod(p)}
                className={`px-3.5 py-1 rounded-full transition-all select-none border ${
                  isActive
                    ? 'bg-[#111A2C] text-[#D9B06F] border-[#D9B06F] font-semibold shadow-sm'
                    : 'bg-[#F4F1EA] dark:bg-[#1C273E] text-content-primary border-transparent hover:border-border-subtle font-medium'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Area Visual Chart SVG */}
      <div className="relative w-full h-48 sm:h-52 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D9B06F" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D9B06F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill Gradient */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Gold Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#D9B06F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points & Hover Hit Areas */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="16"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />

              {hoverIndex === i && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={5}
                  className="transition-all duration-150 pointer-events-none"
                  fill="#D9B06F"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute -top-3 transform -translate-x-1/2 bg-surface-card border border-[#D9B06F]/60 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-10 text-center animate-fade-in"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
            }}
          >
            <p className="text-[10px] text-content-muted uppercase tracking-wider">
              {points[hoverIndex].label}
            </p>
            <p className="text-xs font-semibold text-[#D9B06F]">
              {points[hoverIndex].display}
            </p>
          </div>
        )}
      </div>

      {/* Axis Pill Boxes Sesuai Referensi Figma */}
      <div
        className="grid gap-2 mt-3"
        style={{
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
        }}
      >
        {data.map((d, idx) => (
          <div
            key={d.label}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
            className="rounded-xl bg-[#F4F1EA] dark:bg-[#1C273E]/70 border border-border-subtle/50 px-2.5 py-2 flex flex-col items-start gap-0.5 cursor-pointer transition-colors hover:border-[#D9B06F]/50"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-content-muted">
              {d.label}
            </span>
            <span className="text-xs font-semibold text-content-primary truncate w-full">
              {hoverIndex === idx ? d.display : '—'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default RevenueChart;
