import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  Printer,
  Search,
  ChevronDown,
  X,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import {
  useOrderController,
  type OrderItem,
  type ShippingStatus,
} from '../controllers/order-controller';

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

export function PrintingShippingPage() {
  const {
    physicalPrintOrders,
    updateShipping,
    getShippingBadgeStyle,
  } = useOrderController();

  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState<string>('Semua kurir');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua status');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Edit states inside modal
  const [editCourier, setEditCourier] = useState<string>('JNE');
  const [editTrackingNumber, setEditTrackingNumber] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ShippingStatus>('Antre cetak');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => physicalPrintOrders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) ?? null,
    [physicalPrintOrders, selectedOrderId]
  );

  const openModal = (item: OrderItem) => {
    setSelectedOrderId(item.id);
    setEditCourier(item.shippingCourier || 'JNE');
    setEditTrackingNumber(
      item.shippingTrackingNumber && item.shippingTrackingNumber !== 'Belum tersedia'
        ? item.shippingTrackingNumber
        : ''
    );
    setEditStatus(item.shippingStatus || 'Antre cetak');
    setFeedbackMsg(null);
  };

  const closeModal = () => {
    setSelectedOrderId(null);
    setFeedbackMsg(null);
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    updateShipping(selectedItem.id, {
      shippingStatus: editStatus,
      shippingCourier: editCourier,
      shippingTrackingNumber: editTrackingNumber.trim() || 'Belum tersedia',
    });

    setFeedbackMsg('Data pengiriman dan nomor resi berhasil disimpan!');
    setTimeout(() => {
      setFeedbackMsg(null);
      closeModal();
    }, 1200);
  };

  // Stat counts
  const stats = useMemo(() => {
    const queue = physicalPrintOrders.filter((o) => o.shippingStatus === 'Antre cetak').length;
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
      {/* 4 Stat Cards Sesuai Referensi Figma */}
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
          <span className="text-xs text-content-muted mt-4 block">
            Pesanan perlu dicetak
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Dalam produksi
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.printing}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Sedang proses cetak doff
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
          <span className="text-xs text-content-muted mt-4 block">
            Menunggu nomor resi / pickup
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
          <span className="text-xs text-content-muted mt-4 block">
            Sedang dibawa kurir ekspedisi
          </span>
        </Card>
      </div>

      {/* Main Table Card: Antrean Cetak & Pengiriman */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Antrean cetak &amp; pengiriman fisik
          </h2>
          <span className="text-xs text-content-muted">
            Tersambung dengan pesanan yang memilih cetak fisik
          </span>
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
                <th className="pb-3 px-4">EKSPEDISI</th>
                <th className="pb-3 px-4">NOMOR RESI</th>
                <th className="pb-3 px-4">STATUS</th>
                <th className="pb-3 pl-4 pr-6 text-left sticky right-0 bg-surface-card z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredData.map((item) => (
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
                      <span className="font-semibold text-content-primary">
                        {item.recipientName || item.customerName || '-'}
                      </span>
                      <span className="text-[11px] text-content-muted line-clamp-1">
                        {item.shippingAddress || '-'}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-medium text-content-primary">
                      <Truck className="w-3.5 h-3.5 text-[#D9B06F]" />
                      <span>{item.shippingCourier || 'JNE'}</span>
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-mono text-content-primary">
                      {item.shippingTrackingNumber || 'Belum tersedia'}
                    </span>
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
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-content-muted">
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

            {feedbackMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

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
                      onChange={(e) => setEditStatus(e.target.value as ShippingStatus)}
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
                  placeholder="Contoh: JNE0192837465 atau SiCepat-004871220691"
                  value={editTrackingNumber}
                  onChange={(e) => setEditTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary font-mono placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Nomor ini akan dapat disalin pelanggan di menu Riwayat Pesanan aplikasi.
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2.5 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Mencetak label thermal 100x150mm untuk ${selectedItem.orderNumber}...`);
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
    </div>
  );
}

export default PrintingShippingPage;
