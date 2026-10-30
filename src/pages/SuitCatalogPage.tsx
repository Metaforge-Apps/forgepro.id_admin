import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Info,
  X,
  Trash2,
  ShieldAlert,
  Maximize2,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Square,
  Sparkles,
  LayoutGrid,
  Grid3x3,
  AlertTriangle,
  Layers,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  useStyleController,
  SuitStatusFilter,
  SuitSortOption,
  SuitStyleItem,
  SuitAspectRatio,
} from '../controllers/style-controller';

type CardAspectMode = '3:4' | '9:16' | '16:9' | '1:1';
type ImageFitMode = 'cover' | 'contain';
type GridColsMode = '4' | '5' | 'auto';

const CARD_ASPECT_CLASSES: Record<CardAspectMode, string> = {
  '3:4': 'aspect-[3/4]',
  '9:16': 'aspect-[9/16]',
  '16:9': 'aspect-[16/9]',
  '1:1': 'aspect-square',
};

const GRID_COLS_CLASSES: Record<GridColsMode, string> = {
  '4': 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
  '5': 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4',
  'auto': 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4',
};

const ASPECT_LABELS: Record<CardAspectMode, { label: string; icon: React.ReactNode }> = {
  '3:4': { label: '3:4 Potret', icon: <Square className="w-3.5 h-3.5 rotate-90" /> },
  '9:16': { label: '9:16 Vertikal', icon: <Smartphone className="w-3.5 h-3.5" /> },
  '16:9': { label: '16:9 Lanskap', icon: <Monitor className="w-3.5 h-3.5" /> },
  '1:1': { label: '1:1 Persegi', icon: <Square className="w-3.5 h-3.5" /> },
};

function lintPrompt(prompt?: string): { hasWarning: boolean; flaggedWords: string[] } {
  if (!prompt) return { hasWarning: false, flaggedWords: [] };
  const patterns = [
    /\b(\d{1,2}-year-old|\d{1,2}\s*years?\s*old)\b/gi,
    /\b(asian|caucasian|african|latino|fair\s*skin|dark\s*skin|white\s*skin|complexion)\b/gi,
    /\b(beautiful\s*face|handsome|wrinkles?|freckles?|blue\s*eyes|brown\s*eyes)\b/gi,
  ];
  const flagged: string[] = [];
  for (const p of patterns) {
    const matches = prompt.match(p);
    if (matches) {
      flagged.push(...matches);
    }
  }
  return { hasWarning: flagged.length > 0, flaggedWords: Array.from(new Set(flagged)) };
}

export function SuitCatalogPage() {
  const navigate = useNavigate();
  const {
    filteredSuits,
    categoryTabs,
    summary,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    suitToDelete,
    setSuitToDelete,
    handleToggleStatus,
    handleConfirmDelete,
    getStatusBadgeStyle,
  } = useStyleController();

  // Pengaturan tampilan kartu & grid (tersimpan di localStorage)
  const [gridCols, setGridCols] = useState<GridColsMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forgepro_catalog_grid_cols');
      if (saved === '4' || saved === '5' || saved === 'auto') {
        return saved;
      }
    }
    return '5'; // Default 5 grid compact sesuai permintaan user
  });

  const [cardAspect, setCardAspect] = useState<CardAspectMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forgepro_catalog_card_aspect');
      if (saved === '3:4' || saved === '9:16' || saved === '16:9' || saved === '1:1') {
        return saved;
      }
    }
    return '3:4'; // Default potret studio yang seimbang
  });

  const [imageFit, setImageFit] = useState<ImageFitMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forgepro_catalog_image_fit');
      if (saved === 'cover' || saved === 'contain') {
        return saved;
      }
    }
    return 'cover';
  });

  // Modal pratinjau penuh (Full Preview)
  const [previewSuit, setPreviewSuit] = useState<SuitStyleItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('forgepro_catalog_grid_cols', gridCols);
    }
  }, [gridCols]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('forgepro_catalog_card_aspect', cardAspect);
    }
  }, [cardAspect]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('forgepro_catalog_image_fit', imageFit);
    }
  }, [imageFit]);

  const handleCopyPrompt = async (promptText?: string) => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // ignore
    }
  };

  const getAspectBadgeColor = (ratio?: SuitAspectRatio) => {
    switch (ratio) {
      case '9:16':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case '16:9':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case '3:4':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case '1:1':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-neutral-800/80 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-content-muted gap-2">
        <span className="font-semibold text-content-primary">
          {summary.total} gaya · {summary.published} tayang · {summary.draft} draf
        </span>
        <span>Terakhir diperbarui {summary.lastUpdated}</span>
      </div>

      {/* Filter Tabs Kategori */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto border-b border-border-subtle pb-px [scrollbar-width:none]">
        {categoryTabs.map((tab) => {
          const isActive = activeCategory === tab.category;
          return (
            <button
              key={tab.category}
              type="button"
              onClick={() => setActiveCategory(tab.category)}
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

      {/* Filter Controls: Search, Dropdowns, Grid Density & Display Controls */}
      <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            type="text"
            placeholder="Cari nama gaya jas, prompt, atau tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
          />
        </div>

        {/* Filters & Display Controls (Bebas terpotong: wrap responsif) */}
        <div className="flex flex-wrap items-center gap-2 max-w-full overflow-x-auto pb-1 [scrollbar-width:none]">
          {/* Status Filter */}
          <div className="relative">
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SuitStatusFilter)}
              className="appearance-none pl-9 pr-4 py-2 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
            >
              <option value="Semua status">Semua status</option>
              <option value="Tayang">Tayang</option>
              <option value="Draf">Draf</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SuitSortOption)}
              className="appearance-none pl-9 pr-4 py-2 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terpopuler">Terpopuler</option>
              <option value="Nama A-Z">Nama A-Z</option>
            </select>
          </div>

          {/* Selector Jumlah Kolom Grid (4 vs 5 Grid) */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-surface-card border border-border-subtle">
            <button
              type="button"
              onClick={() => setGridCols('4')}
              title="Tampilkan 4 Grid per baris"
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 select-none ${
                gridCols === '4'
                  ? 'bg-[#D9B06F] text-black shadow-xs'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>4 Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setGridCols('5')}
              title="Tampilkan 5 Grid per baris (Ramping & Padat)"
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 select-none ${
                gridCols === '5'
                  ? 'bg-[#D9B06F] text-black shadow-xs'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              <span>5 Grid</span>
            </button>
          </div>

          {/* Selector Rasio Kartu: 3:4 / 9:16 / 16:9 / 1:1 */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-surface-card border border-border-subtle">
            {(['3:4', '9:16', '16:9', '1:1'] as CardAspectMode[]).map((mode) => {
              const active = cardAspect === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCardAspect(mode)}
                  title={`Tampilan kartu rasio ${mode}`}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1 select-none ${
                    active
                      ? 'bg-[#D9B06F] text-black shadow-xs'
                      : 'text-content-muted hover:text-content-primary'
                  }`}
                >
                  {ASPECT_LABELS[mode].icon}
                  <span>{mode}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle Mode Pas Foto: Cover (Fokus Jas) vs Fit (Utuh) */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-surface-card border border-border-subtle">
            <button
              type="button"
              onClick={() => setImageFit('cover')}
              title="Fokus Wajah & Jas (Mengisi kartu secara proporsional)"
              className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all select-none ${
                imageFit === 'cover'
                  ? 'bg-[#D9B06F] text-black shadow-xs'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              Fokus Jas
            </button>
            <button
              type="button"
              onClick={() => setImageFit('contain')}
              title="Foto Utuh (Tanpa crop dengan latar ambient blur)"
              className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all select-none ${
                imageFit === 'contain'
                  ? 'bg-[#D9B06F] text-black shadow-xs'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              Utuh 100%
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Suit Cards (4 sampai 5 Kolom Sesuai Pilihan) */}
      <div className={GRID_COLS_CLASSES[gridCols]}>
        {filteredSuits.map((item) => {
          const ratio = item.aspectRatio ?? '9:16';

          return (
            <div
              key={item.id}
              className="group rounded-2xl overflow-hidden bg-surface-card border border-border-card shadow-xs hover:border-[#D9B06F]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Image Container dengan Ambient Blur Backdrop */}
              <div
                onClick={() => setPreviewSuit(item)}
                className={`w-full ${CARD_ASPECT_CLASSES[cardAspect]} bg-[#12141A] overflow-hidden relative cursor-pointer select-none`}
              >
                {/* Layer 1: Ambient Blurred Backdrop dari foto itu sendiri */}
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
                />

                {/* Layer 2: Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none z-5" />

                {/* Layer 3: Gambar Utama dengan penyesuaian posisi wajah & jas yang pas */}
                <img
                  src={item.image}
                  alt={item.name}
                  className={`relative z-10 w-full h-full transition-transform duration-500 group-hover:scale-[1.03] ${
                    imageFit === 'contain'
                      ? 'object-contain'
                      : 'object-cover object-[center_28%]'
                  }`}
                  loading="lazy"
                />

                {/* Overlay Top Bar: Badge Rasio Asli & Quick Zoom */}
                <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                  {/* Badge Rasio Target Bawaan (9:16 / 16:9 / 3:4) */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold border backdrop-blur-md shadow-xs ${getAspectBadgeColor(
                      ratio
                    )}`}
                  >
                    {ratio === '9:16' && <Smartphone className="w-2.5 h-2.5" />}
                    {ratio === '16:9' && <Monitor className="w-2.5 h-2.5" />}
                    {(ratio === '3:4' || ratio === '1:1') && <Square className="w-2.5 h-2.5" />}
                    <span>{ratio}</span>
                  </span>

                  {/* Tombol Pratinjau Penuh */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewSuit(item);
                    }}
                    title="Pratinjau Foto Penuh & Prompt AI"
                    className="pointer-events-auto p-1.5 rounded-md bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-white border border-white/15 transition-all shadow-xs"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Quick Hint saat hover */}
                <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[9px] text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                    Klik pratinjau penuh
                  </span>
                </div>
              </div>

              {/* Card Body (Compact & Proporsional untuk 4-5 Kolom) */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  {/* Category & Status Pill */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-content-muted truncate">
                      {item.category || 'Formal'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${getStatusBadgeStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-content-primary tracking-tight group-hover:text-[#D9B06F] transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Badges Populer & Baru */}
                  {(item.isPopular || item.isNew) && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {item.isPopular && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold border border-[#D9B06F]/50 bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F]">
                          Populer
                        </span>
                      )}
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                          Baru
                        </span>
                      )}
                    </div>
                  )}

                  {/* Deskripsi Singkat */}
                  {item.description && (
                    <p className="text-[11px] text-content-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <p className="text-[10px] text-content-muted mt-1.5">{item.stats}</p>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle/70 text-xs">
                  <button
                    type="button"
                    onClick={() => navigate('/katalog-jas/edit', { state: { suit: item } })}
                    className="font-semibold text-xs text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1 select-none"
                  >
                    <span>Ubah gaya</span>
                    <span>&rarr;</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id)}
                      title={item.status === 'Tayang' ? 'Nonaktifkan gaya (simpan sebagai draf)' : 'Tayangkan gaya ke katalog'}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all select-none inline-flex items-center gap-1 border ${
                        item.status === 'Tayang'
                          ? 'border-border-subtle bg-surface-card hover:bg-surface-hover text-content-secondary hover:text-content-primary'
                          : 'border-[#D9B06F]/50 bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] hover:bg-[#D9B06F]/20 font-semibold'
                      }`}
                    >
                      <span>{item.status === 'Tayang' ? 'Nonaktifkan' : 'Tayangkan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSuitToDelete(item)}
                      title="Hapus gaya dari katalog"
                      className="p-1 rounded-md text-content-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Info Notice */}
      <div className="flex items-start gap-2.5 px-1 pt-1">
        <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-content-primary">
            Pratinjau mendukung berbagai rasio (9:16 Potret, 16:9 Lanskap, 3:4 Studio, 1:1 Persegi) & Densitas 4-5 Grid
          </span>
          <p className="text-xs text-content-muted leading-relaxed">
            Pilih densitas kolom (4 Grid atau 5 Grid) serta rasio tampilan kartu di toolbar atas untuk melihat bagaimana foto jas tampil di katalog. Gunakan tombol &quot;Fokus Jas&quot; untuk melihat potongan wajah dan jas yang presisi, atau &quot;Utuh 100%&quot; untuk memeriksa seluruh frame tanpa crop.
          </p>
        </div>
      </div>

      {/* Modal Pratinjau Resolusi Penuh (Full Preview Modal) */}
      {previewSuit && (
        <div
          onClick={() => setPreviewSuit(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-surface-card border border-border-card p-6 sm:p-8 shadow-2xl relative flex flex-col lg:flex-row gap-6"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPreviewSuit(null)}
              className="absolute top-5 right-5 z-20 p-2 rounded-xl text-content-muted hover:text-content-primary bg-surface-hover/80 hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Foto Utuh dengan Backdrop Blur */}
            <div className="flex-1 flex items-center justify-center min-h-[340px] sm:min-h-[460px] bg-[#0E1015] rounded-2xl overflow-hidden relative p-3">
              <img
                src={previewSuit.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-125 pointer-events-none"
              />
              <img
                src={previewSuit.image}
                alt={previewSuit.name}
                className="relative z-10 max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
              <span
                className={`absolute bottom-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border backdrop-blur-md shadow-md ${getAspectBadgeColor(
                  previewSuit.aspectRatio ?? '9:16'
                )}`}
              >
                <span>Rasio Target: {previewSuit.aspectRatio ?? '9:16'}</span>
              </span>
            </div>

            {/* Right: Info Detail & AI Prompt */}
            <div className="w-full lg:w-96 flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#D9B06F] uppercase tracking-wider">
                    {previewSuit.category}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                      previewSuit.status
                    )}`}
                  >
                    {previewSuit.status}
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-semibold text-content-primary">
                  {previewSuit.name}
                </h2>

                {previewSuit.description && (
                  <p className="text-xs text-content-muted leading-relaxed">
                    {previewSuit.description}
                  </p>
                )}

                {/* Linter Warning Banner */}
                {lintPrompt(previewSuit.prompt).hasWarning && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Prompt Perlu Ditinjau (Linter FLUX)</span>
                    </div>
                    <p className="text-[11px] text-content-muted leading-relaxed">
                      Terdeteksi deskripsi identitas biometrik: <span className="font-semibold text-amber-500">{lintPrompt(previewSuit.prompt).flaggedWords.join(', ')}</span>. Sarankan hanya mendeskripsikan pakaian jas, tekstur kain, latar studio, dan pencahayaan agar tidak mengubah wajah asli pelanggan.
                    </p>
                  </div>
                )}

                {/* Prompt AI */}
                {previewSuit.prompt && (
                  <div className="flex flex-col gap-2 mt-2 p-3.5 rounded-xl bg-surface-hover/60 border border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-content-primary inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D9B06F]" />
                        Prompt AI
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(previewSuit.prompt)}
                        className="text-[11px] text-[#D9B06F] hover:underline inline-flex items-center gap-1"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-content-muted leading-relaxed line-clamp-6 bg-black/20 p-2.5 rounded-lg select-all">
                      {previewSuit.prompt}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {previewSuit.tags && previewSuit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {previewSuit.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-surface-hover border border-border-subtle text-content-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewSuit;
                    setPreviewSuit(null);
                    navigate('/katalog-jas/edit', { state: { suit: target } });
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] hover:bg-[#c9a161] text-black text-center transition-colors shadow-sm"
                >
                  Ubah gaya ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = previewSuit;
                    setPreviewSuit(null);
                    setSuitToDelete(target);
                  }}
                  className="p-2.5 rounded-xl border border-border-subtle hover:border-rose-500/50 text-content-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Hapus gaya"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Gaya Sesuai Foto Referensi 3 */}
      {suitToDelete && (
        <div
          onClick={() => setSuitToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 sm:p-7 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSuitToDelete(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-content-primary">
                Hapus gaya?
              </h3>
            </div>

            <p className="text-xs text-content-muted leading-relaxed mb-5">
              Anda akan menghapus gaya berikut dari katalog. Pastikan gaya ini tidak lagi diperlukan.
            </p>

            {/* Preview Box Gaya yang akan dihapus dengan fokus wajah & jas */}
            <div className="p-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-surface-hover/70 border border-border-subtle flex items-center gap-3.5 mb-4">
              <div className="w-16 h-20 rounded-xl bg-black/20 overflow-hidden relative shrink-0 border border-border-subtle shadow-xs">
                <img
                  src={suitToDelete.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-50 scale-125"
                />
                <img
                  src={suitToDelete.image}
                  alt={suitToDelete.name}
                  className="relative z-10 w-full h-full object-cover object-[center_28%]"
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-sm text-content-primary truncate">
                  {suitToDelete.name}
                </span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-xs text-content-muted">{suitToDelete.category}</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                      suitToDelete.status
                    )}`}
                  >
                    {suitToDelete.status}
                  </span>
                </div>
                <span className="text-[11px] text-content-muted mt-0.5">
                  Rasio: {suitToDelete.aspectRatio ?? '9:16'} · {suitToDelete.stats}
                </span>
              </div>
            </div>

            {/* Perlindungan Hapus Terpadu (Fase 1: Rule 8) */}
            {suitToDelete.count && suitToDelete.count > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-xs text-content-primary">
                      Penghapusan diblokir (Gaya telah digunakan)
                    </span>
                    <span className="text-[11px] text-content-muted leading-relaxed">
                      Gaya ini telah digunakan untuk menghasilkan {suitToDelete.count} foto pesanan pelanggan. Demi integritas data transaksi, gaya yang sudah dipakai tidak boleh dihapus permanen.
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-content-muted leading-relaxed">
                  Silakan nonaktifkan gaya ini (ubah status ke Draf) agar tidak lagi muncul sebagai opsi bagi pesanan baru pelanggan di aplikasi Flutter.
                </p>

                {/* Bottom Modal Actions (Nonaktifkan / Tutup) */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setSuitToDelete(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary select-none transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleStatus(suitToDelete.id);
                      setSuitToDelete(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] text-black hover:bg-[#c9a15f] select-none transition-colors shadow-sm"
                  >
                    Nonaktifkan gaya sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Red Warning Alert Box */}
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 mb-4">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs text-content-primary">
                      Penghapusan tidak dapat dibatalkan
                    </span>
                    <span className="text-[11px] text-content-muted leading-relaxed">
                      Gaya dan gambar pratinjaunya akan dihapus permanen dari katalog. Gaya ini belum pernah dipakai, sehingga aman dihapus.
                    </span>
                  </div>
                </div>

                {/* Bottom Modal Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setSuitToDelete(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary select-none transition-colors"
                  >
                    Batalkan
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white select-none transition-colors shadow-sm"
                  >
                    Hapus gaya
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

export default SuitCatalogPage;
