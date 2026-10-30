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
  SuitAspectRatio,
  SUIT_CATEGORIES,
} from '../controllers/style-controller';
import { StyleAppFields, parseTags } from '../components/catalog/StyleAppFields';
import { readImageAsDataUrl } from '../utils/image';
import {
  useDirtyForm,
  DirtyStatusBadge,
  DirtyGuardModal,
} from '../components/common/DirtyGuard';

interface EditSuitLocationState {
  suit?: SuitStyleItem;
}

export function EditSuitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateStyle, getStyleById, suits, summary } = useStyleController();

  const state = location.state as EditSuitLocationState | null;
  const requestedId = state?.suit?.id;
  // Selalu ambil data terbaru dari katalog; jika halaman dibuka langsung, pakai gaya pertama.
  const incomingSuit =
    (requestedId ? getStyleById(requestedId) : undefined) ?? suits[0];

  const [suitId] = useState<string>(incomingSuit?.id || '');
  const [name, setName] = useState<string>(incomingSuit?.name || '');
  const [category, setCategory] = useState<SuitCategory>(
    incomingSuit?.category || 'Bisnis'
  );
  const [description, setDescription] = useState<string>(
    incomingSuit?.description || ''
  );
  const [prompt, setPrompt] = useState<string>(incomingSuit?.prompt || '');
  const [aspectRatio, setAspectRatio] = useState<SuitAspectRatio>(
    incomingSuit?.aspectRatio || (incomingSuit?.category === 'Wanita' ? '9:16' : '3:4')
  );
  const [tagsText, setTagsText] = useState<string>(
    (incomingSuit?.tags ?? []).join(', ')
  );
  const [isPopular, setIsPopular] = useState<boolean>(
    Boolean(incomingSuit?.isPopular)
  );
  const [isNew, setIsNew] = useState<boolean>(Boolean(incomingSuit?.isNew));
  const [status, setStatus] = useState<SuitStatus>(
    incomingSuit?.status || 'Tayang'
  );
  const [imagePreview, setImagePreview] = useState<string>(
    incomingSuit?.image || ''
  );
  const [photosCount] = useState<number>(incomingSuit?.count ?? 0);

  // Pelacakan perubahan belum disimpan (Fase 0: 0.9)
  const savedSnapshot = {
    name: incomingSuit?.name || '',
    category: incomingSuit?.category || 'Bisnis',
    description: incomingSuit?.description || '',
    prompt: incomingSuit?.prompt || '',
    aspectRatio:
      incomingSuit?.aspectRatio || (incomingSuit?.category === 'Wanita' ? '9:16' : '3:4'),
    tagsText: (incomingSuit?.tags ?? []).join(', '),
    isPopular: Boolean(incomingSuit?.isPopular),
    isNew: Boolean(incomingSuit?.isNew),
    status: incomingSuit?.status || 'Tayang',
    imagePreview: incomingSuit?.image || '',
  };
  const currentSnapshot = {
    name,
    category,
    description,
    prompt,
    aspectRatio,
    tagsText,
    isPopular,
    isNew,
    status,
    imagePreview,
  };
  const { isDirty, hasPendingLeave, guardAction, confirmLeave, cancelLeave } =
    useDirtyForm(savedSnapshot, currentSnapshot);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImagePreview(await readImageAsDataUrl(file));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membaca gambar.');
    }
  };

  const handleSave = () => {
    if (!suitId) return;
    if (!name.trim()) {
      alert('Nama gaya wajib diisi.');
      return;
    }
    if (status === 'Tayang' && !prompt.trim()) {
      alert('Prompt AI wajib diisi sebelum gaya ditayangkan.');
      return;
    }
    updateStyle(suitId, {
      name,
      category,
      description,
      prompt,
      aspectRatio,
      tags: parseTags(tagsText),
      isPopular,
      isNew,
      status,
      image: imagePreview,
    });
    // Data sudah tersimpan: arahkan tanpa peringatan perubahan
    setTimeout(() => navigate('/katalog-jas'), 0);
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

            {/* ID Template (tidak bisa diubah) */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                ID template
              </label>
              <input
                type="text"
                value={suitId}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-hover border border-border-subtle text-content-muted font-mono cursor-not-allowed"
              />
              <span className="text-[11px] text-content-muted mt-0.5">
                ID dipakai aplikasi & riwayat pesanan sehingga tidak dapat diubah.
              </span>
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
                  {SUIT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>
              <span className="text-[11px] text-content-muted mt-0.5">
                Kategori tersedia: {SUIT_CATEGORIES.join(', ')}.
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

          {/* Card: Prompt AI, aspek rasio, tag, label Populer/Baru */}
          <StyleAppFields
            prompt={prompt}
            onPromptChange={setPrompt}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            tagsText={tagsText}
            onTagsChange={setTagsText}
            isPopular={isPopular}
            onPopularChange={setIsPopular}
            isNew={isNew}
            onNewChange={setIsNew}
          />

          {/* Card 2: Gambar Gaya */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-content-primary">
                Gambar gaya
              </h3>
              <span className="text-xs text-content-muted font-mono bg-surface-hover px-2.5 py-1 rounded-lg">
                Target Rasio: {aspectRatio}
              </span>
            </div>

            {/* Existing Image Display */}
            <div className="w-full max-h-[460px] aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900/30 border border-border-subtle relative flex items-center justify-center">
              {/* Blur backdrop */}
              <img
                src={imagePreview}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none"
              />
              <img
                src={imagePreview}
                alt={name}
                className="relative z-10 w-full h-full object-contain"
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
              onClick={() => guardAction(() => navigate('/katalog-jas'))}
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

      <DirtyGuardModal open={hasPendingLeave} onStay={cancelLeave} onLeave={confirmLeave} />
    </div>
  );
}

export default EditSuitPage;
