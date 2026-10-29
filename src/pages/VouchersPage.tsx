import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  Search,
  ChevronDown,
  Download,
  X,
  Trash2,
} from 'lucide-react';
import {
  useVoucherController,
  getVoucherStatus,
  getPeriodGroup,
  formatPeriod,
  formatDateShort,
  describeDiscount,
  todayIso,
  PACKAGE_TARGET_LABEL,
  type VoucherItem,
  type VoucherInput,
  type VoucherDiscountType,
  type VoucherPackageTarget,
} from '../controllers/voucher-controller';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors';

const toInt = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
};

interface VoucherFormState {
  code: string;
  title: string;
  description: string;
  badge: string;
  discountType: VoucherDiscountType;
  percentOff: string;
  amountOff: string;
  bonusPhotos: string;
  maxDiscount: string;
  minPurchase: string;
  promoProductId: string;
  perEmailLimit: string;
  packageTarget: VoucherPackageTarget;
  startDate: string;
  endDate: string;
  quota: string;
  isActive: boolean;
}

const emptyForm = (): VoucherFormState => ({
  code: '',
  title: '',
  description: '',
  badge: 'PROMO',
  discountType: 'percent',
  percentOff: '10',
  amountOff: '',
  bonusPhotos: '0',
  maxDiscount: '',
  minPurchase: '',
  promoProductId: '',
  perEmailLimit: '1',
  packageTarget: 'all',
  startDate: todayIso(),
  endDate: '',
  quota: '200',
  isActive: true,
});

const formFromVoucher = (v: VoucherItem): VoucherFormState => ({
  code: v.code,
  title: v.title,
  description: v.description,
  badge: v.badge,
  discountType: v.discountType,
  percentOff: v.percentOff ? String(v.percentOff) : '',
  amountOff: v.amountOff ? String(v.amountOff) : '',
  bonusPhotos: String(v.bonusPhotos),
  maxDiscount: v.maxDiscount ? String(v.maxDiscount) : '',
  minPurchase: v.minPurchase ? String(v.minPurchase) : '',
  promoProductId: v.promoProductId,
  perEmailLimit: String(v.perEmailLimit),
  packageTarget: v.packageTarget,
  startDate: v.startDate,
  endDate: v.endDate,
  quota: String(v.quota),
  isActive: v.isActive,
});

const inputFromForm = (f: VoucherFormState): VoucherInput => ({
  code: f.code,
  title: f.title,
  description: f.description,
  badge: f.badge,
  discountType: f.discountType,
  percentOff: toInt(f.percentOff),
  amountOff: toInt(f.amountOff),
  bonusPhotos: toInt(f.bonusPhotos),
  maxDiscount: toInt(f.maxDiscount),
  minPurchase: toInt(f.minPurchase),
  promoProductId: f.promoProductId,
  perEmailLimit: toInt(f.perEmailLimit),
  packageTarget: f.packageTarget,
  startDate: f.startDate,
  endDate: f.endDate,
  quota: toInt(f.quota),
  isActive: f.isActive,
});

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <label className="font-semibold text-content-primary">{label}</label>
      {children}
      {hint && <span className="text-[11px] text-content-muted">{hint}</span>}
    </div>
  );
}

export function VouchersPage() {
  const {
    vouchers,
    summary,
    createVoucher,
    updateVoucher,
    toggleActive,
    deleteVoucher,
    validate,
    getStatusBadgeStyle,
  } = useVoucherController();

  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [packageFilter, setPackageFilter] = useState<string>('Semua paket');
  const [periodFilter, setPeriodFilter] = useState<string>('Semua periode');

  // Modal states
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VoucherFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const selectedVoucher = useMemo(
    () => vouchers.find((v) => v.id === selectedVoucherId) ?? null,
    [vouchers, selectedVoucherId]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setShowFormModal(true);
  };

  const openEdit = (v: VoucherItem) => {
    setEditingId(v.id);
    setForm(formFromVoucher(v));
    setFormError(null);
    setSelectedVoucherId(null);
    setShowFormModal(true);
  };

  const closeForm = () => {
    setShowFormModal(false);
    setEditingId(null);
    setFormError(null);
  };

  // Listen to Header "Buat voucher" button
  useEffect(() => {
    const handleHeaderAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'create-voucher') {
        setEditingId(null);
        setForm(emptyForm());
        setFormError(null);
        setShowFormModal(true);
      }
    };
    window.addEventListener('forgepro-action', handleHeaderAction);
    return () => window.removeEventListener('forgepro-action', handleHeaderAction);
  }, []);

  const withStatus = useMemo(
    () => vouchers.map((v) => ({ voucher: v, status: getVoucherStatus(v) })),
    [vouchers]
  );

  const counts = useMemo(
    () => ({
      Semua: withStatus.length,
      Aktif: withStatus.filter((x) => x.status === 'Aktif').length,
      Terjadwal: withStatus.filter((x) => x.status === 'Terjadwal').length,
      Berakhir: withStatus.filter((x) => x.status === 'Berakhir').length,
      Nonaktif: withStatus.filter((x) => x.status === 'Nonaktif').length,
    }),
    [withStatus]
  );

  const periodOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const v of vouchers) seen.add(getPeriodGroup(v));
    return Array.from(seen);
  }, [vouchers]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return withStatus.filter(({ voucher: v, status }) => {
      if (activeTab !== 'Semua' && status !== activeTab) return false;
      if (
        packageFilter !== 'Semua paket' &&
        PACKAGE_TARGET_LABEL[v.packageTarget] !== packageFilter
      ) {
        return false;
      }
      if (periodFilter !== 'Semua periode' && getPeriodGroup(v) !== periodFilter) {
        return false;
      }
      if (q !== '') {
        const matchCode = v.code.toLowerCase().includes(q);
        const matchTitle = v.title.toLowerCase().includes(q);
        if (!matchCode && !matchTitle) return false;
      }
      return true;
    });
  }, [withStatus, activeTab, packageFilter, periodFilter, searchQuery]);

  const setField = <K extends keyof VoucherFormState>(
    key: K,
    value: VoucherFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputFromForm(form);
    const error = validate(input, editingId ?? undefined);
    if (error) {
      setFormError(error);
      return;
    }
    if (editingId) {
      updateVoucher(editingId, input);
    } else {
      createVoucher(input);
    }
    closeForm();
  };

  const handleExportCsv = () => {
    const header = [
      'code', 'title', 'description', 'badge', 'discount_type', 'percent_off',
      'amount_off', 'bonus_photos', 'max_discount', 'min_purchase',
      'promo_product_id', 'per_email_limit', 'package_target', 'start_date',
      'end_date', 'quota', 'used', 'status',
    ];
    const esc = (value: string | number): string =>
      `"${String(value).replace(/"/g, '""')}"`;
    const rows = filtered.map(({ voucher: v, status }) =>
      [
        v.code, v.title, v.description, v.badge, v.discountType, v.percentOff,
        v.amountOff, v.bonusPhotos, v.maxDiscount, v.minPurchase,
        v.promoProductId, v.perEmailLimit, v.packageTarget, v.startDate,
        v.endDate, v.quota, v.used, status,
      ]
        .map(esc)
        .join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voucher-forgepro.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: 'Semua', label: `Semua (${counts.Semua})` },
    { key: 'Aktif', label: `Aktif (${counts.Aktif})` },
    { key: 'Terjadwal', label: `Terjadwal (${counts.Terjadwal})` },
    { key: 'Berakhir', label: `Berakhir (${counts.Berakhir})` },
    { key: 'Nonaktif', label: `Nonaktif (${counts.Nonaktif})` },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Voucher aktif
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {summary.active}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Dari {summary.total} voucher yang dibuat
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Total penggunaan
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {summary.totalUsed}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Akumulasi seluruh voucher
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Sisa kuota aktif
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {summary.remainingQuota}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Pemakaian yang masih tersedia
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Promo terjadwal
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {summary.scheduled}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            {summary.nextStart
              ? `Mulai ${formatDateShort(summary.nextStart)}`
              : 'Belum ada promo terjadwal'}
          </span>
        </Card>
      </div>

      {/* Main Card: Daftar voucher */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Daftar voucher
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] transition-colors"
          >
            + Buat voucher
          </button>
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
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari kode atau judul promo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

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
                {periodOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
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
                <th className="pb-3 pr-4">KODE / PROMO</th>
                <th className="pb-3 px-4">DISKON</th>
                <th className="pb-3 px-4">PAKET</th>
                <th className="pb-3 px-4">MASA BERLAKU</th>
                <th className="pb-3 px-4">PENGGUNAAN / KUOTA</th>
                <th className="pb-3 px-4">STATUS</th>
                <th className="pb-3 pl-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filtered.map(({ voucher: v, status }) => {
                const [discountMain, discountSub] = describeDiscount(v);
                const progressPercent =
                  v.quota > 0
                    ? Math.min(100, Math.round((v.used / v.quota) * 100))
                    : 0;
                return (
                  <tr
                    key={v.id}
                    onClick={() => {
                      setConfirmDelete(false);
                      setSelectedVoucherId(v.id);
                    }}
                    className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-content-primary tracking-wide">
                          {v.code}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {v.title}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-content-primary">
                          {discountMain}
                        </span>
                        <span className="text-[11px] text-content-muted">
                          {discountSub}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                      {PACKAGE_TARGET_LABEL[v.packageTarget]}
                    </td>

                    <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                      {formatPeriod(v)}
                    </td>

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

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-4 pl-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(v);
                        }}
                        className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Ubah</span>
                        <span>&rarr;</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-content-muted">
                    Belum ada voucher yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle">
          <span className="text-xs text-content-muted">
            Menampilkan seluruh {filtered.length} voucher
          </span>

          <button
            type="button"
            onClick={handleExportCsv}
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
            Pelanggan tidak login, sehingga batas pemakaian dihitung per email
            saat checkout. Atur batas per email pada setiap voucher (bawaan 1×).
          </p>
        </Card>

        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-2.5">
          <h3 className="text-sm sm:text-base font-semibold text-content-primary">
            Penerapan diskon
          </h3>
          <p className="text-xs text-content-muted leading-relaxed">
            Harga di Google Play ditentukan SKU produk. Agar potongan benar-benar
            berlaku, isi SKU promo (<code>promo_product_id</code>) atau gunakan
            bonus foto. Biaya cetak dan pengiriman tidak termasuk dasar diskon.
          </p>
        </Card>
      </div>

      {/* Modal Buat / Ubah Voucher */}
      {showFormModal && (
        <div
          onClick={closeForm}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={closeForm}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              {editingId ? 'Ubah voucher' : 'Buat voucher baru'}
            </h3>
            <p className="text-xs text-content-muted mb-5">
              Data ini tampil di sheet &ldquo;Pilih Kupon&rdquo; dan dipakai saat
              validasi kode di aplikasi.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Kode voucher *"
                  hint={editingId ? undefined : 'Huruf besar, angka, - atau _.'}
                >
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setField('code', e.target.value.toUpperCase())}
                    placeholder="KARIER20"
                    className={`${inputClass} font-mono tracking-wide`}
                  />
                </Field>

                <Field label="Badge" hint="Label kecil di kartu kupon, mis. PALING HEMAT.">
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setField('badge', e.target.value)}
                    placeholder="PROMO"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Judul *">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="Diskon 15% Spesial Rilis 2026"
                  className={inputClass}
                />
              </Field>

              <Field label="Deskripsi">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Potongan 15% langsung untuk seluruh pilihan paket jas AI."
                  className={`${inputClass} resize-none leading-relaxed`}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Jenis potongan">
                  <div className="relative">
                    <select
                      value={form.discountType}
                      onChange={(e) =>
                        setField('discountType', e.target.value as VoucherDiscountType)
                      }
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="percent">Persen (%)</option>
                      <option value="amount">Nominal (Rp)</option>
                      <option value="none">Hanya bonus foto</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                  </div>
                </Field>

                {form.discountType === 'percent' && (
                  <Field label="Diskon persen *" hint="1–100 (percent_off)">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.percentOff}
                      onChange={(e) => setField('percentOff', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
                {form.discountType === 'amount' && (
                  <Field label="Potongan (Rp) *" hint="amount_off, tanpa titik">
                    <input
                      type="number"
                      min={1}
                      value={form.amountOff}
                      onChange={(e) => setField('amountOff', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
                {form.discountType === 'none' && <div />}

                <Field label="Bonus foto" hint="bonus_photos (opsional)">
                  <input
                    type="number"
                    min={0}
                    value={form.bonusPhotos}
                    onChange={(e) => setField('bonusPhotos', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {form.discountType === 'percent' && (
                  <Field label="Maks. potongan (Rp)" hint="Kosongkan bila tanpa batas">
                    <input
                      type="number"
                      min={0}
                      value={form.maxDiscount}
                      onChange={(e) => setField('maxDiscount', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                )}
                <Field label="Minimum pembelian (Rp)" hint="Kosongkan bila tanpa minimum">
                  <input
                    type="number"
                    min={0}
                    value={form.minPurchase}
                    onChange={(e) => setField('minPurchase', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Berlaku untuk paket">
                  <div className="relative">
                    <select
                      value={form.packageTarget}
                      onChange={(e) =>
                        setField('packageTarget', e.target.value as VoucherPackageTarget)
                      }
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="all">Semua paket</option>
                      <option value="esensial">Esensial</option>
                      <option value="profesional">Profesional</option>
                      <option value="eksklusif">Eksklusif</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                  </div>
                </Field>

                <Field label="SKU promo Play Console" hint="promo_product_id (opsional)">
                  <input
                    type="text"
                    value={form.promoProductId}
                    onChange={(e) => setField('promoProductId', e.target.value)}
                    placeholder="forgepro_profesional_promo"
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tanggal mulai *">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setField('startDate', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Tanggal berakhir *">
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setField('endDate', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Kuota total *" hint="Jumlah pemakaian seluruh pelanggan">
                  <input
                    type="number"
                    min={1}
                    value={form.quota}
                    onChange={(e) => setField('quota', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Batas per email *" hint="Pelanggan tamu dikenali dari email">
                  <input
                    type="number"
                    min={1}
                    value={form.perEmailLimit}
                    onChange={(e) => setField('perEmailLimit', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#D9B06F] cursor-pointer"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold text-content-primary">
                    Voucher aktif
                  </span>
                  <span className="text-[11px] text-content-muted">
                    Bila dimatikan, voucher tidak ditawarkan dan ditolak saat validasi
                    meskipun masih dalam masa berlaku.
                  </span>
                </span>
              </label>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                  {formError}
                </div>
              )}

              <div className="mt-2 flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285]"
                >
                  {editingId ? 'Simpan perubahan' : 'Simpan voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Voucher */}
      {selectedVoucher && (
        <div
          onClick={() => setSelectedVoucherId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedVoucherId(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              {selectedVoucher.code}
            </h3>
            <p className="text-xs text-content-muted mb-1">
              {selectedVoucher.title} · {formatPeriod(selectedVoucher)}
            </p>
            {selectedVoucher.description && (
              <p className="text-xs text-content-muted mb-5 leading-relaxed">
                {selectedVoucher.description}
              </p>
            )}

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Potongan</span>
                <span className="font-semibold text-content-primary text-right">
                  {describeDiscount(selectedVoucher).join(' · ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Paket</span>
                <span className="font-semibold text-content-primary">
                  {PACKAGE_TARGET_LABEL[selectedVoucher.packageTarget]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Batas per email</span>
                <span className="font-semibold text-content-primary">
                  {selectedVoucher.perEmailLimit}×
                </span>
              </div>
              {selectedVoucher.promoProductId && (
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">SKU promo</span>
                  <span className="font-mono text-content-primary">
                    {selectedVoucher.promoProductId}
                  </span>
                </div>
              )}
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
                    getVoucherStatus(selectedVoucher)
                  )}`}
                >
                  {getVoucherStatus(selectedVoucher)}
                </span>
              </div>
            </div>

            {confirmDelete ? (
              <div className="mt-5 flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-content-primary">
                  Hapus voucher <b>{selectedVoucher.code}</b>? Tindakan ini tidak
                  dapat dibatalkan. Untuk menghentikan sementara, gunakan
                  &ldquo;Nonaktifkan&rdquo;.
                </div>
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                  >
                    Batalkan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteVoucher(selectedVoucher.id);
                      setConfirmDelete(false);
                      setSelectedVoucherId(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    Hapus voucher
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleActive(selectedVoucher.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                  >
                    {selectedVoucher.isActive ? 'Nonaktifkan' : 'Aktifkan kembali'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(selectedVoucher)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
                  >
                    Ubah
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VouchersPage;
