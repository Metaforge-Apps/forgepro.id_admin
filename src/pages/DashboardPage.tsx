import React, { useMemo } from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { TopPackages } from '../components/dashboard/TopPackages';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { useOrderController } from '../controllers/order-controller';

/**
 * Dashboard Main Page
 * Menyusun 4 stat cards reaktif, grafik pendapatan, paket terlaris, dan tabel transaksi
 */
export function DashboardPage() {
  const { orders } = useOrderController();

  const stats = useMemo(() => {
    const baselineOrders = 1275;
    const totalOrders = baselineOrders + orders.length;

    const paidOrders = orders.filter((o) => o.paymentStatus === 'Dibayar');
    const dynamicRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalRevenueJt = (96.0 + dynamicRevenue / 1_000_000).toFixed(1).replace('.', ',');

    const baselineSuccess = 1120;
    const totalSuccess = baselineSuccess + paidOrders.length;

    const pendingFailedCount = orders.filter(
      (o) => o.paymentStatus === 'Menunggu' || o.paymentStatus === 'Gagal'
    ).length;
    const totalPendingFailed = 150 + pendingFailedCount;

    return {
      totalOrders: totalOrders.toLocaleString('id-ID'),
      revenue: `Rp${totalRevenueJt} jt`,
      success: totalSuccess.toLocaleString('id-ID'),
      pendingFailed: totalPendingFailed.toLocaleString('id-ID'),
    };
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: 4 Metrik Ringkasan Utama Reaktif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Transaksi"
          value={stats.totalOrders}
          trend="+12,4%"
          trendType="positive"
        />
        <StatCard
          label="Pendapatan"
          value={stats.revenue}
          trend="+8,1%"
          trendType="positive"
        />
        <StatCard
          label="Pesanan Berhasil"
          value={stats.success}
          trend="+10,2%"
          trendType="positive"
        />
        <StatCard
          label="Pending & Gagal"
          value={stats.pendingFailed}
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
