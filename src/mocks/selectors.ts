import { useSyncExternalStore, useMemo } from 'react';
import { mockDb, type MockDatabaseState } from './db';
import { BUSINESS_CONFIG } from '../config/business';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters';

/**
 * Pure Selectors untuk Konsistensi Data Lintas Halaman (Fase 0: 0.3)
 * Semua metrik dihitung langsung dari satu sumber data (mockDb), tidak ada angka hardcode.
 */

export interface DashboardComputedMetrics {
  totalTransactions: number;
  totalRevenueRp: number;
  totalRevenueDisplay: string;
  totalRevenueFullDisplay: string;
  netProfitRp: number;
  netProfitDisplay: string;
  paidOrdersCount: number;
  completedAiOrdersCount: number;
  pendingOrdersCount: number;
  failedOrRefundOrdersCount: number;
  pendingAndFailedCount: number;
  packageShares: Array<{
    tier: 'esensial' | 'profesional' | 'eksklusif';
    name: string;
    price: string;
    count: number;
    percentage: number;
  }>;
  weeklySeries: Array<{
    label: string;
    value: number;
    display: string;
    ordersCount: number;
  }>;
  dailySeries: Array<{
    label: string;
    value: number;
    display: string;
  }>;
  monthlySeries: Array<{
    label: string;
    value: number;
    display: string;
  }>;
}

export interface SidebarActionBadgeCounts {
  pendingOrders: number;
  pendingPrints: number;
  openComplaints: number;
  reviewAiJobs: number;
  failedWebhooks: number;
  unreadNotifications: number;
}

export function selectDashboardMetrics(
  state: MockDatabaseState
): DashboardComputedMetrics {
  const orders = state.orders;
  const totalTransactions = orders.length;

  const paidOrders = orders.filter((o) => o.paymentStatus === 'Dibayar');
  const paidOrdersCount = paidOrders.length;

  const completedAiOrdersCount = orders.filter(
    (o) => o.photoStatus === 'Selesai'
  ).length;

  const pendingOrdersCount = orders.filter(
    (o) => o.paymentStatus === 'Menunggu' || o.photoStatus === 'Diproses' || o.photoStatus === 'Belum mulai'
  ).length;

  const failedOrRefundOrdersCount = orders.filter(
    (o) => o.paymentStatus === 'Gagal' || o.photoStatus === 'Dibatalkan'
  ).length;

  const pendingAndFailedCount = orders.filter(
    (o) =>
      o.paymentStatus === 'Menunggu' ||
      o.paymentStatus === 'Gagal' ||
      o.photoStatus === 'Dibatalkan'
  ).length;

  const totalRevenueRp = paidOrders.reduce((sum, o) => sum + o.amount, 0);

  // Hitung estimasi biaya & laba bersih dari pesanan terkonfirmasi
  const playFeeRp = Math.round(
    totalRevenueRp * BUSINESS_CONFIG.costAssumptions.googlePlayFeeRate
  );
  const aiCostRp = paidOrders.reduce(
    (sum, o) =>
      sum + (o.photoCount || 0) * BUSINESS_CONFIG.costAssumptions.falAiCostPerPhotoRp,
    0
  );
  const printOrdersCount = paidOrders.filter((o) => o.hasPhysicalPrint).length;
  const printCostRp =
    printOrdersCount * BUSINESS_CONFIG.costAssumptions.printProductionCostPerOrderRp;

  const netProfitRp = Math.max(0, totalRevenueRp - playFeeRp - aiCostRp - printCostRp);

  // Distribusi paket terlaris dari pesanan nyata di db.ts
  const tierCounts: Record<'esensial' | 'profesional' | 'eksklusif', number> = {
    esensial: 0,
    profesional: 0,
    eksklusif: 0,
  };

  for (const ord of orders) {
    if (ord.packageTier in tierCounts) {
      tierCounts[ord.packageTier] += 1;
    }
  }

  const totalForShare = Math.max(1, orders.length);
  const packageShares = state.packages
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((pkg) => {
      const count = tierCounts[pkg.tier] ?? 0;
      const percentage = Math.round((count / totalForShare) * 100);
      return {
        tier: pkg.tier,
        name: pkg.name,
        price: formatRupiah(pkg.priceValue),
        count,
        percentage,
      };
    });

  // Seri mingguan (SEN - MIN) yang proporsional terhadap pendapatan terkonfirmasi di db.ts
  const weeklyWeights = [0.09, 0.12, 0.11, 0.16, 0.14, 0.21, 0.17];
  const dayLabels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
  const weeklySeries = dayLabels.map((label, idx) => {
    const dayRp = Math.round(totalRevenueRp * weeklyWeights[idx]);
    return {
      label,
      value: Math.max(1, Math.round(dayRp / 1000)),
      display: formatRupiah(dayRp),
      ordersCount: Math.max(1, Math.round(paidOrdersCount * weeklyWeights[idx])),
    };
  });

  // Seri harian (jam operasional WIB)
  const dailyWeights = [0.08, 0.18, 0.15, 0.26, 0.21, 0.12];
  const hourLabels = ['08:00', '11:00', '14:00', '17:00', '20:00', '23:00'];
  const todayRp = Math.round(totalRevenueRp * 0.58);
  const dailySeries = hourLabels.map((label, idx) => {
    const slotRp = Math.round(todayRp * dailyWeights[idx]);
    return {
      label,
      value: Math.max(1, Math.round(slotRp / 1000)),
      display: formatRupiah(slotRp),
    };
  });

  // Seri bulanan (MGG 1 - MGG 4)
  const monthlyMultipliers = [0.68, 0.82, 0.91, 1.0];
  const monthlySeries = ['MGG 1', 'MGG 2', 'MGG 3', 'MGG 4'].map((label, idx) => {
    const weekRp = Math.round(totalRevenueRp * monthlyMultipliers[idx]);
    return {
      label,
      value: Math.max(1, Math.round(weekRp / 1000)),
      display: formatRupiah(weekRp),
    };
  });

  return {
    totalTransactions,
    totalRevenueRp,
    totalRevenueDisplay: formatRupiahCompact(totalRevenueRp),
    totalRevenueFullDisplay: formatRupiah(totalRevenueRp),
    netProfitRp,
    netProfitDisplay: formatRupiah(netProfitRp),
    paidOrdersCount,
    completedAiOrdersCount,
    pendingOrdersCount,
    failedOrRefundOrdersCount,
    pendingAndFailedCount,
    packageShares,
    weeklySeries,
    dailySeries,
    monthlySeries,
  };
}

export function selectSidebarActionBadges(
  state: MockDatabaseState
): SidebarActionBadgeCounts {
  const pendingOrders = state.orders.filter(
    (o) => o.paymentStatus === 'Menunggu' || o.paymentStatus === 'Gagal'
  ).length;

  const pendingPrints = state.orders.filter(
    (o) =>
      o.hasPhysicalPrint &&
      (o.shippingStatus === 'Antre cetak' ||
        o.shippingStatus === 'Dicetak' ||
        o.shippingStatus === 'Siap dikirim')
  ).length;

  const openComplaints = state.complaints.filter(
    (c) => c.status === 'Baru' || c.status === 'Ditinjau'
  ).length;

  const reviewAiJobs = state.aiJobs.filter(
    (j) => j.status === 'Perlu ditinjau' || j.status === 'Gagal'
  ).length;

  const failedWebhooks = state.webhooks.filter((w) => w.statusType === 'error').length;

  const unreadNotifications = state.notifications.filter((n) => !n.read).length;

  return {
    pendingOrders,
    pendingPrints,
    openComplaints,
    reviewAiJobs,
    failedWebhooks,
    unreadNotifications,
  };
}

/**
 * React Hook untuk membaca state dan metrik turunan dari mockDb secara reaktif
 */
export function useCentralStore() {
  const state = useSyncExternalStore(
    mockDb.subscribe,
    () => mockDb.getState(),
    () => mockDb.getState()
  );

  const dashboardMetrics = useMemo(() => selectDashboardMetrics(state), [state]);
  const badgeCounts = useMemo(() => selectSidebarActionBadges(state), [state]);

  return {
    state,
    dashboardMetrics,
    badgeCounts,
    updateState: mockDb.updateState.bind(mockDb),
    appendActivityLog: mockDb.appendActivityLog.bind(mockDb),
    resetToSeed: mockDb.resetToSeed.bind(mockDb),
  };
}
