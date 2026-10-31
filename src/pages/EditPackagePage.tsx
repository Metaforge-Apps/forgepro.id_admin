import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Info,
  Package,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';
import {
  usePackageController,
  PricingPackageItem,
  PackageStatus,
  PACKAGE_TIER_LABEL,
  formatRupiah,
} from '../controllers/package-controller';
import { buildPackageDescription } from '../controllers/package-controller/package.types';
import {
  useDirtyForm,
  DirtyStatusBadge,
  DirtyGuardModal,
} from '../components/common/DirtyGuard';

interface EditPackageLocationState {
  pkg?: PricingPackageItem;
}

const toInt = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
};

export function EditPackagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updatePackage, getPackageById, packages } = usePackageController();

  const state = location.state as EditPackageLocationState | null;
  const requestedId = state?.pkg?.id;
  // Selalu ambil data terbaru dari controller; jika halaman dibuka langsung, pakai paket pertama.
  const incomingPkg =
    (requestedId ? getPackageById(requestedId) : undefined) ?? packages[0];

  const [pkgId] = useState<string>(incomingPkg?.id || '');
  const tierLabel = incomingPkg ? PACKAGE_TIER_LABEL[incomingPkg.tier] : '-';
  const [packageName, setPackageName] = useState<string>(
    incomingPkg?.name || ''
  );
  const [photoCount, setPhotoCount] = useState<string>(
    String(incomingPkg?.photoCount ?? 12)
  );
  const [creditAmount, setCreditAmount] = useState<string>(
    String(incomingPkg?.creditAmount ?? 60)
  );
  const [maxTemplates, setMaxTemplates] = useState<string>(
    String(incomingPkg?.maxTemplates ?? 1)
  );
  const [creditPerPhoto, setCreditPerPhoto] = useState<string>(
    String(incomingPkg?.creditPerPhoto ?? 5)
  );
  const [canEditPrompt, setCanEditPrompt] = useState<boolean>(
    Boolean(incomingPkg?.canEditPrompt ?? (incomingPkg?.tier !== 'esensial'))
  );
  const [extraBenefits, setExtraBenefits] = useState<string>(
    incomingPkg?.extraBenefits || ''
  );
  const [accessDuration, setAccessDuration] = useState<string>(
    incomingPkg?.accessDuration || '14 hari'
  );
  const [displayOrder, setDisplayOrder] = useState<string>(
    String(incomingPkg?.displayOrder ?? 1)
  );
  const [status, setStatus] = useState<PackageStatus>(
    incomingPkg?.status || 'Tayang'
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    Boolean(incomingPkg?.isFeatured)
  );

  // Google Play Billing Fields
  const [productId, setProductId] = useState<string>(incomingPkg?.sku || '');
  const [refPrice, setRefPrice] = useState<string>(
    String(incomingPkg?.priceValue ?? '')
  );

  const [showDeactivateModal, setShowDeactivateModal] = useState<boolean>(false);

  // Pelacakan perubahan belum disimpan (Fase 0: 0.9)
  const savedSnapshot = {
    packageName: incomingPkg?.name || '',
    photoCount: String(incomingPkg?.photoCount ?? 12),
    creditAmount: String(incomingPkg?.creditAmount ?? 60),
    maxTemplates: String(incomingPkg?.maxTemplates ?? 1),
    creditPerPhoto: String(incomingPkg?.creditPerPhoto ?? 5),
    canEditPrompt: Boolean(incomingPkg?.canEditPrompt ?? (incomingPkg?.tier !== 'esensial')),
    extraBenefits: incomingPkg?.extraBenefits || '',
    accessDuration: incomingPkg?.accessDuration || '14 hari',
    displayOrder: String(incomingPkg?.displayOrder ?? 1),
    status: incomingPkg?.status || 'Tayang',
    isFeatured: Boolean(incomingPkg?.isFeatured),
    productId: incomingPkg?.sku || '',
    refPrice: String(incomingPkg?.priceValue ?? ''),
  };
  const currentSnapshot = {
    packageName,
    photoCount,
    creditAmount,
    maxTemplates,
    creditPerPhoto,
    canEditPrompt,
    extraBenefits,
    accessDuration,
    displayOrder,
    status,
    isFeatured,
    productId,
    refPrice,
  };
  const { isDirty, hasPendingLeave, guardAction, confirmLeave, cancelLeave } =
    useDirtyForm(savedSnapshot, currentSnapshot);

  const handleSave = () => {
    if (!pkgId) return;
    if (!packageName.trim()) {
      alert('Nama paket wajib diisi.');
      return;
    }
    if (!productId.trim()) {
      alert('Google Play product ID wajib diisi.');
      return;
    }
    if (toInt(refPrice) <= 0) {
      alert('Harga referensi harus lebih dari 0.');
      return;
    }
    if (toInt(photoCount) <= 0 || toInt(creditAmount) <= 0 || toInt(maxTemplates) <= 0) {
      alert('Jumlah foto, kredit AI, dan template jas harus lebih dari 0.');
      return;
    }

    const autoDesc = buildPackageDescription({
      photoCount: toInt(photoCount),
      creditAmount: toInt(creditAmount),
      creditPerPhoto: toInt(creditPerPhoto) || 5,
      maxTemplates: toInt(maxTemplates),
      canEditPrompt,
    });

    const durationDays = toInt(accessDuration) || 14;

    updatePackage(pkgId, {
      name: packageName,
      description: autoDesc,
      photoCount: toInt(photoCount),
      creditAmount: toInt(creditAmount),
      maxTemplates: toInt(maxTemplates),
      creditPerPhoto: toInt(creditPerPhoto) || 5,
      canEditPrompt,
      downloadDurationDays: durationDays,
      extraBenefits,
      accessDuration: accessDuration.includes('hari') ? accessDuration : `${durationDays} hari`,
      displayOrder: toInt(displayOrder) || 1,
      status,
      sku: productId,
      priceValue: toInt(refPrice),
      isFeatured,
    });
    // Data sudah tersimpan: arahkan tanpa peringatan perubahan
    setTimeout(() => navigate('/paket-harga'), 0);
  };

  const handleConfirmDeactivate = () => {
    setStatus('Draf');
    updatePackage(pkgId, { status: 'Draf' });
    setShowDeactivateModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Subheader: Back link, Title, Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/paket-harga"
            className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke daftar</span>
          </Link>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-content-primary">
            Edit paket
          </h2>

          <p className="text-xs text-content-muted mt-1">
            Paket &amp; Harga / {packageName} · {packages.length} paket existing tetap tersimpan
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-center">
          <span className="text-xs text-content-muted">
            <DirtyStatusBadge isDirty={isDirty} />
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              status === 'Tayang'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Main 2 Columns Layout Sesuai Foto Referensi 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Form Informasi & Manfaat Paket (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Informasi &amp; manfaat paket
            </h3>

            {/* Tier Paket (tidak bisa diubah) */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Tier paket
              </label>
              <input
                type="text"
                value={tierLabel}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-hover border border-border-subtle text-content-muted cursor-not-allowed"
              />
              <span className="text-[11px] text-content-muted">
                Tier dipakai aplikasi untuk mengenali paket sehingga tidak dapat diubah.
              </span>
            </div>

            {/* Nama Paket */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Nama paket *
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
              />
            </div>

            {/* Pratinjau Deskripsi Otomatis (Fase 1: Rule 5) */}
            <div className="flex flex-col gap-1.5 text-xs p-3.5 rounded-xl bg-surface-hover/60 border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-content-primary">
                  Deskripsi otomatis (terstruktur)
                </span>
                <span className="text-[10px] text-[#D9B06F] font-semibold uppercase tracking-wider">
                  Bebas Kontradiksi
                </span>
              </div>
              <p className="text-xs text-content-primary font-medium leading-relaxed">
                {buildPackageDescription({
                  photoCount: toInt(photoCount),
                  creditAmount: toInt(creditAmount),
                  creditPerPhoto: toInt(creditPerPhoto) || 5,
                  maxTemplates: toInt(maxTemplates),
                  canEditPrompt,
                })}
              </p>
              <span className="text-[11px] text-content-muted">
                Dihasilkan otomatis dari field terstruktur di bawah (jumlah foto, kuota kredit, template jas, &amp; izin kustom prompt).
              </span>
            </div>

            {/* Row 1: Jumlah Hasil Foto, Kredit AI, Kredit per Foto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Jumlah hasil foto *
                </label>
                <input
                  type="number"
                  min={1}
                  value={photoCount}
                  onChange={(e) => setPhotoCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Foto final berkualitas tinggi
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Total kuota kredit AI *
                </label>
                <input
                  type="number"
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Hingga {Math.floor((toInt(creditAmount) || 60) / (toInt(creditPerPhoto) || 5))}x generate
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Kredit per render foto *
                </label>
                <input
                  type="number"
                  min={1}
                  value={creditPerPhoto}
                  onChange={(e) => setCreditPerPhoto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Standar FLUX: 5 kredit/foto
                </span>
              </div>
            </div>

            {/* Row 2: Maks. Template Jas & Izin Edit Custom Prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs items-start">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Maks. template gaya jas *
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxTemplates}
                  onChange={(e) => setMaxTemplates(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Jumlah template jas yang bebas dipilih pemesan
                </span>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-semibold text-content-primary">
                  Kustom Prompt Pelanggan
                </label>
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-card border border-border-subtle cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={canEditPrompt}
                    onChange={(e) => setCanEditPrompt(e.target.checked)}
                    className="w-4 h-4 accent-[#D9B06F] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-content-primary">
                    Bolehkan kustomisasi prompt tambahan
                  </span>
                </label>
              </div>
            </div>

            {/* Manfaat Tambahan */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Manfaat tambahan
              </label>
              <textarea
                rows={3}
                value={extraBenefits}
                onChange={(e) => setExtraBenefits(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors resize-none leading-relaxed"
              />
              <span className="text-[11px] text-content-muted">
                Satu manfaat per baris. Jumlah foto, kredit AI, dan jumlah template ditambahkan otomatis.
              </span>
            </div>

            {/* Row: Masa Akses Unduhan & Urutan Tampilan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Masa akses unduhan
                </label>
                <input
                  type="text"
                  value={accessDuration}
                  onChange={(e) => setAccessDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Sejak foto selesai diproses
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Urutan tampilan
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Angka kecil tampil lebih dahulu
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PackageStatus)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                >
                  <option value="Tayang">Tayang</option>
                  <option value="Draf">Draf</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>
              <span className="text-[11px] text-content-muted">
                Ditawarkan untuk pembelian baru.
              </span>
            </div>

            {/* Direkomendasikan */}
            <label className="flex items-start gap-3 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#D9B06F] cursor-pointer"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-content-primary">
                  Tandai direkomendasikan
                </span>
                <span className="text-[11px] text-content-muted leading-relaxed">
                  Paket diberi label rekomendasi di aplikasi. Hanya satu paket yang bisa direkomendasikan.
                </span>
              </span>
            </label>
          </Card>

          {/* Info Notice Bawah */}
          <div className="flex items-start gap-2.5 px-1 pt-1">
            <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-content-primary">
                Hanya berlaku untuk pesanan baru
              </span>
              <p className="text-xs text-content-muted leading-relaxed">
                Perubahan setelah disimpan hanya berlaku untuk pesanan baru. Transaksi lama, manfaat, dan akses pelanggan tidak berubah.
              </p>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => guardAction(() => navigate('/paket-harga'))}
              className="px-5 py-2.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-xs font-semibold text-content-primary select-none transition-colors"
            >
              Batalkan
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              className="px-6 py-2.5 rounded-xl bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-[#D9B06F]/60 text-xs font-semibold select-none shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan perubahan
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Google Play Billing & Kelola Visibilitas (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Card 1: Google Play Billing */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Google Play Billing
            </h3>

            <div className="flex items-center gap-2 text-xs font-semibold text-content-primary">
              <Package className="w-4 h-4 text-[#D9B06F]" />
              <span>Produk digital · Sekali beli</span>
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Bukan langganan. Pembayaran hanya melalui Google Play Billing.
            </p>

            <div className="pt-3 border-t border-border-subtle/60 flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Google Play product ID *
                </label>
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Harus sesuai dengan produk sekali beli di Play Console.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-content-primary">
                    Harga referensi (Rp) *
                  </label>
                  {toInt(refPrice) > 0 && (
                    <span className="text-xs font-bold text-[#D9B06F]">
                      {formatRupiah(toInt(refPrice))}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min={10000}
                  step={1000}
                  value={refPrice}
                  onChange={(e) => setRefPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  {toInt(refPrice) > 0
                    ? `Format tampilan: ${formatRupiah(toInt(refPrice))}`
                    : 'Masukkan angka rupiah (mis. 59000 untuk Rp59.000)'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-hover/80 dark:bg-surface-hover/60 border border-border-subtle flex items-start gap-2.5 mt-1">
                <Info className="w-4 h-4 text-[#D9B06F] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-content-primary text-xs">
                    Harga aktual di Play Console
                  </span>
                  <span className="text-[11px] text-content-secondary leading-relaxed">
                    Mengubah harga referensi di admin tidak mengubah harga pembelian. Harga yang dibayar pelanggan mengikuti Google Play.
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Kelola Visibilitas */}
          <Card
            padding="p-6 sm:p-7"
            onClick={() => setShowDeactivateModal(true)}
            className="flex flex-col gap-3 cursor-pointer hover:border-[#D9B06F]/60 transition-colors"
          >
            <h3 className="text-base font-semibold text-content-primary">
              Kelola visibilitas
            </h3>

            <p className="text-xs text-content-muted leading-relaxed">
              {packageName} telah dipakai dalam transaksi. Penghapusan permanen tidak tersedia.
            </p>

            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeactivateModal(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-xs font-semibold text-content-primary transition-colors select-none"
              >
                Hapus / nonaktifkan paket
              </button>
            </div>

            <span className="text-[11px] text-content-muted leading-relaxed pt-2 border-t border-border-subtle/60">
              Nonaktifkan untuk menghentikan pembelian baru tanpa mengubah pesanan lama.
            </span>
          </Card>

          <span className="text-xs text-content-muted px-1 leading-relaxed">
            Seluruh paket foto merupakan produk digital profesional yang ditagih via Google Play Billing.
          </span>
        </div>
      </div>

      {/* Modal Hapus / Nonaktifkan Paket Sesuai Foto Referensi 2 */}
      {showDeactivateModal && (
        <div
          onClick={() => setShowDeactivateModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 sm:p-7 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowDeactivateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F7F5F0] dark:bg-surface-hover border border-border-subtle flex items-center justify-center text-content-primary shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-content-primary">
                Hapus paket
              </h3>
            </div>

            <p className="text-xs text-content-muted leading-relaxed mb-5">
              Paket {packageName} telah digunakan dalam transaksi. Pilih tindakan aman untuk menjaga histori pelanggan.
            </p>

            {/* Preview Box Paket */}
            <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-surface-hover/70 border border-border-subtle mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-xl font-medium text-content-primary">
                  {packageName}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {status}
                </span>
              </div>
              <p className="text-xs font-semibold text-content-primary">
                {formatRupiah(toInt(refPrice))} · harga referensi
              </p>
              <p className="text-[11px] text-content-muted mt-1">
                {productId} · Sekali beli
              </p>
              <p className="text-[11px] text-content-muted mt-0.5">
                {photoCount} hasil foto AI · {creditAmount} kredit · maks. {maxTemplates} template · Akses unduhan {accessDuration}
              </p>
            </div>

            {/* Warning Box: Penghapusan permanen tidak tersedia */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-xs text-content-primary">
                  Penghapusan permanen tidak tersedia
                </span>
                <span className="text-[11px] text-content-muted leading-relaxed">
                  Paket ini memiliki histori transaksi. Data paket harus tetap disimpan sebagai bagian dari pesanan pelanggan.
                </span>
              </div>
            </div>

            {/* Nonaktifkan sebagai pilihan aman section */}
            <div className="flex flex-col gap-2 mb-6 text-xs text-content-primary">
              <span className="font-semibold text-content-primary">
                Nonaktifkan sebagai pilihan aman
              </span>
              <div className="flex items-start gap-2 text-content-secondary">
                <Check className="w-3.5 h-3.5 text-[#D9B06F] shrink-0 mt-0.5" />
                <span>Paket tidak ditawarkan untuk pembelian baru.</span>
              </div>
              <div className="flex items-start gap-2 text-content-secondary">
                <Check className="w-3.5 h-3.5 text-[#D9B06F] shrink-0 mt-0.5" />
                <span>Pesanan lama dan histori transaksi tetap tersimpan.</span>
              </div>
              <div className="flex items-start gap-2 text-content-secondary">
                <Check className="w-3.5 h-3.5 text-[#D9B06F] shrink-0 mt-0.5" />
                <span>Akses unduhan pelanggan tetap berlaku sesuai masa akses.</span>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary select-none transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-[#D9B06F]/60 select-none transition-colors shadow-sm"
              >
                Nonaktifkan paket
              </button>
            </div>
          </div>
        </div>
      )}

      <DirtyGuardModal open={hasPendingLeave} onStay={cancelLeave} onLeave={confirmLeave} />
    </div>
  );
}

export default EditPackagePage;
