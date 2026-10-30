import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/common/Card';
import {
  Download,
  Search,
  ChevronDown,
  Info,
  X,
  RefreshCw,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import {
  useOrderController,
  type OrderItem,
  type PaymentStatus,
  type PhotoGenerationStatus,
} from '../controllers/order-controller';

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
    updateOrderStatus,
    getPaymentBadgeStyle,
    getPhotoBadgeStyle,
  } = useOrderController();

  const location = useLocation();
  const incomingOrderId = (location.state as any)?.selectedOrderId || null;

  const [activeTab, setActiveTab] = useState<string>('Semua pesanan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('Semua paket');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(incomingOrderId);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

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

  const handleUpdatePaymentStatus = (newStatus: PaymentStatus) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, { paymentStatus: newStatus });
    setStatusMessage(`Status pembayaran diperbarui menjadi "${newStatus}"`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpdatePhotoStatus = (newStatus: PhotoGenerationStatus) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, { photoStatus: newStatus });
    setStatusMessage(`Status proses foto diperbarui menjadi "${newStatus}"`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

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
                <th className="pb-3 px-4">CETAK FISIK</th>
                <th className="pb-3 px-4">WAKTU</th>
                <th className="pb-3 pl-4 pr-6 text-left sticky right-0 bg-surface-card z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredOrders.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedOrderId(item.id)}
                  className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                >
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-content-primary">
                        {item.orderNumber}
                      </span>
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

                  <td className="py-4 px-4 whitespace-nowrap">
                    {item.hasPhysicalPrint ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D9B06F]">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{item.shippingCourier || 'Ya'}</span>
                      </span>
                    ) : (
                      <span className="text-content-muted text-[11px]">Digital saja</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                    {item.timeDisplay}
                  </td>

                  <td className="py-4 pl-4 pr-6 whitespace-nowrap sticky right-0 bg-surface-card group-hover:bg-surface-hover/80 z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderId(item.id);
                      }}
                      className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
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

      {/* Modal Detail Pesanan & Pengelolaan Status */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrderId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedOrderId(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-sm font-semibold text-[#D9B06F]">
                {selectedOrder.orderNumber}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPaymentBadgeStyle(
                  selectedOrder.paymentStatus
                )}`}
              >
                {selectedOrder.paymentStatus}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPhotoBadgeStyle(
                  selectedOrder.photoStatus
                )}`}
              >
                {selectedOrder.photoStatus}
              </span>
            </div>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Detail Pesanan #{selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-content-muted mb-4">
              ID Database: <code className="font-mono">{selectedOrder.id}</code> · {selectedOrder.timeDisplay} WIB
            </p>

            {statusMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Pelanggan</span>
                <span className="font-semibold text-content-primary text-right">
                  {selectedOrder.customerName || '-'} ({selectedOrder.customerEmail})
                </span>
              </div>
              {selectedOrder.customerPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Nomor WhatsApp / HP</span>
                  <span className="font-medium text-content-primary">
                    {selectedOrder.customerPhone}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Paket &amp; Manfaat</span>
                <span className="font-semibold text-content-primary">
                  {selectedOrder.packageName} · {selectedOrder.photoCount} foto AI ({selectedOrder.creditsRemaining}/{selectedOrder.totalCredits} kredit)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Pilihan Gaya Jas</span>
                <span className="font-semibold text-content-primary">
                  {selectedOrder.suitType}
                </span>
              </div>
              {selectedOrder.customPrompt && (
                <div className="flex flex-col gap-1">
                  <span className="text-content-muted">Prompt Khusus Pelanggan</span>
                  <p className="p-2.5 rounded-xl bg-surface-hover/60 border border-border-subtle text-content-primary italic">
                    &ldquo;{selectedOrder.customPrompt}&rdquo;
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Metode Pembayaran</span>
                <span className="font-medium text-content-primary">
                  {selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Total Pembayaran</span>
                <span className="font-bold text-sm text-[#D9B06F]">
                  {formatRupiah(selectedOrder.amount)}
                  {selectedOrder.discount > 0 && (
                    <span className="text-xs font-normal text-content-muted ml-1.5">
                      (Diskon {formatRupiah(selectedOrder.discount)} via {selectedOrder.voucherCode})
                    </span>
                  )}
                </span>
              </div>

              {selectedOrder.hasPhysicalPrint && (
                <div className="pt-3 border-t border-border-subtle/60 flex flex-col gap-1.5">
                  <span className="font-semibold text-content-primary flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#D9B06F]" />
                    <span>Cetak Fisik &amp; Pengiriman</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-content-muted">
                    <div>
                      <span>Penerima:</span> <span className="font-medium text-content-primary">{selectedOrder.recipientName || '-'}</span>
                    </div>
                    <div>
                      <span>Kurir:</span> <span className="font-medium text-content-primary">{selectedOrder.shippingCourier || 'JNE'}</span>
                    </div>
                    <div className="col-span-2">
                      <span>Alamat:</span> <span className="font-medium text-content-primary">{selectedOrder.shippingAddress || '-'}</span>
                    </div>
                    <div>
                      <span>No. Resi:</span> <span className="font-mono font-medium text-content-primary">{selectedOrder.shippingTrackingNumber || 'Belum ada'}</span>
                    </div>
                    <div>
                      <span>Status Kirim:</span> <span className="font-medium text-content-primary">{selectedOrder.shippingStatus || 'Antre cetak'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kontrol Aksi Manajemen Order */}
            <div className="mt-4 flex flex-col gap-3">
              <span className="text-xs font-semibold text-content-primary">
                Aksi Pengelolaan Order
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Pembayaran */}
                <div className="flex flex-col gap-1">
                  <span className="text-content-muted">Ubah Status Pembayaran:</span>
                  <div className="flex items-center gap-1.5">
                    {(['Dibayar', 'Menunggu', 'Gagal'] as PaymentStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdatePaymentStatus(st)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selectedOrder.paymentStatus === st
                            ? 'border-[#D9B06F] bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] font-semibold'
                            : 'border-border-subtle hover:bg-surface-hover text-content-muted'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proses AI */}
                <div className="flex flex-col gap-1">
                  <span className="text-content-muted">Ubah Status Proses AI:</span>
                  <div className="flex items-center gap-1.5">
                    {(['Diproses', 'Selesai', 'Dibatalkan'] as PhotoGenerationStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdatePhotoStatus(st)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selectedOrder.photoStatus === st
                            ? 'border-[#D9B06F] bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] font-semibold'
                            : 'border-border-subtle hover:bg-surface-hover text-content-muted'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2.5 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdatePhotoStatus('Diproses');
                    setStatusMessage('Permintaan render ulang AI berhasil dikirim ke antrean.');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border-subtle hover:bg-surface-hover text-content-primary inline-flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D9B06F]" />
                  <span>Render Ulang AI</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    Tutup
                  </button>
                  {selectedOrder.downloadUrl && (
                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh paket hasil foto untuk ${selectedOrder.orderNumber}...`)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Arsip</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
