import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Sparkles,
  Printer,
  Truck,
  Ban,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Calendar,
  Layers,
} from 'lucide-react';
import { useCentralStore } from '../mocks/selectors';
import { BUSINESS_CONFIG } from '../config/business';
import { useToast } from '../components/common/Toast';
import { mockDb } from '../mocks/db';
import type { OrderItem } from '../controllers/order-controller/order.types';

const formatRupiah = (val: number): string =>
  `Rp${Math.round(val).toLocaleString('id-ID')}`;

export function FinancePage() {
  const { showToast } = useToast();
  const { dashboardMetrics, state } = useCentralStore();

  const [timeRange, setTimeRange] = useState<'harian' | 'mingguan' | 'bulanan'>('mingguan');

  // Adjustable cost assumptions state
  const [googlePlayFeeRate, setGooglePlayFeeRate] = useState<number>(0.15);
  const [falAiCostPerPhoto, setFalAiCostPerPhoto] = useState<number>(450);
  const [printCostPerOrder, setPrintCostPerOrder] = useState<number>(12000);
  const [gatewayFeeRate, setGatewayFeeRate] = useState<number>(1500);

  const orders: OrderItem[] = state.orders;
  const paidOrders: OrderItem[] = useMemo(
    () => orders.filter((o: OrderItem) => o.paymentStatus === 'Dibayar'),
    [orders]
  );

  // Comprehensive Financial Calculations
  const financeData = useMemo(() => {
    const grossRevenue = paidOrders.reduce((sum: number, o: OrderItem) => sum + o.amount, 0);

    const googlePlayFee = Math.round(grossRevenue * googlePlayFeeRate);

    const falAiCost = paidOrders.reduce(
      (sum: number, o: OrderItem) => sum + (o.photoCount || 0) * falAiCostPerPhoto,
      0
    );

    const printOrders = paidOrders.filter((o: OrderItem) => o.hasPhysicalPrint);
    const printOrdersCount = printOrders.length;
    const printLabCost = printOrdersCount * printCostPerOrder;

    const courierShippingPassThrough = printOrdersCount * 15000;
    const paymentGatewayCost = printOrdersCount * gatewayFeeRate;

    const totalRefunds = orders.reduce((sum: number, o: OrderItem) => sum + (o.refundAmount || 0), 0);

    const totalCosts = googlePlayFee + falAiCost + printLabCost + paymentGatewayCost + totalRefunds;
    const netProfit = Math.max(0, grossRevenue - totalCosts);
    const marginPercentage = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0';

    return {
      grossRevenue,
      googlePlayFee,
      falAiCost,
      printLabCost,
      courierShippingPassThrough,
      paymentGatewayCost,
      totalRefunds,
      totalCosts,
      netProfit,
      marginPercentage,
      printOrdersCount,
    };
  }, [
    paidOrders,
    orders,
    googlePlayFeeRate,
    falAiCostPerPhoto,
    printCostPerOrder,
    gatewayFeeRate,
  ]);

  // Profit breakdown per package tier
  const packageProfitBreakdown = useMemo(() => {
    const tiers: Record<'esensial' | 'profesional' | 'eksklusif', { name: string; count: number; revenue: number; falCost: number }> = {
      esensial: { name: 'Esensial', count: 0, revenue: 0, falCost: 0 },
      profesional: { name: 'Profesional', count: 0, revenue: 0, falCost: 0 },
      eksklusif: { name: 'Eksklusif', count: 0, revenue: 0, falCost: 0 },
    };

    for (const ord of paidOrders) {
      const tierKey = ord.packageTier as 'esensial' | 'profesional' | 'eksklusif';
      if (tierKey in tiers) {
        tiers[tierKey].count += 1;
        tiers[tierKey].revenue += ord.amount;
        tiers[tierKey].falCost += (ord.photoCount || 0) * falAiCostPerPhoto;
      }
    }

    return Object.entries(tiers).map(([tierKey, data]) => {
      const playFee = Math.round(data.revenue * googlePlayFeeRate);
      const tierProfit = data.revenue - playFee - data.falCost;
      const tierMargin = data.revenue > 0 ? Math.round((tierProfit / data.revenue) * 100) : 0;
      return {
        tierKey,
        name: data.name,
        count: data.count,
        revenue: data.revenue,
        playFee,
        falCost: data.falCost,
        tierProfit,
        tierMargin,
      };
    });
  }, [paidOrders, googlePlayFeeRate, falAiCostPerPhoto]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const rows = [
      ['No. Pesanan', 'Tanggal', 'Paket', 'Status', 'Pendapatan Kotor', 'Komisi Play (15%)', 'Biaya Fal.ai', 'Biaya Cetak Lab', 'Laba Bersih'],
      ...orders.map((o: OrderItem) => {
        const isPaid = o.paymentStatus === 'Dibayar';
        const gross = isPaid ? o.amount : 0;
        const play = isPaid ? Math.round(gross * googlePlayFeeRate) : 0;
        const fal = isPaid ? (o.photoCount || 0) * falAiCostPerPhoto : 0;
        const prt = isPaid && o.hasPhysicalPrint ? printCostPerOrder : 0;
        const net = Math.max(0, gross - play - fal - prt);
        return [
          o.orderNumber,
          o.timeDisplay,
          o.packageName,
          o.paymentStatus,
          gross.toString(),
          play.toString(),
          fal.toString(),
          prt.toString(),
          net.toString(),
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_keuangan_forgepro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Keuangan',
      activity: 'Mengunduh rekap laporan laba rugi format CSV',
      result: 'Berhasil',
    });

    showToast('Laporan keuangan format CSV berhasil diunduh', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Range Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-content-primary">
            Laporan Keuangan &amp; Laba Bersih
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Transparansi pendapatan kotor, potongan komisi Google Play Billing, biaya AI Fal.ai, lab cetak, dan laba riil.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Time range selector */}
          <div className="flex items-center p-1 rounded-xl bg-surface-card border border-border-subtle text-xs font-medium">
            {(['harian', 'mingguan', 'bulanan'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors select-none ${
                  timeRange === range
                    ? 'bg-[#111A2C] text-[#D9B06F] font-semibold'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Row 1: 8 Stat Cards Keuangan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Pendapatan Kotor */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-content-muted flex items-center justify-between">
              <span>Pendapatan Kotor</span>
              <DollarSign className="w-4 h-4 text-[#D9B06F]" />
            </span>
            <span className="font-serif text-2xl sm:text-[28px] font-medium tracking-tight text-content-primary">
              {formatRupiah(financeData.grossRevenue)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted mt-3">
            Dari {paidOrders.length} pesanan berhasil
          </span>
        </Card>

        {/* Card 2: Potongan Google Play (15%) */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-content-muted flex items-center justify-between">
              <span>Google Play Fee (15%)</span>
              <CreditCard className="w-4 h-4 text-rose-400" />
            </span>
            <span className="font-serif text-2xl sm:text-[28px] font-medium tracking-tight text-rose-500">
              -{formatRupiah(financeData.googlePlayFee)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted mt-3">
            Komisi resmi billing in-app Android
          </span>
        </Card>

        {/* Card 3: Biaya AI Fal.ai FLUX */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-content-muted flex items-center justify-between">
              <span>Biaya AI Fal.ai</span>
              <Sparkles className="w-4 h-4 text-rose-400" />
            </span>
            <span className="font-serif text-2xl sm:text-[28px] font-medium tracking-tight text-rose-500">
              -{formatRupiah(financeData.falAiCost)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted mt-3">
            Model fal-ai/flux-pro/v1.1 (~Rp450/foto)
          </span>
        </Card>

        {/* Card 4: LABA BERSIH RIIL (STAR METRIC) */}
        <Card
          padding="p-5"
          className="flex flex-col justify-between bg-gradient-to-br from-[#1C273E] to-[#111A2C] border-2 border-[#D9B06F]/60 shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-xs font-bold text-[#D9B06F] uppercase tracking-wider flex items-center justify-between">
              <span>LABA BERSIH (NET)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {financeData.marginPercentage}% MARGIN
              </span>
            </span>
            <span className="font-serif text-2xl sm:text-[30px] font-bold tracking-tight text-[#F7F5F0]">
              {formatRupiah(financeData.netProfit)}
            </span>
          </div>
          <span className="text-[11px] text-[#D9B06F]/80 mt-3 z-10 font-medium">
            Keuntungan bersih riil setelah seluruh biaya operasional
          </span>
        </Card>

        {/* Card 5: Biaya Cetak Lab */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-content-muted flex items-center justify-between">
              <span>Biaya Cetak Fisik</span>
              <Printer className="w-4 h-4 text-content-muted" />
            </span>
            <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-content-primary">
              -{formatRupiah(financeData.printLabCost)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted mt-3">
            {financeData.printOrdersCount} pesanan cetak studio
          </span>
        </Card>

        {/* Card 6: Ongkir Kurir Pass-through */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-content-muted flex items-center justify-between">
              <span>Ongkir Kurir (Netral)</span>
              <Truck className="w-4 h-4 text-content-muted" />
            </span>
            <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-content-primary">
              {formatRupiah(financeData.courierShippingPassThrough)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted mt-3">
            Pass-through dibayar ke ekspedisi
          </span>
        </Card>

        {/* Card 7: Fee Gateway Cetak */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-content-muted flex items-center justify-between">
              <span>Fee Payment Gateway</span>
              <CreditCard className="w-4 h-4 text-content-muted" />
            </span>
            <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-content-primary">
              -{formatRupiah(financeData.paymentGatewayCost)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted mt-3">
            Biaya transaksi QRIS/VA Midtrans/Xendit
          </span>
        </Card>

        {/* Card 8: Total Pengembalian / Refund */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-content-muted flex items-center justify-between">
              <span>Total Refund Pelanggan</span>
              <Ban className="w-4 h-4 text-rose-500" />
            </span>
            <span className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-rose-500">
              {formatRupiah(financeData.totalRefunds)}
            </span>
          </div>
          <span className="text-[11px] text-content-muted mt-3">
            Pengembalian dana terkonfirmasi
          </span>
        </Card>
      </div>

      {/* Row 2: Perbandingan Keuntungan Paket & Status Kesehatan Margin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Profit per Paket Tier */}
        <Card padding="p-6 sm:p-7" className="lg:col-span-7 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-content-primary">
                Profitabilitas Berdasarkan Pilihan Paket
              </h3>
              <p className="text-xs text-content-muted mt-0.5">
                Rincian omset vs beban komputasi AI &amp; komisi per tier
              </p>
            </div>
            <Layers className="w-5 h-5 text-[#D9B06F]" />
          </div>

          <div className="space-y-4">
            {packageProfitBreakdown.map((pkg) => (
              <div
                key={pkg.tierKey}
                className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-content-primary">
                      Paket {pkg.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#111A2C] text-[#D9B06F]">
                      {pkg.count} pesanan
                    </span>
                  </div>
                  <span className="font-bold text-emerald-500 text-sm">
                    {formatRupiah(pkg.tierProfit)} ({pkg.tierMargin}% Net)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-border-subtle">
                  <div>
                    <span className="text-content-muted block">Omset:</span>
                    <span className="font-medium text-content-primary">{formatRupiah(pkg.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block">Komisi Play:</span>
                    <span className="font-medium text-rose-500">-{formatRupiah(pkg.playFee)}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block">Biaya Fal.ai:</span>
                    <span className="font-medium text-rose-500">-{formatRupiah(pkg.falCost)}</span>
                  </div>
                </div>

                {/* Visual Margin Bar */}
                <div className="w-full bg-surface-main rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${pkg.tierMargin}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Simulator & Kontrol Asumsi Biaya */}
        <Card padding="p-6 sm:p-7" className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-content-primary">
                Simulator Asumsi Biaya Operasional
              </h3>
              <p className="text-xs text-content-muted mt-0.5">
                Ubah parameter biaya untuk mensimulasikan margin laba masa depan
              </p>
            </div>
            <Sliders className="w-5 h-5 text-[#D9B06F]" />
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-content-muted">Komisi Google Play Store:</span>
                <span className="font-mono font-bold text-content-primary">{(googlePlayFeeRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.30"
                step="0.01"
                value={googlePlayFeeRate}
                onChange={(e) => setGooglePlayFeeRate(parseFloat(e.target.value))}
                className="w-full accent-[#D9B06F] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-content-muted">Biaya Fal.ai FLUX (per foto):</span>
                <span className="font-mono font-bold text-content-primary">Rp{falAiCostPerPhoto}</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={falAiCostPerPhoto}
                onChange={(e) => setFalAiCostPerPhoto(parseInt(e.target.value, 10))}
                className="w-full accent-[#D9B06F] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-content-muted">Biaya Kertas &amp; Cetak Lab:</span>
                <span className="font-mono font-bold text-content-primary">{formatRupiah(printCostPerOrder)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="1000"
                value={printCostPerOrder}
                onChange={(e) => setPrintCostPerOrder(parseInt(e.target.value, 10))}
                className="w-full accent-[#D9B06F] cursor-pointer"
              />
            </div>

            {/* Health Alert Box */}
            <div
              className={`p-3.5 rounded-xl border mt-2 flex items-start gap-2.5 ${
                parseFloat(financeData.marginPercentage) >= 40
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : parseFloat(financeData.marginPercentage) >= 25
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}
            >
              {parseFloat(financeData.marginPercentage) >= 40 ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 text-xs">
                <span className="font-semibold block">
                  Status Margin: {parseFloat(financeData.marginPercentage) >= 40 ? 'Sangat Sehat (> 40%)' : 'Perlu Diwaspadai (< 40%)'}
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  Model bisnis berbasis AI FLUX memiliki skalabilitas tinggi dengan margin laba kotor kuat.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Rincian Laba per Pesanan (Tabel Detail) */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-medium text-content-primary">
            Rincian Beban &amp; Laba per Pesanan
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            Daftar pesanan dengan kalkulasi COGS dan kontribusi margin bersih
          </p>
        </div>

        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">NO. PESANAN</th>
                <th className="pb-3 px-4">TANGGAL</th>
                <th className="pb-3 px-4">PAKET</th>
                <th className="pb-3 px-4">STATUS</th>
                <th className="pb-3 px-4 text-right">OMSET</th>
                <th className="pb-3 px-4 text-right">POTONGAN PLAY</th>
                <th className="pb-3 px-4 text-right">BIAYA AI</th>
                <th className="pb-3 px-4 text-right">BIAYA CETAK</th>
                <th className="pb-3 pl-4 pr-6 text-right">LABA BERSIH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {orders.map((ord: OrderItem) => {
                const isPaid = ord.paymentStatus === 'Dibayar';
                const gross = isPaid ? ord.amount : 0;
                const playCut = isPaid ? Math.round(gross * googlePlayFeeRate) : 0;
                const aiCut = isPaid ? (ord.photoCount || 0) * falAiCostPerPhoto : 0;
                const printCut = isPaid && ord.hasPhysicalPrint ? printCostPerOrder : 0;
                const net = Math.max(0, gross - playCut - aiCut - printCut);

                return (
                  <tr key={ord.id} className="hover:bg-surface-hover/40 transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-semibold text-[#D9B06F]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-content-muted whitespace-nowrap">
                      {ord.timeDisplay}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-content-primary">
                      {ord.packageName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          ord.paymentStatus === 'Dibayar'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : ord.paymentStatus === 'Menunggu'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-content-primary">
                      {formatRupiah(gross)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-500">
                      {playCut > 0 ? `-${formatRupiah(playCut)}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-500">
                      {aiCut > 0 ? `-${formatRupiah(aiCut)}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-content-muted">
                      {printCut > 0 ? `-${formatRupiah(printCut)}` : '-'}
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right font-bold text-emerald-500">
                      {isPaid ? formatRupiah(net) : 'Rp0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default FinancePage;
