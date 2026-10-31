import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import {
  Download,
  Search,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  useOrderController,
  type OrderItem,
} from '../controllers/order-controller';
import { OrderDetailDrawer } from '../components/orders/OrderDetailDrawer';

const TABS = [
  'Semua pesanan',
  'Menunggu pembayaran',
  'Dalam proses',
  'Selesai',
  'Gagal',
];

const formatRupiah = (val: number): string =>
  `Rp${Math.round(val).toLocaleString('id-ID')}`;

export function OrdersPage() {
  const {
    orders,
    getPaymentBadgeStyle,
    getPhotoBadgeStyle,
    getPrintPayment,
    verifyManualPayment,
    requestAiRegeneration,
    extendDownloadDuration,
    addInternalNote,
    cancelOrder,
    syncGooglePlayRefund,
    extendPrintPaymentDeadline,
    refundPrintPayment,
  } = useOrderController();

  const location = useLocation();
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useParams<{ orderId?: string }>();
  const [searchParams] = useSearchParams();

  const queryOrderId = searchParams.get('id') || searchParams.get('orderId');
  const incomingStateOrderId = (location.state as any)?.selectedOrderId || null;

  const [activeTab, setActiveTab] = useState<string>('Semua pesanan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('Semua paket');
  
  // Active target ID: priority from route param, query param, location state, or local state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    routeOrderId || queryOrderId || incomingStateOrderId
  );

  // Synchronize when route params or navigation state change
  useEffect(() => {
    if (routeOrderId) {
      setSelectedOrderId(routeOrderId);
    } else if (queryOrderId) {
      setSelectedOrderId(queryOrderId);
    } else if (incomingStateOrderId) {
      setSelectedOrderId(incomingStateOrderId);
    } else {
      setSelectedOrderId(null);
    }
  }, [routeOrderId, queryOrderId, incomingStateOrderId]);

  // Find order in mock DB (case insensitive matching on id or orderNumber)
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    const target = selectedOrderId.trim().toLowerCase();
    return (
      orders.find(
        (o) =>
          o.id.toLowerCase() === target ||
          o.orderNumber.toLowerCase() === target
      ) ?? null
    );
  }, [orders, selectedOrderId]);

  // Handler to open order detail with clean route-backed navigation
  const handleSelectOrder = (orderNumOrId: string) => {
    setSelectedOrderId(orderNumOrId);
    navigate({
      pathname: `/pesanan/${orderNumOrId}`,
      search: location.search,
    });
  };

  // Handler to close order detail while preserving current filter, search, and table state
  const handleCloseDetail = () => {
    setSelectedOrderId(null);
    navigate({
      pathname: '/pesanan',
      search: location.search,
    }, { replace: true, state: {} });
  };

  // Dynamic calculations for stat cards
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Dibayar');
    const revenue = paidOrders.reduce((acc, curr) => acc + curr.amount, 0);
    const completedCount = orders.filter((o) => o.photoStatus === 'Selesai').length;
    const pendingFailedCount = orders.filter(
      (o) => o.paymentStatus === 'Menunggu' || o.paymentStatus === 'Gagal' || o.photoStatus === 'Dibatalkan'
    ).length;

    return {
      totalCount,
      revenue,
      completedCount,
      pendingFailedCount,
    };
  }, [orders]);

  // Filter Data
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((item) => {
      if (activeTab === 'Menunggu pembayaran' && item.paymentStatus !== 'Menunggu') return false;
      if (activeTab === 'Dalam proses' && item.photoStatus !== 'Diproses') return false;
      if (activeTab === 'Selesai' && item.photoStatus !== 'Selesai') return false;
      if (activeTab === 'Gagal' && item.paymentStatus !== 'Gagal') return false;

      if (selectedPackage !== 'Semua paket' && item.packageName !== selectedPackage) return false;

      if (q !== '') {
        const matchId = item.id.toLowerCase().includes(q);
        const matchNumber = item.orderNumber.toLowerCase().includes(q);
        const matchEmail = item.customerEmail.toLowerCase().includes(q);
        const matchName = (item.customerName || '').toLowerCase().includes(q);
        if (!matchId && !matchNumber && !matchEmail && !matchName) return false;
      }

      return true;
    });
  }, [orders, activeTab, selectedPackage, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Stat Cards Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Total Transaksi
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.totalCount}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Tersimpan di sistem
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Pendapatan Terkonfirmasi
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {formatRupiah(stats.revenue)}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Dari pesanan berstatus Dibayar
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Pesanan Berhasil
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.completedCount}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Foto berhasil diselesaikan
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Pending &amp; Gagal
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.pendingFailedCount}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Perlu ditinjau atau render ulang
          </span>
        </Card>
      </div>

      {/* Main Table Card: Daftar Pesanan */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Daftar pesanan
          </h2>
          <span className="text-xs text-content-muted">
            Menampilkan data sesuai format aplikasi Flutter
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto border-b border-border-subtle pb-px [scrollbar-width:none]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px select-none ${
                  isActive
                    ? 'border-[#D9B06F] text-content-primary font-semibold'
                    : 'border-transparent text-content-muted hover:text-content-primary font-medium'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari no. pesanan, email, atau nama pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Semua paket">Semua paket</option>
                <option value="Esensial">Esensial</option>
                <option value="Profesional">Profesional</option>
                <option value="Eksklusif">Eksklusif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">NO. PESANAN / PELANGGAN</th>
                <th className="pb-3 px-4">PAKET</th>
                <th className="pb-3 px-4">TOTAL</th>
                <th className="pb-3 px-4">PEMBAYARAN</th>
                <th className="pb-3 px-4">PROSES AI</th>
                <th className="pb-3 px-4">WAKTU</th>
                <th className="pb-3 pl-4 pr-6 text-left sticky right-0 bg-surface-card z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredOrders.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleSelectOrder(item.orderNumber)}
                  className="group hover:bg-surface-hover/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOrder(item.orderNumber);
                        }}
                        className="font-mono font-bold text-content-primary hover:text-[#D9B06F] text-left transition-colors flex items-center gap-1.5 group-hover:underline underline-offset-2"
                        title="Buka Detail Pesanan"
                      >
                        {item.orderNumber}
                      </button>
                      <span className="text-[11px] text-content-muted">
                        {item.customerEmail}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-content-primary">
                        {item.packageName}
                      </span>
                      <span className="text-[11px] text-content-muted">
                        {item.photoCount} foto · {item.suitType}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-content-primary">
                        {formatRupiah(item.amount)}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Hemat {formatRupiah(item.discount)} ({item.voucherCode})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPaymentBadgeStyle(
                        item.paymentStatus
                      )}`}
                    >
                      {item.paymentStatus}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPhotoBadgeStyle(
                        item.photoStatus
                      )}`}
                    >
                      {item.photoStatus}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                    {item.timeDisplay}
                  </td>

                  <td className="py-4 pl-4 pr-6 whitespace-nowrap sticky right-0 bg-surface-card group-hover:bg-surface-hover/80 z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOrder(item.orderNumber);
                      }}
                      className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-surface-hover"
                      title="Buka Detail Pesanan"
                    >
                      <span>Detail</span>
                      <span>&rarr;</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-content-muted">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle">
          <span className="text-xs text-content-muted">
            Menampilkan {filteredOrders.length} dari total {orders.length} pesanan
          </span>
        </div>
      </Card>

      {/* Bottom Info Notice */}
      <div className="flex items-start gap-2.5 px-1 pt-1">
        <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-content-primary">
            Kepatuhan Keamanan &amp; Alur Tanpa Login (Guest First)
          </span>
          <p className="text-xs text-content-muted leading-relaxed">
            Pesanan terikat pada email pelanggan. Sesuai UU PDP No. 27/2022, foto hasil AI disimpan di cloud selama 14–30 hari dan foto selfie mentah dibersihkan dalam 24 jam.
          </p>
        </div>
      </div>

      {/* Modal Popup Detail Pesanan Komprehensif */}
      <OrderDetailDrawer
        open={Boolean(selectedOrderId)}
        orderId={selectedOrderId || undefined}
        order={selectedOrder}
        onClose={handleCloseDetail}
        printPayment={selectedOrder ? getPrintPayment(selectedOrder.orderNumber) : undefined}
        onVerifyManualPayment={verifyManualPayment}
        onRequestAiRegeneration={requestAiRegeneration}
        onExtendDownload={extendDownloadDuration}
        onAddInternalNote={addInternalNote}
        onCancelOrder={cancelOrder}
        onSyncRefund={syncGooglePlayRefund}
        onExtendPrintPayment={extendPrintPaymentDeadline}
        onRefundPrintPayment={refundPrintPayment}
      />
    </div>
  );
}

export default OrdersPage;
