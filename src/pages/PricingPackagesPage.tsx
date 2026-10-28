import React from 'react';
import { Card } from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Edit2,
  Info,
  X,
  ShieldAlert,
} from 'lucide-react';
import { usePackageController } from '../controllers/package-controller';

export function PricingPackagesPage() {
  const navigate = useNavigate();
  const {
    packages,
    rules,
    packageToDeactivate,
    setPackageToDeactivate,
    handleConfirmDeactivate,
    getStatusBadgeStyle,
  } = usePackageController();

  return (
    <div className="flex flex-col gap-6">
      {/* 3 Package Cards Row Sesuai Referensi Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setPackageToDeactivate(pkg)}
            className={`group rounded-2xl p-6 sm:p-7 bg-surface-card flex flex-col justify-between transition-all duration-200 cursor-pointer ${
              pkg.isFeatured
                ? 'border border-[#D9B06F] shadow-sm hover:shadow-md'
                : 'border border-border-card shadow-sm hover:border-[#D9B06F]/60 hover:shadow-md'
            }`}
          >
            <div>
              {/* Top Row: Tayang pill & Tag */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border select-none ${getStatusBadgeStyle(
                    pkg.status
                  )}`}
                >
                  {pkg.status}
                </span>
                <span className="text-xs text-content-muted">{pkg.tag}</span>
              </div>

              {/* Title & Price */}
              <h3 className="font-serif text-2xl font-medium text-content-primary tracking-tight group-hover:text-[#D9B06F] transition-colors">
                {pkg.name}
              </h3>

              <div className="mt-2 mb-1 flex items-baseline gap-1">
                <span className="font-serif text-3xl sm:text-[34px] font-medium tracking-tight text-content-primary">
                  {pkg.price}
                </span>
              </div>

              <span className="text-xs text-content-muted block mb-3">
                {pkg.priceSub}
              </span>

              <p className="text-xs text-content-muted mb-5 leading-relaxed">
                {pkg.description}
              </p>

              {/* Feature Checkmarks (Underlist) */}
              <div className="pt-4 border-t border-border-subtle/70 flex flex-col gap-2.5">
                {pkg.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-content-primary"
                  >
                    <Check className="w-3.5 h-3.5 text-[#D9B06F] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Stat & Edit Button */}
            <div className="mt-6 pt-4 border-t border-border-subtle/70 flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-content-muted">
                  Transaksi 7 hari terakhir
                </span>
                <span className="font-semibold text-content-primary">
                  {pkg.salesShare}
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/paket-harga/edit', { state: { pkg } });
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold select-none transition-all ${
                    pkg.isFeatured
                      ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-[#D9B06F]/60'
                      : 'border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ubah paket</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Card: Ketentuan & Pengelolaan Paket Sesuai Referensi Figma */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-base sm:text-lg font-semibold text-content-primary">
            Ketentuan &amp; pengelolaan paket
          </h3>
          <span className="text-xs text-content-muted">
            Berlaku untuk semua paket
          </span>
        </div>

        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">KETENTUAN</th>
                <th className="pb-3 px-4">PENGATURAN SAAT INI</th>
                <th className="pb-3 pl-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {rules.map((r, i) => (
                <tr
                  key={i}
                  onClick={() => {
                    if (r.title === 'Cetak fisik & pengiriman') {
                      navigate('/pengaturan');
                    } else if (!r.badge) {
                      navigate('/paket-harga/edit');
                    }
                  }}
                  className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                >
                  <td className="py-4 pr-4 font-semibold text-content-primary">
                    {r.title}
                  </td>
                  <td className="py-4 px-4 text-content-muted">{r.setting}</td>
                  <td className="py-4 pl-4 text-right whitespace-nowrap">
                    {r.badge ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        {r.badge}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (r.title === 'Cetak fisik & pengiriman') {
                            navigate('/pengaturan');
                          } else {
                            navigate('/paket-harga/edit');
                          }
                        }}
                        className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors"
                      >
                        {r.actionText}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Info Notice: Google Play Billing */}
      <div className="flex items-start gap-2.5 px-1 pt-1">
        <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-content-primary">
            Pembayaran hanya melalui Google Play Billing
          </span>
          <p className="text-xs text-content-muted leading-relaxed">
            Produk digital, sekali beli, bukan langganan. Harga aktual dikelola di
            Play Console; harga di admin hanya referensi. Perubahan manfaat tidak
            mengubah pesanan yang sudah dibayar.
          </p>
        </div>
      </div>

      {/* Modal Hapus / Nonaktifkan Paket Sesuai Foto Referensi 2 */}
      {packageToDeactivate && (
        <div
          onClick={() => setPackageToDeactivate(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 sm:p-7 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setPackageToDeactivate(null)}
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
              Paket {packageToDeactivate.name} telah digunakan dalam transaksi. Pilih tindakan aman untuk menjaga histori pelanggan.
            </p>

            {/* Preview Box Paket */}
            <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-surface-hover/70 border border-border-subtle mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif text-xl font-medium text-content-primary">
                  {packageToDeactivate.name}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                    packageToDeactivate.status
                  )}`}
                >
                  {packageToDeactivate.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-content-primary">
                {packageToDeactivate.price} · harga referensi
              </p>
              <p className="text-[11px] text-content-muted mt-1">
                {packageToDeactivate.sku || `forgepro_${packageToDeactivate.name.toLowerCase()}`} · Sekali beli
              </p>
              <p className="text-[11px] text-content-muted mt-0.5">
                {packageToDeactivate.photoCount || '12'} hasil foto AI · Pilihan {packageToDeactivate.suitChoices || '4 gaya jas'} · Akses unduhan 30 hari
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
                onClick={() => setPackageToDeactivate(null)}
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
    </div>
  );
}

export default PricingPackagesPage;
