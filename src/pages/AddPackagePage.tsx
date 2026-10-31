import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Info,
  Package,
} from 'lucide-react';
import {
  usePackageController,
  PackageStatus,
  PackageTier,
  PACKAGE_TIER_LABEL,
  formatRupiah,
} from '../controllers/package-controller';

const toInt = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
};

export function AddPackagePage() {
  const navigate = useNavigate();
  const { createPackage, packages, availableTiers } = usePackageController();

  const [tier, setTier] = useState<PackageTier | ''>(availableTiers[0] ?? '');
  const [packageName, setPackageName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photoCount, setPhotoCount] = useState<string>('12');
  const [creditAmount, setCreditAmount] = useState<string>('100');
  const [maxTemplates, setMaxTemplates] = useState<string>('1');
  const [extraBenefits, setExtraBenefits] = useState<string>('');
  const [accessDuration, setAccessDuration] = useState<string>('14 hari');
  const [displayOrder, setDisplayOrder] = useState<string>(
    String(packages.length + 1)
  );
  const [status, setStatus] = useState<PackageStatus>('Draf');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  // Google Play Billing
  const [productId, setProductId] = useState<string>(
    availableTiers[0] ? `forgepro_${availableTiers[0]}` : ''
  );
  const [refPrice, setRefPrice] = useState<string>('');

  const handleTierChange = (next: PackageTier | '') => {
    setTier(next);
    if (next) {
      if (!packageName.trim()) setPackageName(PACKAGE_TIER_LABEL[next]);
      setProductId(`forgepro_${next}`);
    }
  };

  const handleSave = () => {
    if (!tier) {
      alert('Semua tier paket (Esensial, Profesional, Eksklusif) sudah dibuat.');
      return;
    }
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
    const created = createPackage({
      tier,
      name: packageName,
      description,
      photoCount: toInt(photoCount),
      creditAmount: toInt(creditAmount),
      maxTemplates: toInt(maxTemplates),
      extraBenefits,
      accessDuration,
      displayOrder: toInt(displayOrder) || packages.length + 1,
      status,
      sku: productId,
      priceValue: toInt(refPrice),
      isFeatured,
    });
    if (!created) {
      alert(`Paket tier ${PACKAGE_TIER_LABEL[tier]} sudah ada.`);
      return;
    }
    navigate('/paket-harga');
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
            Tambah paket
          </h2>

          <p className="text-xs text-content-muted mt-1">
            Paket &amp; Harga / Paket baru · Draf belum tersimpan, {packages.length} paket existing tetap
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-center">
          <span className="text-xs text-content-muted">Belum disimpan</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30">
            {status}
          </span>
        </div>
      </div>

      {/* Main 2 Columns Layout Sesuai Foto Referensi 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Form Informasi & Manfaat Paket (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Informasi &amp; manfaat paket
            </h3>

            {/* Tier Paket */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Tier paket *
              </label>
              <div className="relative">
                <select
                  value={tier}
                  onChange={(e) => handleTierChange(e.target.value as PackageTier | '')}
                  disabled={availableTiers.length === 0}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer disabled:cursor-not-allowed disabled:bg-surface-hover"
                >
                  {availableTiers.length === 0 && (
                    <option value="">Semua tier sudah dibuat</option>
                  )}
                  {availableTiers.map((t) => (
                    <option key={t} value={t}>
                      {PACKAGE_TIER_LABEL[t]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>
              <span className="text-[11px] text-content-muted">
                Aplikasi hanya mengenali tier Esensial, Profesional, dan Eksklusif (satu paket per tier).
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

            {/* Deskripsi */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Deskripsi
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
              />
            </div>

            {/* Row: Jumlah Hasil Foto, Kredit AI & Template Jas */}
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
                  photo_count
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Kredit AI *
                </label>
                <input
                  type="number"
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  5 foto per generate = 10 kredit
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Maks. template jas *
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxTemplates}
                  onChange={(e) => setMaxTemplates(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  max_templates (&gt; 1 = pilih banyak)
                </span>
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
                  <option value="Draf">Draf</option>
                  <option value="Tayang">Tayang</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>
              <span className="text-[11px] text-content-muted">
                Tidak ditawarkan sampai dipublikasikan. Pilihan: Draf / Tayang.
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
                Paket baru disimpan sebagai draf
              </span>
              <p className="text-xs text-content-muted leading-relaxed">
                Draf {packageName} tidak mengubah Esensial, Profesional, atau Eksklusif. Tinjau pemetaan produk sebelum ditayangkan.
              </p>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => navigate('/paket-harga')}
              className="px-5 py-2.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-xs font-semibold text-content-primary select-none transition-colors"
            >
              Batalkan
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-[#D9B06F]/60 text-xs font-semibold select-none shadow-sm transition-all"
            >
              Simpan draf
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Google Play Billing & Ringkasan Draf (4 Cols) */}
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
                <label className="font-semibold text-content-primary">
                  Harga referensi (Rp)
                </label>
                <input
                  type="number"
                  min={1}
                  value={refPrice}
                  placeholder="mis. 99000"
                  onChange={(e) => setRefPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-[11px] text-content-muted">
                  Angka rupiah tanpa titik. Referensi internal, bukan harga live.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-surface-hover/60 border border-border-subtle flex items-start gap-2.5 mt-1">
                <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-content-primary text-xs">
                    Harga aktual di Play Console
                  </span>
                  <span className="text-[11px] text-content-muted leading-relaxed">
                    Mengubah harga referensi di admin tidak mengubah harga pembelian. Harga yang dibayar pelanggan mengikuti Google Play.
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Ringkasan Draf */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-content-primary mb-1">
              Ringkasan draf
            </h3>

            <h4 className="font-serif text-2xl font-medium text-content-primary">
              {packageName || 'Paket Baru'}
            </h4>

            <p className="text-xs font-semibold text-content-primary mt-1">
              {refPrice ? formatRupiah(toInt(refPrice)) : 'Rp-'} · referensi
            </p>

            <div className="space-y-1 text-xs text-content-muted mt-2">
              <p>
                {photoCount} hasil foto · {creditAmount} kredit AI · maks. {maxTemplates} template
              </p>
              <p>Akses unduhan {accessDuration}</p>
              <p>
                Urutan tampilan {displayOrder} · {status}
              </p>
            </div>
          </Card>

          <span className="text-xs text-content-muted px-1 leading-relaxed">
            Seluruh paket foto merupakan produk digital profesional yang ditagih via Google Play Billing.
          </span>
        </div>
      </div>
    </div>
  );
}

export default AddPackagePage;
