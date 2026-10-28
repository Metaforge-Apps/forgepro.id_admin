import React from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { TopPackages } from '../components/dashboard/TopPackages';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';

/**
 * Dashboard Main Page
 * Menyusun 4 stat cards, grafik pendapatan, paket terlaris, dan tabel transaksi
 */
export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: 4 Metrik Ringkasan Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Transaksi"
          value="1.284"
          trend="+12,4%"
          trendType="positive"
        />
        <StatCard
          label="Pendapatan"
          value="Rp96,8 jt"
          trend="+8,1%"
          trendType="positive"
        />
        <StatCard
          label="Pesanan Berhasil"
          value="1.126"
          trend="+10,2%"
          trendType="positive"
        />
        <StatCard
          label="Pending & Gagal"
          value="158"
          trend="-3,5%"
          trendType="negative"
        />
      </div>

      {/* Row 2: Grafik Pendapatan & Paket Terlaris */}
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
