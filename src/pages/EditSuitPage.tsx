import React, { useState, ChangeEvent } from 'react';
import { Card } from '../components/common/Card';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  useStyleController,
  SuitStyleItem,
  SuitCategory,
  SuitStatus,
} from '../controllers/style-controller';

interface EditSuitLocationState {
  suit?: SuitStyleItem;
}

export function EditSuitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateStyle, summary } = useStyleController();

  const state = location.state as EditSuitLocationState | null;
  const incomingSuit = state?.suit;

  const [suitId] = useState<string>(incomingSuit?.id || 'suit-1');
  const [name, setName] = useState<string>(
    incomingSuit?.name || 'Jas Navy Klasik'
  );
  const [category, setCategory] = useState<SuitCategory>(
    incomingSuit?.category || 'Bisnis'
  );
  const [description, setDescription] = useState<string>(
    incomingSuit?.description ||
      'Jas navy berpotongan klasik dengan kemeja putih dan dasi netral. Pencahayaan lembut serta latar studio hangat untuk kesan profesional.'
  );
  const [status, setStatus] = useState<SuitStatus>(
    incomingSuit?.status || 'Tayang'
  );
  const [imagePreview, setImagePreview] = useState<string>(
    incomingSuit?.image || '/images/suits/suit-navy-klasik.jpg'
  );
  const [photosCount] = useState<number>(incomingSuit?.count ?? 428);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSave = () => {
    updateStyle(suitId, {
      name,
      category,
      description,
      status,
      image: imagePreview,
    });
    navigate('/katalog-jas');
  };

  const handleToggleActive = () => {
    setStatus((prev) => (prev === 'Tayang' ? 'Draf' : 'Tayang'));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Subheader: Back link, Title, Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/katalog-jas"
            className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke daftar</span>
          </Link>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-content-primary">
            Edit gaya
          </h2>

          <p className="text-xs text-content-muted mt-1">
            Katalog Gaya Jas / {name} · {summary.total} gaya · {summary.published} tayang · {summary.draft} draf
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-center">
          <span className="text-xs text-content-muted">
            Perubahan belum disimpan
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

      {/* Main 2 Columns Layout Sesuai Referensi Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Form Informasi Gaya & Gambar (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Card 1: Informasi Gaya */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Informasi gaya
            </h3>

            {/* Nama Gaya */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Nama gaya *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
              />
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Kategori *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SuitCategory)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                >
                  <option value="Bisnis">Bisnis</option>
                  <option value="Formal">Formal</option>
                  <option value="Seremonial">Seremonial</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>
              <span className="text-[11px] text-content-muted mt-0.5">
                Kategori tersedia: Bisnis, Formal, Seremonial.
              </span>
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Deskripsi / karakter gaya
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors resize-none leading-relaxed"
              />
            </div>
          </Card>

          {/* Card 2: Gambar Gaya */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Gambar gaya
            </h3>

            {/* Existing Image Display */}
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#EAE6DF] dark:bg-[#1C273E] border border-border-subtle relative">
              <img
                src={imagePreview}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Image Footer Controls */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-content-muted">
                Gambar saat ini · Pratinjau gaya existing
              </span>

              <label className="cursor-pointer px-4 py-2 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-xs font-semibold text-content-primary select-none transition-colors">
                <span>Ganti gambar</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <span className="text-xs text-content-muted">
              Gambar existing dipertahankan. JPG atau PNG, maks. 5 MB jika diganti.
            </span>
          </Card>

          {/* Bottom Action Bar Sesuai Referensi Figma */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => navigate('/katalog-jas')}
              className="px-5 py-2.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-xs font-semibold text-content-primary select-none transition-colors"
            >
              Batalkan
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-[#D9B06F]/60 text-xs font-semibold select-none shadow-sm transition-all"
            >
              Simpan perubahan
            </button>
          </div>
        </div>

        {/* Kolom Kanan: Status & Penggunaan + Nonaktifkan Gaya (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Card 1: Status & Penggunaan */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Status &amp; penggunaan
            </h3>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SuitStatus)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                >
                  <option value="Tayang">Tayang</option>
                  <option value="Draf">Draf</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>
              <span className="text-xs text-content-muted mt-0.5">
                Tersedia pada pilihan gaya pelanggan.
              </span>
            </div>

            <div className="pt-4 border-t border-border-subtle/60 flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
                {photosCount}
              </span>
              <span className="text-xs text-content-muted">
                foto dibuat dengan gaya ini
              </span>
            </div>
          </Card>

          {/* Info Notice: Pertahankan Histori Pesanan */}
          <div className="flex items-start gap-2.5 px-1">
            <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-content-primary">
                Pertahankan histori pesanan
              </span>
              <p className="text-xs text-content-muted leading-relaxed">
                Perubahan gaya tidak boleh mengubah hasil atau riwayat pesanan yang sudah dibuat.
              </p>
            </div>
          </div>

          {/* Card 2: Nonaktifkan Gaya */}
          <Card
            padding="p-6 sm:p-7"
            onClick={handleToggleActive}
            className="flex flex-col gap-3 cursor-pointer hover:border-[#D9B06F]/60 transition-colors"
          >
            <h3 className="text-base font-semibold text-content-primary">
              Nonaktifkan gaya
            </h3>
            <p className="text-xs text-content-muted leading-relaxed">
              Hentikan penggunaan untuk pesanan baru tanpa menghapus histori.
            </p>

            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive();
                }}
                className="px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-xs font-semibold text-content-primary transition-colors select-none"
              >
                {status === 'Tayang' ? 'Nonaktifkan gaya' : 'Aktifkan gaya'}
              </button>
            </div>

            <span className="text-xs text-content-muted leading-relaxed pt-2 border-t border-border-subtle/60">
              Gaya ini sudah digunakan. Sebaiknya nonaktifkan, bukan hapus, agar histori pesanan tidak berubah.
            </span>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EditSuitPage;
