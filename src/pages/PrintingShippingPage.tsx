import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  Printer,
  Search,
  ChevronDown,
  X,
  CheckCircle2,
  Truck,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  useOrderController,
  type OrderItem,
  type ShippingStatus,
} from '../controllers/order-controller';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import { getCourierTrackingUrl } from '../config/business';
import { mockDb } from '../mocks/db';

const TABS: { label: string; filter: string }[] = [
  { label: 'Semua', filter: 'Semua' },
  { label: 'Antre cetak', filter: 'Antre cetak' },
  { label: 'Produksi', filter: 'Dicetak' },
  { label: 'Siap kirim', filter: 'Siap dikirim' },
  { label: 'Dikirim', filter: 'Dikirim' },
  { label: 'Diterima', filter: 'Diterima' },
];

const COURIER_OPTIONS = ['JNE', 'J&T', 'SiCepat', 'Anteraja'];
const STATUS_OPTIONS: ShippingStatus[] = [
  'Antre cetak',
  'Dicetak',
  'Siap dikirim',
  'Dikirim',
  'Diterima',
];

const STATUS_ORDER_INDEX: Record<ShippingStatus, number> = {
  'Antre cetak': 0,
  'Dicetak': 1,
  'Siap dikirim': 2,
  'Dikirim': 3,
  'Diterima': 4,
};

function validateTrackingNumber(courier: string, tracking: string): { valid: boolean; hint: string } {
  const clean = tracking.trim();
  if (!clean || clean === 'Belum tersedia') {
    return { valid: false, hint: 'Nomor resi wajib diisi saat pengiriman' };
  }
  const norm = courier.toUpperCase();
  if (norm.includes('SICEPAT')) {
    const valid = /^[0-9]{12}$/.test(clean);
    return { valid, hint: valid ? 'Format SiCepat valid (12 digit angka)' : 'Resi SiCepat harus 12 digit angka' };
  }
  if (norm.includes('ANTERAJA')) {
    const valid = /^[0-9]{13,14}$/.test(clean);
    return { valid, hint: valid ? 'Format Anteraja valid (13-14 digit angka)' : 'Resi Anteraja harus 13–14 digit angka' };
  }
  if (norm.includes('J&T')) {
    const valid = /^(JP|JT)?[0-9]{10,14}$/i.test(clean);
    return { valid, hint: valid ? 'Format J&T valid' : 'Resi J&T harus berawalan JP/JT atau 10-14 angka' };
  }
  // JNE & default
  const valid = /^[A-Z0-9]{10,20}$/i.test(clean);
  return { valid, hint: valid ? 'Format resi valid' : 'Nomor resi harus 10–20 karakter alfanumerik' };
}

export function PrintingShippingPage() {
  const {
    physicalPrintOrders,
    updateShipping,
    getShippingBadgeStyle,
    getPrintPayment,
  } = useOrderController();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState<string>('Semua kurir');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua status');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Edit states inside modal
  const [editCourier, setEditCourier] = useState<string>('JNE');
  const [editTrackingNumber, setEditTrackingNumber] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ShippingStatus>('Antre cetak');
  const [trackingValidationHint, setTrackingValidationHint] = useState<string>('');

  // Backward rollback confirmation state
  const [showRollbackConfirm, setShowRollbackConfirm] = useState<boolean>(false);
  const [rollbackReason, setRollbackReason] = useState<string>('');
  const [pendingRollbackStatus, setPendingRollbackStatus] = useState<ShippingStatus | null>(null);

  // Bulk Label Print modal state
  const [showBulkPrintModal, setShowBulkPrintModal] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => physicalPrintOrders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) ?? null,
    [physicalPrintOrders, selectedOrderId]
  );

  const openModal = (item: OrderItem) => {
    setSelectedOrderId(item.id);
    setEditCourier(item.shippingCourier || 'JNE');
    const existingTracking =
      item.shippingTrackingNumber && item.shippingTrackingNumber !== 'Belum tersedia'
        ? item.shippingTrackingNumber
        : '';
    setEditTrackingNumber(existingTracking);
    setEditStatus(item.shippingStatus || 'Antre cetak');
    setTrackingValidationHint('');
  };

  const closeModal = () => {
    setSelectedOrderId(null);
    setTrackingValidationHint('');
  };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} disalin ke clipboard`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusChange = (newStatus: ShippingStatus) => {
    if (!selectedItem) return;
    const currentStatus = selectedItem.shippingStatus || 'Antre cetak';
    const currentIndex = STATUS_ORDER_INDEX[currentStatus] ?? 0;
    const nextIndex = STATUS_ORDER_INDEX[newStatus] ?? 0;

    // Mundur status (backward transition) membutuhkan alasan wajib
    if (nextIndex < currentIndex) {
      setPendingRollbackStatus(newStatus);
      setRollbackReason('');
      setShowRollbackConfirm(true);
      return;
    }

    // Maju ke proses produksi/kirim dicek apakah pembayaran sudah lunas
    const printPay = getPrintPayment(selectedItem.orderNumber);
    if (nextIndex >= 1 && printPay && printPay.status !== 'dibayar') {
      showToast('Peringatan: Status pembayaran cetak belum lunas ("menunggu" atau "kedaluwarsa")', 'warning');
    }

    setEditStatus(newStatus);
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Validasi resi jika status dikirim/diterima
    if (editStatus === 'Dikirim' || editStatus === 'Diterima') {
      const check = validateTrackingNumber(editCourier, editTrackingNumber);
      if (!check.valid) {
        setTrackingValidationHint(check.hint);
        showToast(check.hint, 'danger');
        return;
      }
    }

    updateShipping(selectedItem.id, {
      shippingStatus: editStatus,
      shippingCourier: editCourier,
      shippingTrackingNumber: editTrackingNumber.trim() || 'Belum tersedia',
    });

    showToast('Data pengiriman & nomor resi berhasil diperbarui', 'success');
    closeModal();
  };

  // Stat counts
  const stats = useMemo(() => {
    const queue = physicalPrintOrders.filter((o) => (o.shippingStatus || 'Antre cetak') === 'Antre cetak').length;
    const printing = physicalPrintOrders.filter((o) => o.shippingStatus === 'Dicetak').length;
    const ready = physicalPrintOrders.filter((o) => o.shippingStatus === 'Siap dikirim').length;
    const inTransit = physicalPrintOrders.filter((o) => o.shippingStatus === 'Dikirim').length;

    return { queue, printing, ready, inTransit };
  }, [physicalPrintOrders]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return physicalPrintOrders.filter((item) => {
      const status = item.shippingStatus || 'Antre cetak';
      if (activeTab !== 'Semua' && status !== activeTab) return false;
      if (selectedStatus !== 'Semua status' && status !== selectedStatus) return false;
      if (
        selectedCourier !== 'Semua kurir' &&
        item.shippingCourier &&
        !item.shippingCourier.toLowerCase().includes(selectedCourier.toLowerCase())
      ) {
        return false;
      }

      if (q !== '') {
        const matchId = item.id.toLowerCase().includes(q);
        const matchNum = item.orderNumber.toLowerCase().includes(q);
        const matchRecipient = (item.recipientName || item.customerName || '').toLowerCase().includes(q);
        const matchResi = (item.shippingTrackingNumber || '').toLowerCase().includes(q);
        const matchAddr = (item.shippingAddress || '').toLowerCase().includes(q);
        if (!matchId && !matchNum && !matchRecipient && !matchResi && !matchAddr) {
          return false;
        }
      }

      return true;
    });
  }, [physicalPrintOrders, activeTab, selectedCourier, selectedStatus, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Antre cetak
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.queue}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Pesanan menunggu proses lab cetak
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Proses cetak lab
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.printing}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Sedang dicetak &amp; laminasi doff
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Siap dikirim
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.ready}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Selesai QC &amp; siap pickup kurir
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Dalam pengiriman
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.inTransit}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Resi aktif &amp; dibawa ekspedisi
          </span>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-content-primary">
              Daftar Pesanan Cetak Fisik &amp; Resi
            </h2>
            <span className="text-xs text-content-muted mt-1 block">
              Diverifikasi bersama pembayaran gateway eksternal (Midtrans / Xendit)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkPrintModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844] transition-colors self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Label Massal ({filteredData.length})</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto border-b border-border-subtle pb-px [scrollbar-width:none]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.filter;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.filter)}
                className={`py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px select-none ${
                  isActive
                    ? 'border-[#D9B06F] text-content-primary font-semibold'
                    : 'border-transparent text-content-muted hover:text-content-primary font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari pesanan, penerima, alamat, atau nomor resi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Semua kurir">Semua kurir</option>
                <option value="JNE">JNE</option>
                <option value="J&T">J&amp;T</option>
                <option value="SiCepat">SiCepat</option>
                <option value="Anteraja">Anteraja</option>
              </select>
            </div>

            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Semua status">Semua status</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">NO. PESANAN / SPESIFIKASI</th>
                <th className="pb-3 px-4">PENERIMA &amp; ALAMAT</th>
                <th className="pb-3 px-4">STATUS BAYAR CETAK</th>
                <th className="pb-3 px-4">EKSPEDISI</th>
                <th className="pb-3 px-4">NOMOR RESI</th>
                <th className="pb-3 px-4">STATUS KIRIM</th>
                <th className="pb-3 pl-4 pr-6 text-left sticky right-0 bg-surface-card z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredData.map((item) => {
                const printPay = getPrintPayment(item.orderNumber);
                const payStatus = printPay?.status || item.printPaymentStatus || 'belum_dibayar';

                return (
                  <tr
                    key={item.id}
                    onClick={() => openModal(item)}
                    className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-content-primary">
                          {item.orderNumber}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {item.printSpec || 'Cetak Pasfoto 4 × 6 cm'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-content-primary truncate">
                            {item.recipientName || item.customerName || '-'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(
                                `${item.recipientName || item.customerName}\n${item.customerPhone}\n${item.shippingAddress}`,
                                `addr-${item.id}`,
                                'Alamat penerima'
                              );
                            }}
                            className="text-content-muted hover:text-content-primary shrink-0"
                            title="Salin alamat penerima"
                          >
                            {copiedKey === `addr-${item.id}` ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#D9B06F]" />
                            )}
                          </button>
                        </div>
                        <span className="text-[11px] text-content-muted line-clamp-1">
                          {item.shippingAddress || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Status Bayar Cetak */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          payStatus === 'dibayar'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : payStatus === 'menunggu'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}
                      >
                        {payStatus === 'dibayar'
                          ? '✓ Lunas Gateway'
                          : payStatus === 'menunggu'
                          ? 'Menunggu Bayar'
                          : payStatus.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-medium text-content-primary">
                        <Truck className="w-3.5 h-3.5 text-[#D9B06F]" />
                        <span>{item.shippingCourier || 'JNE'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-content-primary">
                          {item.shippingTrackingNumber || 'Belum tersedia'}
                        </span>
                        {item.shippingTrackingNumber && item.shippingTrackingNumber !== 'Belum tersedia' && (
                          <a
                            href={getCourierTrackingUrl(item.shippingCourier || 'JNE', item.shippingTrackingNumber)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#9A7432] dark:text-[#D9B06F] hover:underline"
                            title="Lacak di tab baru"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getShippingBadgeStyle(
                          item.shippingStatus || 'Antre cetak'
                        )}`}
                      >
                        {item.shippingStatus || 'Antre cetak'}
                      </span>
                    </td>

                    <td className="py-4 pl-4 pr-6 whitespace-nowrap sticky right-0 bg-surface-card group-hover:bg-surface-hover/80 z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(item);
                        }}
                        className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Kelola resi</span>
                        <span>&rarr;</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-content-muted">
                    Tidak ada pesanan cetak fisik yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle">
          <span className="text-xs text-content-muted">
            Menampilkan {filteredData.length} pesanan cetak fisik
          </span>
        </div>
      </Card>

      {/* 2 Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-2.5">
          <h3 className="text-sm sm:text-base font-semibold text-content-primary">
            Standar cetak lab studio
          </h3>
          <p className="text-xs text-content-muted leading-relaxed">
            Kertas foto studio premium 260 gsm berlapis doff anti gores. Format pasfoto siap potong 4x6, 3x4, dan 2x3 cm dengan resolusi cetak 300 DPI.
          </p>
        </Card>

        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-content-primary">
              Integrasi Pelacakan Resi Aplikasi
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              Aktif
            </span>
          </div>
          <p className="text-xs text-content-muted leading-relaxed">
            Nomor resi yang dimasukkan di admin ini akan langsung dapat disalin dan dilacak oleh pelanggan melalui lembar riwayat pelacakan kurir aplikasi Flutter.
          </p>
        </Card>
      </div>

      {/* Modal Kelola Resi & Status Pengiriman */}
      {selectedItem && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-semibold text-[#D9B06F]">
                {selectedItem.orderNumber}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getShippingBadgeStyle(
                  selectedItem.shippingStatus || 'Antre cetak'
                )}`}
              >
                {selectedItem.shippingStatus || 'Antre cetak'}
              </span>
            </div>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              {selectedItem.recipientName || selectedItem.customerName || 'Penerima'}
            </h3>
            <p className="text-xs text-content-muted mb-4">
              {selectedItem.shippingAddress || 'Alamat tidak tersedia'}
            </p>

            <form onSubmit={handleSaveShipping} className="flex flex-col gap-4 text-xs">
              <div className="space-y-2 border-t border-b border-border-subtle py-3">
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Paket &amp; Spesifikasi</span>
                  <span className="font-semibold text-content-primary">
                    {selectedItem.packageName} · {selectedItem.printSpec || 'Cetak 4 × 6 cm'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Email Pemesan</span>
                  <span className="font-medium text-content-primary">
                    {selectedItem.customerEmail}
                  </span>
                </div>
                {selectedItem.customerPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-content-muted">No. Kontak</span>
                    <span className="font-medium text-content-primary">
                      {selectedItem.customerPhone}
                    </span>
                  </div>
                )}
              </div>

              {/* Form Input Ekspedisi, Resi & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Ekspedisi Kurir *
                  </label>
                  <div className="relative">
                    <select
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                    >
                      {COURIER_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Status Pengiriman *
                  </label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => handleStatusChange(e.target.value as ShippingStatus)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Nomor Resi Pengiriman
                </label>
                <input
                  type="text"
                  placeholder="Contoh: JNE9910283712 atau 004871220691"
                  value={editTrackingNumber}
                  onChange={(e) => {
                    setEditTrackingNumber(e.target.value);
                    setTrackingValidationHint('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary font-mono placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                {trackingValidationHint && (
                  <span className="text-[11px] text-rose-500 font-medium">
                    {trackingValidationHint}
                  </span>
                )}
                <span className="text-[11px] text-content-muted">
                  Format resi divalidasi sesuai kurir ({editCourier}) dan dapat langsung dilacak oleh pelanggan.
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2.5 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Mencetak label thermal untuk ${selectedItem.orderNumber}...`, 'info');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary inline-flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D9B06F]" />
                  <span>Cetak Label Thermal</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rollback Status (Backward Transition) */}
      <ConfirmDialog
        open={showRollbackConfirm}
        onClose={() => {
          setShowRollbackConfirm(false);
          setPendingRollbackStatus(null);
        }}
        title="Konfirmasi Penurunan Status Pengiriman"
        description={`Anda sedang mengembalikan status dari "${selectedItem?.shippingStatus}" mundur ke "${pendingRollbackStatus}". Masukkan alasan untuk catatan audit.`}
        confirmLabel="Konfirmasi Mundur Status"
        variant="danger"
        onConfirm={() => {
          if (!rollbackReason.trim()) {
            showToast('Alasan perubahan status mundur wajib diisi', 'danger');
            return;
          }
          if (pendingRollbackStatus) {
            setEditStatus(pendingRollbackStatus);
            mockDb.appendActivityLog({
              source: 'Admin Utama',
              category: 'Pesanan',
              activity: `Koreksi mundur status pengiriman · ${selectedItem?.orderNumber} (${selectedItem?.shippingStatus} -> ${pendingRollbackStatus})`,
              result: 'Berhasil',
              targetId: selectedItem?.orderNumber || '',
              afterData: { reason: rollbackReason.trim() },
            });
          }
          setShowRollbackConfirm(false);
          setPendingRollbackStatus(null);
          showToast('Status mundur berhasil dikonfirmasi', 'info');
        }}
      >
        <div className="space-y-3 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1">Alasan Penurunan Status (Wajib):</label>
            <textarea
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="Contoh: Salah klik status oleh operator, cetak ulang karena kertas terlipat..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>
      </ConfirmDialog>

      {/* Modal Cetak Label Massal */}
      {showBulkPrintModal && (
        <div
          onClick={() => setShowBulkPrintModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowBulkPrintModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Printer className="w-5 h-5 text-[#D9B06F]" />
              <h3 className="font-serif text-xl font-medium text-content-primary">
                Pratinjau Label Pengiriman Thermal Massal (100 × 150 mm)
              </h3>
            </div>
            <p className="text-xs text-content-muted mb-4">
              Siap cetak untuk {filteredData.length} paket pesanan fisik yang sedang difilter.
            </p>

            <div className="space-y-4 my-4 max-h-[50vh] overflow-y-auto pr-1">
              {filteredData.map((order, idx) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-border-subtle bg-surface-main text-xs space-y-2 font-mono"
                >
                  <div className="flex justify-between items-center border-b border-border-subtle pb-2 font-sans font-bold">
                    <span className="text-[#D9B06F]">FORGEPRO.ID — STUDIO CETAK</span>
                    <span className="px-2 py-0.5 rounded bg-[#111A2C] text-[#D9B06F] text-[10px]">
                      {order.shippingCourier} • REGULER
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-content-muted block">Penerima:</span>
                      <span className="font-bold text-content-primary">{order.recipientName || order.customerName}</span>
                      <span className="text-content-muted block">{order.customerPhone}</span>
                      <p className="text-content-primary font-sans mt-1">{order.shippingAddress}</p>
                    </div>
                    <div>
                      <span className="text-content-muted block">No. Pesanan:</span>
                      <span className="font-bold text-[#D9B06F]">{order.orderNumber}</span>
                      <span className="text-content-muted block mt-1">Item: {order.printSpec || 'Pasfoto 4x6'}</span>
                      <span className="text-content-muted block">Resi: {order.shippingTrackingNumber || 'AUTO-BARCODE'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <span className="text-xs text-content-muted">
                Format: 100x150 mm Thermal Printer Ready (ZPL / PDF)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPrintModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Mengirim ${filteredData.length} label thermal ke antrean cetak...`, 'success');
                    setShowBulkPrintModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844]"
                >
                  Kirim ke Printer Thermal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrintingShippingPage;
