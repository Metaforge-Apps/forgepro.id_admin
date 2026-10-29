import React, { useState, ChangeEvent } from 'react';
import { Card } from '../components/common/Card';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  useStyleController,
  SuitCategory,
  SuitStatus,
  SuitAspectRatio,
  SUIT_CATEGORIES,
  slugifyStyleId,
} from '../controllers/style-controller';
import { StyleAppFields, parseTags } from '../components/catalog/StyleAppFields';
import { readImageAsDataUrl } from '../utils/image';

export function AddSuitPage() {
  const navigate = useNavigate();
  const { createStyle, getStyleById, summary } = useStyleController();

  const [name, setName] = useState<string>('');
  const [styleId, setStyleId] = useState<string>('');
  const [category, setCategory] = useState<SuitCategory | ''>('');
  const [description, setDescription] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<SuitAspectRatio>('3:4');
  const [tagsText, setTagsText] = useState<string>('');
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [status, setStatus] = useState<SuitStatus>('Draf');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const effectiveId = slugifyStyleId(styleId || name);
  const idTaken = effectiveId !== '' && Boolean(getStyleById(effectiveId));

  const handleCategoryChange = (val: SuitCategory | '') => {
    setCategory(val);
    if (val === 'Wanita') {
      setAspectRatio('9:16');
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImagePreview(await readImageAsDataUrl(file));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal membaca gambar.');
    }
  };

  const handleSave = (publishImmediately?: boolean) => {
    if (!name.trim()) {
      alert('Nama gaya wajib diisi.');
      return;
    }
    if (!category) {
      alert('Kategori wajib dipilih.');
      return;
    }
    if (!effectiveId) {
      alert('ID template tidak valid.');
      return;
    }
    if (idTaken) {
      alert(`ID template "${effectiveId}" sudah dipakai gaya lain.`);
      return;
    }
    const targetStatus: SuitStatus = publishImmediately ? 'Tayang' : status;
    if (targetStatus === 'Tayang' && !prompt.trim()) {
      alert('Prompt AI wajib diisi sebelum gaya ditayangkan.');
      return;
    }
    createStyle({
      id: effectiveId,
      name: name.trim(),
      category,
      description,
      prompt,
      aspectRatio,
      tags: parseTags(tagsText),
      isPopular,
      isNew,
      status: targetStatus,
      image: imagePreview || undefined,
    });
    navigate('/katalog-jas');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Subheader: Back Navigation & Meta */}
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
            Tambah gaya
          </h2>

          <p className="text-xs text-content-muted mt-1">
            Katalog Gaya Jas / Gaya baru · {summary.total} gaya · {summary.published} tayang · {summary.draft} draf
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-center">
          <span className="text-xs text-content-muted">Belum disimpan</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30">
            {status}
          </span>
        </div>
      </div>

      {/* Main 2 Columns Layout Sesuai Referensi Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form & Upload Box (8 Cols) */}
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
                placeholder="Contoh: Jas Cokelat Kontemporer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
              />
            </div>

            {/* ID Template */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                ID template
              </label>
              <input
                type="text"
                placeholder={name ? slugifyStyleId(name) : 'dibuat otomatis dari nama gaya'}
                value={styleId}
                onChange={(e) => setStyleId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors font-mono"
              />
              <span
                className={`text-[11px] mt-0.5 ${
                  idTaken ? 'text-rose-500' : 'text-content-muted'
                }`}
              >
                {idTaken
                  ? `ID "${effectiveId}" sudah dipakai gaya lain.`
                  : `ID yang dipakai aplikasi: ${effectiveId || '-'}. Tidak bisa diubah setelah disimpan.`}
              </span>
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-2 text-xs">
              <label className="font-semibold text-content-primary">
                Kategori *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as SuitCategory | '')}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                >
                  <option value="">Pilih kategori</option>
                  {SUIT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>

              {/* Tag Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                {SUIT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] border transition-colors select-none ${
                      category === cat
                        ? 'border-[#D9B06F] bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] font-semibold'
                        : 'border-border-subtle bg-[#F7F5F0]/80 dark:bg-surface-hover text-content-muted hover:text-content-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Deskripsi / karakter gaya
              </label>
              <textarea
                rows={4}
                placeholder="Jelaskan potongan jas, warna, pencahayaan, dan karakter latar."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors resize-none leading-relaxed"
              />
              <span className="text-[11px] text-content-muted mt-0.5">
                Membantu tim menjaga konsistensi hasil foto AI.
              </span>
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
            <h3 className="text-base font-semibold text-content-primary">
              Gambar gaya *
            </h3>

            {/* Dotted Upload Dropzone */}
            <div className="relative border border-dashed border-border-subtle hover:border-[#D9B06F]/60 bg-[#F7F5F0]/60 dark:bg-surface-hover/40 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-colors">
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {imagePreview ? (
                <div className="relative flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Pratinjau"
                    className="max-h-48 rounded-xl object-contain mb-3 border border-border-subtle shadow-sm"
                  />
                  <span className="text-xs font-semibold text-[#D9B06F]">
                    Klik untuk mengganti gambar
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <UploadCloud className="w-6 h-6 text-content-primary mb-1" />
                  <span className="text-xs font-semibold text-content-primary">
                    Tarik gambar ke sini atau pilih berkas
                  </span>
                  <span className="text-[11px] text-content-muted">
                    JPG atau PNG · Maks. 5 MB
                  </span>
                  <span className="mt-2 px-4 py-2 rounded-xl border border-border-subtle text-xs font-semibold bg-surface-card hover:bg-surface-hover text-content-primary">
                    Pilih gambar
                  </span>
                </div>
              )}
            </div>

            <span className="text-xs text-content-muted leading-relaxed">
              Gunakan gambar yang menunjukkan karakter gaya, bukan identitas pelanggan. Pratinjau akan muncul setelah berkas dipilih.
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

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-5 py-2.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-xs font-semibold text-content-primary select-none transition-colors"
              >
                Simpan draf
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-6 py-2.5 rounded-xl bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-[#D9B06F]/60 text-xs font-semibold select-none shadow-sm transition-all"
              >
                Publikasikan
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Visibilitas + Info Notices (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Card Status & Visibilitas */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Status &amp; visibilitas
            </h3>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-content-primary">
                Status awal
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SuitStatus)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                >
                  <option value="Draf">Draf</option>
                  <option value="Tayang">Tayang</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
              </div>
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Belum ditampilkan pada pilihan pelanggan. Pilih Tayang untuk mempublikasikan setelah data lengkap.
            </p>

            <div className="pt-3 border-t border-border-subtle/60 flex flex-col gap-1 text-xs">
              <span className="font-semibold text-content-primary">
                Pilihan status
              </span>
              <span className="text-content-muted">Draf · Tayang</span>
            </div>
          </Card>

          {/* Info Notice 1: Siap Sebelum Tayang */}
          <div className="flex items-start gap-2.5 px-1">
            <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-content-primary">
                Siap sebelum tayang
              </span>
              <p className="text-xs text-content-muted leading-relaxed">
                Lengkapi nama, kategori, dan gambar gaya. Simpan draf untuk melanjutkan nanti atau pilih Publikasikan jika sudah siap.
              </p>
            </div>
          </div>

          {/* Info Notice 2: Katalog Belum Berubah */}
          <div className="flex items-start gap-2.5 px-1">
            <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-content-primary">
                Katalog belum berubah
              </span>
              <p className="text-xs text-content-muted leading-relaxed">
                {summary.total} gaya existing tetap tersimpan. Gaya baru hanya ditambahkan setelah Anda menyimpan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSuitPage;
