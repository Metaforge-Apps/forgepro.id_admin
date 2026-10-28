import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  Printer,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import type { PrintingItem } from '../types';

const PRINTING_DATA: PrintingItem[] = [
  {
    id: 'PS-261019-003',
    spec: 'Eksklusif · 2 lembar · 4 × 6 cm',
    recipient: 'Rizky Pratama',
    address: 'Jl. Tebet Raya No. 18, Jakarta Selatan 12820',
    status: 'Antre cetak',
    courier: 'JNE REG',
    trackingNumber: 'Belum tersedia',
    actionText: 'Cetak label →',
  },
  {
    id: 'PS-261018-003',
    spec: 'Eksklusif · 4 lembar · 4 × 6 cm',
    recipient: 'Fajar Nugroho',
    address: 'Jl. Cikutra No. 24, Bandung 40124',
    status: 'Dicetak',
    courier: 'J&T EZ',
    trackingNumber: 'Belum tersedia',
    actionText: 'Selesaikan →',
  },
  {
    id: 'PS-261017-006',
    spec: 'Eksklusif · 2 lembar · 4 × 6 cm',
    recipient: 'Nadia Putri',
    address: 'Jl. Kaliurang Km. 5, Sleman 55281',
    status: 'Siap dikirim',
    courier: 'SiCepat REG',
    trackingNumber: '004871220691',
    actionText: 'Atur kirim →',
  },
  {
    id: 'PS-261017-002',
    spec: 'Eksklusif · 4 lembar · 4 × 6 cm',
    recipient: 'Bima Saputra',
    address: 'Jl. Darmo No. 56, Surabaya 60241',
    status: 'Dikirim',
    courier: 'JNE REG',
    trackingNumber: 'JT0218460091',
    actionText: 'Lacak resi →',
  },
  {
    id: 'PS-261016-008',
    spec: 'Eksklusif · 2 lembar · 4 × 6 cm',
    recipient: 'Citra Lestari',
    address: 'Jl. Pandanaran No. 10, Semarang 50134',
    status: 'Diterima',
    courier: 'J&T EZ',
    trackingNumber: 'JP0892145673',
    actionText: 'Detail →',
  },
];

const TABS = [
  { label: 'Semua (100)', filter: 'Semua' },
  { label: 'Antre cetak (24)', filter: 'Antre cetak' },
  { label: 'Produksi (12)', filter: 'Dicetak' },
  { label: 'Siap kirim (18)', filter: 'Siap dikirim' },
  { label: 'Dikirim (46)', filter: 'Dikirim' },
];

const getStatusBadgeStyle = (status: PrintingItem['status']): string => {
  if (status === 'Antre cetak') {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
  }
  if (status === 'Dicetak' || status === 'Siap dikirim' || status === 'Dikirim') {
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
  }
  return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
};

export function PrintingShippingPage() {
  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState<string>('Semua kurir');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua status');
  const [selectedItem, setSelectedItem] = useState<PrintingItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredData = useMemo(() => {
    return PRINTING_DATA.filter((item) => {
      if (activeTab !== 'Semua' && item.status !== activeTab) return false;
      if (selectedStatus !== 'Semua status' && item.status !== selectedStatus) return false;
      if (selectedCourier !== 'Semua kurir' && !item.courier.startsWith(selectedCourier)) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.recipient.toLowerCase().includes(q) ||
          item.trackingNumber.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [activeTab, selectedCourier, selectedStatus, searchQuery]);

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
              24
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            8 pesanan masuk hari ini
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Dalam produksi
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              12
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Estimasi selesai 1 hari kerja
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Siap dikirim
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              18
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Penjemputan pukul 16.00 WIB
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Dalam pengiriman
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              46
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            3 kiriman perlu pemantauan
          </span>
        </Card>
      </div>

      {/* Main Table Card: Antrean Cetak & Pengiriman */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Antrean cetak &amp; pengiriman
          </h2>
          <span className="text-xs text-content-muted">
            19 Oktober 2026
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
              placeholder="Cari pesanan, penerima, atau resi..."
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
                <option value="Antre cetak">Antre cetak</option>
                <option value="Dicetak">Dicetak</option>
                <option value="Siap dikirim">Siap dikirim</option>
                <option value="Dikirim">Dikirim</option>
                <option value="Diterima">Diterima</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">PESANAN / CETAK</th>
                <th className="pb-3 px-4">PENERIMA / ALAMAT</th>
                <th className="pb-3 px-4">STATUS</th>
                <th className="pb-3 px-4">KURIR / RESI</th>
                <th className="pb-3 pl-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-content-muted">
                    Tidak ada antrean cetak yang cocok.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedItem(row)}
                    className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                  >
                    {/* Pesanan / Cetak */}
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-content-primary">
                          {row.id}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {row.spec}
                        </span>
                      </div>
                    </td>

                    {/* Penerima / Alamat */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5 max-w-xs">
                        <span className="font-semibold text-content-primary">
                          {row.recipient}
                        </span>
                        <span className="text-[11px] text-content-muted truncate">
                          {row.address}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Kurir / Resi */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-content-muted">
                          {row.courier}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {row.trackingNumber}
                        </span>
                      </div>
                    </td>

                    {/* Aksi Button */}
                    <td className="py-4 pl-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(row);
                        }}
                        className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors select-none"
                      >
                        {row.actionText}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs text-content-muted">
          <span>
            Menampilkan 1–{filteredData.length} dari 100 pesanan cetak
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-2 rounded-xl font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-xl font-semibold flex items-center justify-center transition-colors select-none ${
                currentPage === 1
                  ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] border border-[#D9B06F]/60'
                  : 'border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary'
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-xl font-semibold flex items-center justify-center transition-colors select-none ${
                currentPage === 2
                  ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] border border-[#D9B06F]/60'
                  : 'border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary'
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className="px-3.5 py-2 rounded-xl font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary select-none transition-colors"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </Card>

      {/* 2 Bottom Cards (Disamakan styling dengan bagian bawah Menu Sistem) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card Standar Cetak */}
        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-2.5">
          <h3 className="text-sm sm:text-base font-semibold text-content-primary">
            Standar cetak
          </h3>
          <p className="text-xs text-content-muted leading-relaxed">
            Kertas foto premium 260 gsm · hasil akhir doff. Periksa ketajaman,
            warna, dan jumlah lembar sebelum pengemasan.
          </p>
        </Card>

        {/* Card Jadwal Penjemputan */}
        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-content-primary">
              Jadwal penjemputan
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              Terjadwal
            </span>
          </div>
          <p className="text-xs text-content-muted leading-relaxed">
            Senin–Sabtu, 16.00 WIB. Pesanan siap setelah pukul 15.00 dikirim pada
            hari kerja berikutnya.
          </p>
        </Card>
      </div>

      {/* Modal Aksi Cetak & Pengiriman */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-semibold text-[#D9B06F]">
                {selectedItem.id}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                  selectedItem.status
                )}`}
              >
                {selectedItem.status}
              </span>
            </div>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              {selectedItem.recipient}
            </h3>
            <p className="text-xs text-content-muted mb-5">
              {selectedItem.address}
            </p>

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Spesifikasi Cetak</span>
                <span className="font-semibold text-content-primary">
                  {selectedItem.spec}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Ekspedisi Kurir</span>
                <span className="font-semibold text-content-primary">
                  {selectedItem.courier}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Nomor Resi</span>
                <span className="font-mono font-semibold text-content-primary">
                  {selectedItem.trackingNumber}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Memproses label thermal shipping untuk ${selectedItem.id}...`);
                  setSelectedItem(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrintingShippingPage;
