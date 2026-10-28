import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  Download,
  Search,
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import type { OrderItem } from '../types';

const ORDERS_DATA: OrderItem[] = [
  {
    id: 'PS-261019-001',
    customer: 'aditya@mail.com',
    package: 'Profesional',
    amount: 'Rp99.000',
    paymentStatus: 'Dibayar',
    photoStatus: 'Selesai',
    time: '19 Okt 16:12',
    suitType: 'Jas Navy Klasik & Formal',
    photoCount: 12,
    downloadUrl: '#',
  },
  {
    id: 'PS-261019-002',
    customer: 'sari.w@mail.com',
    package: 'Esensial',
    amount: 'Rp59.000',
    paymentStatus: 'Menunggu',
    photoStatus: 'Belum mulai',
    time: '19 Okt 15:48',
    suitType: 'Blazer Krem Modern',
    photoCount: 4,
    downloadUrl: null,
  },
  {
    id: 'PS-261019-003',
    customer: 'rizky@mail.com',
    package: 'Eksklusif',
    amount: 'Rp169.000',
    paymentStatus: 'Dibayar',
    photoStatus: 'Diproses',
    time: '19 Okt 15:20',
    suitType: 'Tuksedo Malam & Bisnis',
    photoCount: 24,
    downloadUrl: null,
  },
  {
    id: 'PS-261019-004',
    customer: 'dewi.a@mail.com',
    package: 'Profesional',
    amount: 'Rp99.000',
    paymentStatus: 'Dibayar',
    photoStatus: 'Selesai',
    time: '19 Okt 14:55',
    suitType: 'Blazer Navy Elegan',
    photoCount: 12,
    downloadUrl: '#',
  },
  {
    id: 'PS-261018-001',
    customer: 'bayu@mail.com',
    package: 'Esensial',
    amount: 'Rp59.000',
    paymentStatus: 'Gagal',
    photoStatus: 'Dibatalkan',
    time: '18 Okt 21:30',
    suitType: 'Jas Abu Profesional',
    photoCount: 4,
    downloadUrl: null,
  },
  {
    id: 'PS-261018-002',
    customer: 'nabila@mail.com',
    package: 'Profesional',
    amount: 'Rp99.000',
    paymentStatus: 'Dibayar',
    photoStatus: 'Selesai',
    time: '18 Okt 20:14',
    suitType: 'Blazer Krem Modern',
    photoCount: 12,
    downloadUrl: '#',
  },
  {
    id: 'PS-261018-003',
    customer: 'fajar@mail.com',
    package: 'Eksklusif',
    amount: 'Rp169.000',
    paymentStatus: 'Dibayar',
    photoStatus: 'Selesai',
    time: '18 Okt 19:46',
    suitType: 'Jas Hitam Formal',
    photoCount: 24,
    downloadUrl: '#',
  },
];

const TABS = [
  'Semua pesanan',
  'Menunggu pembayaran',
  'Dalam proses',
  'Selesai',
  'Gagal',
];

const getPaymentBadgeStyle = (status: OrderItem['paymentStatus']): string => {
  if (status === 'Dibayar') {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  }
  if (status === 'Menunggu') {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
  }
  return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
};

const getPhotoBadgeStyle = (status: OrderItem['photoStatus']): string => {
  if (status === 'Selesai') {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  }
  if (status === 'Diproses') {
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
  }
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
};

export function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('Semua pesanan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('Semua paket');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7 hari terakhir');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter Data
  const filteredOrders = useMemo(() => {
    return ORDERS_DATA.filter((item) => {
      if (activeTab === 'Menunggu pembayaran' && item.paymentStatus !== 'Menunggu') return false;
      if (activeTab === 'Dalam proses' && item.photoStatus !== 'Diproses') return false;
      if (activeTab === 'Selesai' && item.photoStatus !== 'Selesai') return false;
      if (activeTab === 'Gagal' && item.paymentStatus !== 'Gagal') return false;

      if (selectedPackage !== 'Semua paket' && item.package !== selectedPackage) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return item.id.toLowerCase().includes(q) || item.customer.toLowerCase().includes(q);
      }

      return true;
    });
  }, [activeTab, selectedPackage, searchQuery]);

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
              1.284
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs">
            <span className="text-content-muted">7 hari terakhir ·</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +12,4%
            </span>
          </div>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Pendapatan
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              Rp96,8 jt
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs">
            <span className="text-content-muted">7 hari terakhir ·</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +8,1%
            </span>
          </div>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Pesanan Berhasil
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              1.126
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
              158
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Perlu ditinjau secara berkala
          </span>
        </Card>
      </div>

      {/* Main Table Card: Daftar Pesanan */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        {/* Card Header: Title & Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Daftar pesanan
          </h2>
          <span className="text-xs text-content-muted">
            13–19 Oktober 2026
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

        {/* Search & Select Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari nomor pesanan atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

          {/* Dropdown Filters */}
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

            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="7 hari terakhir">7 hari terakhir</option>
                <option value="30 hari terakhir">30 hari terakhir</option>
                <option value="Bulan ini">Bulan ini</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">PESANAN / PELANGGAN</th>
                <th className="pb-3 px-4">PAKET</th>
                <th className="pb-3 px-4">NOMINAL</th>
                <th className="pb-3 px-4">PEMBAYARAN</th>
                <th className="pb-3 px-4">PROSES FOTO</th>
                <th className="pb-3 px-4">WAKTU (WIB)</th>
                <th className="pb-3 pl-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-content-muted">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedOrder(row)}
                    className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                  >
                    {/* Pesanan / Pelanggan */}
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-content-primary">
                          {row.id}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {row.customer}
                        </span>
                      </div>
                    </td>

                    {/* Paket */}
                    <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                      {row.package}
                    </td>

                    {/* Nominal */}
                    <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                      {row.amount}
                    </td>

                    {/* Pembayaran */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPaymentBadgeStyle(
                          row.paymentStatus
                        )}`}
                      >
                        {row.paymentStatus}
                      </span>
                    </td>

                    {/* Proses Foto */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPhotoBadgeStyle(
                          row.photoStatus
                        )}`}
                      >
                        {row.photoStatus}
                      </span>
                    </td>

                    {/* Waktu */}
                    <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                      {row.time}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 pl-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(row);
                        }}
                        className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1 select-none"
                      >
                        <span>Detail</span>
                        <span>&rarr;</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Count & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs text-content-muted">
          <span>
            Menampilkan 1–{filteredOrders.length} dari 1.284 pesanan
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

      {/* Bottom Info Notice (Disamakan dengan styling footer Menu Sistem) */}
      <div className="flex items-start gap-2.5 px-1 pt-1">
        <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-content-primary">
            Status pembayaran dan proses ditampilkan terpisah
          </span>
          <p className="text-xs text-content-muted leading-relaxed">
            Foto diproses setelah pembayaran terkonfirmasi. Pesanan gagal tidak
            diteruskan ke antrean produksi atau pengiriman.
          </p>
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-sm font-semibold text-[#D9B06F]">
                {selectedOrder.id}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPaymentBadgeStyle(
                  selectedOrder.paymentStatus
                )}`}
              >
                {selectedOrder.paymentStatus}
              </span>
            </div>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Detail Pesanan &amp; Foto
            </h3>
            <p className="text-xs text-content-muted mb-5">
              Informasi lengkap pelanggan, paket, dan status AI generation
            </p>

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Email Pelanggan</span>
                <span className="font-semibold text-content-primary">
                  {selectedOrder.customer}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Pilihan Paket</span>
                <span className="font-semibold text-content-primary">
                  {selectedOrder.package} ({selectedOrder.photoCount} foto AI)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Gaya Jas Dipilih</span>
                <span className="font-semibold text-content-primary">
                  {selectedOrder.suitType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Total Pembayaran</span>
                <span className="font-bold text-sm text-[#D9B06F]">
                  {selectedOrder.amount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Status Proses Foto</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getPhotoBadgeStyle(
                    selectedOrder.photoStatus
                  )}`}
                >
                  {selectedOrder.photoStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Waktu Transaksi Masuk</span>
                <span className="font-medium text-content-primary">
                  {selectedOrder.time} WIB
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
              >
                Tutup
              </button>
              {selectedOrder.downloadUrl && (
                <button
                  type="button"
                  onClick={() => alert('Mengunduh paket arsip foto ZIP...')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Arsip Foto</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
