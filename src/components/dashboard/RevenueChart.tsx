import React, { useState } from 'react';
import { Card } from '../common/Card';
import { DashboardPeriodKey } from './Header';
import { useCentralStore } from '../../mocks/selectors';

/**
 * Revenue Chart Component
 * Menampilkan kurva Tren Pendapatan berwarna emas dengan area gradient
 * serta menyinkronkan periode terpilih ke Header Dashboard.
 * Data dihitung secara dinamis dari basis data terpusat (src/mocks/db.ts).
 */
export function RevenueChart() {
  const { dashboardMetrics } = useCentralStore();
  const [period, setPeriod] = useState<DashboardPeriodKey>('Minggu');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activeIndex = hoverIndex !== null ? hoverIndex : selectedIndex;

  const handleSelectPeriod = (p: DashboardPeriodKey) => {
    setPeriod(p);
    setHoverIndex(null);
    setSelectedIndex(null);
    window.dispatchEvent(new CustomEvent('forgepro-period-change', { detail: p }));
  };

  const chartDataByPeriod = {
    Hari: dashboardMetrics.dailySeries,
    Minggu: dashboardMetrics.weeklySeries,
    Bulan: dashboardMetrics.monthlySeries,
  };

  const data = chartDataByPeriod[period];
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value)) * 0.7;

  // ViewBox SVG dimensions
  const width = 600;
  const height = 220;
  const paddingX = 24;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - paddingX * 2);
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
                onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />

              {(activeIndex === i) && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={6}
                  className="transition-all duration-150 pointer-events-none"
                  fill="#D9B06F"
                  stroke="#0A111C"
                  strokeWidth="2.5"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Hover / Selected Tooltip Popup */}
        {activeIndex !== null && points[activeIndex] && (
          <div
            className="absolute -top-3 transform -translate-x-1/2 bg-surface-card border border-[#D9B06F] px-3.5 py-2 rounded-xl shadow-2xl pointer-events-none z-20 text-center animate-fade-in backdrop-blur-md"
            style={{
              left: `${(points[activeIndex].x / width) * 100}%`,
            }}
          >
            <p className="text-[10px] font-semibold text-content-muted uppercase tracking-wider">
              {points[activeIndex].label} · {period === 'Minggu' ? 'Hari ini' : period}
            </p>
            <p className="text-sm font-bold text-[#D9B06F] mt-0.5">
              {points[activeIndex].display}
            </p>
            {'ordersCount' in points[activeIndex] && (
              <p className="text-[10px] text-content-secondary mt-0.5">
                {(points[activeIndex] as any).ordersCount} transaksi selesai
              </p>
            )}
          </div>
        )}
      </div>

      {/* Axis Pill Boxes Sesuai Referensi Figma (Sen-Min selalu tampil angka pendapatan) */}
      <div
        className="grid gap-2 mt-3"
        style={{
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
        }}
      >
        {data.map((d, idx) => {
          const isPointActive = activeIndex === idx;
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              title={`Klik untuk menyorot pendapatan ${d.label}: ${d.display}`}
              className={`rounded-xl px-2.5 py-2 flex flex-col items-start gap-0.5 cursor-pointer transition-all text-left select-none border ${
                isPointActive
                  ? 'bg-[#D9B06F]/15 border-[#D9B06F] shadow-sm ring-1 ring-[#D9B06F]/30'
                  : 'bg-[#F4F1EA] dark:bg-[#1C273E]/70 border-border-subtle/50 hover:border-[#D9B06F]/50'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-content-muted">
                {d.label}
              </span>
              <span className={`text-xs font-semibold truncate w-full ${isPointActive ? 'text-[#D9B06F]' : 'text-content-primary'}`}>
                {d.display}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default RevenueChart;
