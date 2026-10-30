import React from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { TopPackages } from '../components/dashboard/TopPackages';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { ActionItemsAndSystemStatus } from '../components/dashboard/ActionItemsAndSystemStatus';
import { useCentralStore } from '../mocks/selectors';

/**
 * Dashboard Main Page
 * Menyusun 4 stat cards, kartu tindakan cepat & status sistem, grafik pendapatan, paket terlaris, dan tabel transaksi
 * Seluruh angka dihitung dari satu sumber data terpusat (src/mocks/db.ts).
 */
export function DashboardPage() {
  const { dashboardMetrics } = useCentralStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: 4 Metrik Ringkasan Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Transaksi"
          value={dashboardMetrics.totalTransactions.toLocaleString('id-ID')}
          trend="+12,4%"
          trendType="positive"
        />
        <StatCard
          label="Pendapatan"
          value={dashboardMetrics.totalRevenueDisplay}
          trend="+8,1%"
          trendType="positive"
        />
        <StatCard
          label="Pesanan Berhasil"
          value={dashboardMetrics.completedAiOrdersCount.toLocaleString('id-ID')}
          trend="+10,2%"
          trendType="positive"
        />
        <StatCard
          label="Pending & Gagal"
          value={dashboardMetrics.pendingAndFailedCount.toLocaleString('id-ID')}
          trend="-3,5%"
          trendType="positive"
        />
      </div>

      {/* Row 2: Perlu Tindakan & Indikator Status Sistem */}
      <ActionItemsAndSystemStatus />

      {/* Row 3: Grafik Pendapatan & Paket Terlaris */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Kurva Pendapatan (7 Kolom pada Desktop) */}
        <div className="lg:col-span-7">
          <RevenueChart />
        </div>

        {/* Right: Paket Terlaris (5 Kolom pada Desktop) */}
        <div className="lg:col-span-5">
          <TopPackages />
        </div>
      </div>

      {/* Row 3: Tabel Transaksi Terbaru */}
      <div>
        <RecentTransactionsTable />
      </div>
    </div>
  );
}

export default DashboardPage;
