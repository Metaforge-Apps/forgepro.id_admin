import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  Search,
  ChevronDown,
  Download,
  X
} from 'lucide-react';
import type { VoucherItem } from '../types';

const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: 'v-1',
    code: 'KARIER20',
    name: 'Kampanye karier Oktober',
    discountMain: '20%',
    discountSub: 'Maks. Rp25.000',
    period: '1–31 Okt 2026',
    periodGroup: 'Oktober 2026',
    packageTarget: 'Semua paket',
    used: 186,
    quota: 500,
    status: 'Aktif',
  },
  {
    id: 'v-2',
    code: 'PROBARU',
    name: 'Pelanggan baru',
    discountMain: 'Rp10.000',
    discountSub: 'Min. Rp59.000',
    period: '1–31 Okt 2026',
    periodGroup: 'Oktober 2026',
    packageTarget: 'Semua paket',
    used: 94,
    quota: 300,
    status: 'Aktif',
  },
  {
    id: 'v-3',
    code: 'EKSKLUSIF15',
    name: 'Khusus paket Eksklusif',
    discountMain: '15%',
    discountSub: 'Maks. Rp30.000',
    period: '15–31 Okt 2026',
    periodGroup: 'Oktober 2026',
    packageTarget: 'Eksklusif',
    used: 42,
    quota: 200,
    status: 'Aktif',
  },
  {
    id: 'v-4',
    code: 'NOVHEMAT',
    name: 'Promo awal November',
    discountMain: 'Rp15.000',
    discountSub: 'Min. Rp99.000',
    period: '1–7 Nov 2026',
    periodGroup: 'November 2026',
    packageTarget: 'Profesional',
    used: 0,
    quota: 250,
    status: 'Terjadwal',
  },
  {
    id: 'v-5',
    code: 'SEPTCERIA',
    name: 'Kampanye September',
    discountMain: '10%',
    discountSub: 'Maks. Rp20.000',
    period: '1–30 Sep 2026',
    periodGroup: 'September 2026',
    packageTarget: 'Semua paket',
    used: 200,
    quota: 200,
    status: 'Berakhir',
  },
];

export function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS);
  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [packageFilter, setPackageFilter] = useState<string>('Semua paket');
  const [periodFilter, setPeriodFilter] = useState<string>('Semua periode');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);

  // Form state for new voucher
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newDiscountMain, setNewDiscountMain] = useState<string>('');
  const [newDiscountSub, setNewDiscountSub] = useState<string>('');
  const [newPeriod, setNewPeriod] = useState<string>('1–30 Nov 2026');
  const [newQuota, setNewQuota] = useState<string>('200');

  // Listen to Header "Buat voucher" button
  useEffect(() => {
    const handleHeaderAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'create-voucher') {
        setShowCreateModal(true);
      }
    };
    window.addEventListener('forgepro-action', handleHeaderAction);
    return () => window.removeEventListener('forgepro-action', handleHeaderAction);
  }, []);

  const counts = useMemo(() => {
    return {
      Semua: vouchers.length,
      Aktif: vouchers.filter((v) => v.status === 'Aktif').length,
      Terjadwal: vouchers.filter((v) => v.status === 'Terjadwal').length,
      Berakhir: vouchers.filter((v) => v.status === 'Berakhir').length,
    };
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (activeTab !== 'Semua' && v.status !== activeTab) return false;
      if (packageFilter !== 'Semua paket' && v.packageTarget !== packageFilter) return false;
      if (periodFilter !== 'Semua periode' && v.periodGroup !== periodFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchCode = v.code.toLowerCase().includes(q);
        const matchName = v.name.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });
  }, [vouchers, activeTab, packageFilter, periodFilter, searchQuery]);

  const handleCreateVoucher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    const created: VoucherItem = {
      id: `v-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      name: newName.trim() || 'Kampanye promo baru',
      discountMain: newDiscountMain.trim() || '15%',
      discountSub: newDiscountSub.trim() || 'Maks. Rp25.000',
      period: newPeriod.trim() || '1–30 Nov 2026',
      periodGroup: 'November 2026',
      packageTarget: 'Semua paket',
      used: 0,
      quota: parseInt(newQuota, 10) || 200,
      status: 'Aktif',
    };
    setVouchers((prev) => [created, ...prev]);
    setShowCreateModal(false);
    setNewCode('');
    setNewName('');
    setNewDiscountMain('');
    setNewDiscountSub('');
  };

  const getStatusBadgeStyle = (status: VoucherItem['status']): string => {
    if (status === 'Aktif') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    if (status === 'Terjadwal') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  };

  const tabs = [
    { key: 'Semua', label: `Semua (${counts.Semua})` },
    { key: 'Aktif', label: `Aktif (${counts.Aktif})` },
    { key: 'Terjadwal', label: `Terjadwal (${counts.Terjadwal})` },
    { key: 'Berakhir', label: `Berakhir (${counts.Berakhir})` },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Summary Stat Cards Sesuai Referensi Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Voucher aktif
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {counts.Aktif}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Dari {counts.Semua} voucher yang dibuat
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Total penggunaan
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              322
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Voucher aktif · Oktober 2026
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Nilai diskon
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              Rp4,8 jt
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Akumulasi voucher Oktober
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Promo terjadwal
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {counts.Terjadwal}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Mulai 1 November 2026
          </span>
        </Card>
      </div>

      {/* Main Card: Daftar voucher */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Daftar voucher
          </h2>
          <span className="text-xs text-content-muted">
            Waktu mengikuti zona WIB
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto border-b border-border-subtle pb-px [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
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

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari kode atau nama promo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
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
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Semua periode">Semua periode</option>
                <option value="Oktober 2026">Oktober 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="September 2026">September 2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">KODE / PROMO</th>
                <th className="pb-3 px-4">DISKON</th>
                <th className="pb-3 px-4">MASA BERLAKU</th>
                <th className="pb-3 px-4">PENGGUNAAN / KUOTA</th>
                <th className="pb-3 px-4">STATUS</th>
                <th className="pb-3 pl-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredVouchers.map((v) => {
                const progressPercent = Math.min(
                  100,
                  Math.round((v.used / v.quota) * 100)
                );
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVoucher(v)}
                    className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                  >
                    {/* KODE / PROMO */}
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-content-primary tracking-wide">
                          {v.code}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {v.name}
                        </span>
                      </div>
                    </td>

                    {/* DISKON */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-content-primary">
                          {v.discountMain}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {v.discountSub}
                        </span>
                      </div>
                    </td>

                    {/* MASA BERLAKU */}
                    <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                      {v.period}
                    </td>

                    {/* PENGGUNAAN / KUOTA */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5 w-36 sm:w-40">
                        <span className="font-medium text-content-primary text-[11px]">
                          {v.used} / {v.quota}
                        </span>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#D9B06F] transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>

                    {/* AKSI */}
                    <td className="py-4 pl-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoucher(v);
                        }}
                        className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Kelola</span>
                        <span>&rarr;</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle">
          <span className="text-xs text-content-muted">
            Menampilkan seluruh {filteredVouchers.length} voucher
          </span>

          <button
            type="button"
            onClick={() => alert('Mengekspor daftar voucher ke CSV...')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor voucher</span>
          </button>
        </div>
      </Card>

      {/* 2 Bottom Cards: Batas penggunaan & Penerapan diskon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-2.5">
          <h3 className="text-sm sm:text-base font-semibold text-content-primary">
            Batas penggunaan
          </h3>
          <p className="text-xs text-content-muted leading-relaxed">
            Satu kode promo per pesanan. Setiap pelanggan dapat menggunakan kode
            yang sama maksimal satu kali selama periode berlaku.
          </p>
        </Card>

        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-2.5">
          <h3 className="text-sm sm:text-base font-semibold text-content-primary">
            Penerapan diskon
          </h3>
          <p className="text-xs text-content-muted leading-relaxed">
            Diskon hanya berlaku pada harga paket foto AI. Biaya cetak dan
            pengiriman tidak termasuk dasar perhitungan diskon.
          </p>
        </Card>
      </div>

      {/* Modal Buat Voucher Baru */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Buat voucher baru
            </h3>
            <p className="text-xs text-content-muted mb-5">
              Atur kode promo, nilai potongan, dan batas kuota penggunaan.
            </p>

            <form onSubmit={handleCreateVoucher} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Kode voucher
                </label>
                <input
                  type="text"
                  placeholder="Contoh: KARIER25"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  required
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary uppercase font-semibold focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Nama kampanye promo
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kampanye karier November"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Nilai diskon
                  </label>
                  <input
                    type="text"
                    placeholder="20% atau Rp15.000"
                    value={newDiscountMain}
                    onChange={(e) => setNewDiscountMain(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Ketentuan diskon
                  </label>
                  <input
                    type="text"
                    placeholder="Maks. Rp25.000"
                    value={newDiscountSub}
                    onChange={(e) => setNewDiscountSub(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Masa berlaku
                  </label>
                  <input
                    type="text"
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Kuota penggunaan
                  </label>
                  <input
                    type="number"
                    value={newQuota}
                    onChange={(e) => setNewQuota(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285]"
                >
                  Simpan voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Voucher */}
      {selectedVoucher && (
        <div
          onClick={() => setSelectedVoucher(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              {selectedVoucher.code}
            </h3>
            <p className="text-xs text-content-muted mb-5">
              {selectedVoucher.name} · {selectedVoucher.period}
            </p>

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Potongan diskon</span>
                <span className="font-semibold text-content-primary">
                  {selectedVoucher.discountMain} ({selectedVoucher.discountSub})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Penggunaan saat ini</span>
                <span className="font-semibold text-content-primary">
                  {selectedVoucher.used} dari {selectedVoucher.quota} kuota
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Status kampanye</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                    selectedVoucher.status
                  )}`}
                >
                  {selectedVoucher.status}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const nextStatus: VoucherItem['status'] =
                    selectedVoucher.status === 'Aktif' ? 'Berakhir' : 'Aktif';
                  setVouchers((prev) =>
                    prev.map((item) =>
                      item.id === selectedVoucher.id
                        ? { ...item, status: nextStatus }
                        : item
                    )
                  );
                  setSelectedVoucher(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
              >
                {selectedVoucher.status === 'Aktif'
                  ? 'Akhiri kampanye'
                  : 'Aktifkan kembali'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VouchersPage;
