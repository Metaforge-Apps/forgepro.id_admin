import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Info,
  X,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import {
  useStyleController,
  SuitStatusFilter,
  SuitSortOption,
} from '../controllers/style-controller';

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

  return (
    <div className="flex flex-col gap-6">
      {/* Meta Bar Sesuai Referensi Figma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-content-muted gap-2">
        <span className="font-semibold text-content-primary">
          {summary.total} gaya · {summary.published} tayang · {summary.draft} draf
        </span>
        <span>Terakhir diperbarui {summary.lastUpdated}</span>
      </div>

      {/* Filter Tabs */}
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

      {/* Filter Controls: Search & Dropdown */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            type="text"
            placeholder="Cari nama gaya jas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SuitStatusFilter)}
              className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
            >
              <option value="Semua status">Semua status</option>
              <option value="Tayang">Tayang</option>
              <option value="Draf">Draf</option>
            </select>
          </div>

          <div className="relative">
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SuitSortOption)}
              className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terpopuler">Terpopuler</option>
              <option value="Nama A-Z">Nama A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Suit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuits.map((item) => (
          <div
            key={item.id}
            onClick={() => setSuitToDelete(item)}
            className="group rounded-2xl overflow-hidden bg-surface-card border border-border-card shadow-sm hover:border-[#D9B06F]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            {/* Card Image */}
            <div className="w-full h-60 sm:h-64 bg-[#EAE6DF] dark:bg-[#1C273E] overflow-hidden relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
              />
            </div>

            {/* Card Body */}
            <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
              <div>
                {/* Category & Status Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-content-muted">{item.category}</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-content-primary tracking-tight group-hover:text-[#D9B06F] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-content-muted mt-1">{item.stats}</p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3.5 border-t border-border-subtle/70 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/katalog-jas/edit', { state: { suit: item } });
                  }}
                  className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1 select-none"
                >
                  <span>Ubah gaya</span>
                  <span>&rarr;</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(item.id);
                  }}
                  className="text-content-muted hover:text-content-primary transition-colors select-none"
                >
                  {item.status === 'Tayang' ? 'Nonaktifkan' : 'Publikasikan'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info Notice */}
      <div className="flex items-start gap-2.5 px-1 pt-1">
        <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-content-primary">
            Pratinjau menunjukkan karakter gaya, bukan identitas pelanggan
          </span>
          <p className="text-xs text-content-muted leading-relaxed">
            Pastikan potongan jas, pencahayaan, dan latar konsisten. Gaya berstatus
            draf tidak ditampilkan pada pilihan pelanggan.
          </p>
        </div>
      </div>

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

            {/* Preview Box Gaya yang akan dihapus */}
            <div className="p-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-surface-hover/70 border border-border-subtle flex items-center gap-3.5 mb-4">
              <img
                src={suitToDelete.image}
                alt={suitToDelete.name}
                className="w-14 h-14 rounded-xl object-cover object-top border border-border-subtle shrink-0"
              />
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
                  {suitToDelete.stats}
                </span>
              </div>
            </div>

            {/* Red Warning Alert Box */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-xs text-content-primary">
                  Penghapusan tidak dapat dibatalkan
                </span>
                <span className="text-[11px] text-content-muted leading-relaxed">
                  Gaya dan gambar pratinjaunya akan dihapus permanen dari katalog. Gaya ini belum dipakai, sehingga tidak memengaruhi pesanan pelanggan.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-content-muted leading-relaxed mb-6">
              Untuk gaya yang sudah digunakan, sebaiknya nonaktifkan agar histori pesanan tidak berubah.
            </p>

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
        </div>
      )}
    </div>
  );
}

export default SuitCatalogPage;
