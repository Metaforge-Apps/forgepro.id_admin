import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCentralStore } from '../../mocks/selectors';
import {
  Search,
  X,
  FileText,
  ShoppingBag,
  Sparkles,
  Ticket,
  Truck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const { state } = useCentralStore();
  const [query, setQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search Results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { orders: [], styles: [], vouchers: [], prints: [] };

    const orders = state.orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.packageName.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const styles = state.styles
      .filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      .slice(0, 4);

    const vouchers = state.vouchers
      .filter((v) => v.code.toLowerCase().includes(q) || v.title.toLowerCase().includes(q))
      .slice(0, 3);

    const prints = state.orders
      .filter((o) => o.shippingTrackingNumber && o.shippingTrackingNumber.toLowerCase().includes(q))
      .slice(0, 3);

    return { orders, styles, vouchers, prints };
  }, [query, state.orders, state.styles, state.vouchers]);

  const hasAnyResults =
    results.orders.length > 0 ||
    results.styles.length > 0 ||
    results.vouchers.length > 0 ||
    results.prints.length > 0;

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-surface-card border border-border-card shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-border-subtle bg-surface-card">
          <Search className="w-5 h-5 text-[#D9B06F] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Ketik nomor pesanan (PRO-...), email, kode voucher, gaya jas, atau resi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-content-primary placeholder-content-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-content-muted hover:text-content-primary p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-hover text-content-muted border border-border-subtle">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[420px] overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-content-muted flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-content-muted/40" />
              <span>Cari cepat ke seluruh modul ForgePro.id</span>
              <span className="text-[11px] text-content-muted/70">
                Pencarian mencakup pesanan, email pelanggan, nomor resi kurir, voucher promo, dan katalog jas.
              </span>
            </div>
          )}

          {query && !hasAnyResults && (
            <div className="py-8 text-center text-xs text-content-muted">
              Tidak ada hasil ditemukan untuk <span className="text-content-primary font-semibold">"{query}"</span>
            </div>
          )}

          {/* Group 1: Pesanan & Transaksi */}
          {results.orders.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-content-muted tracking-wider uppercase px-2">
                Pesanan &amp; Transaksi ({results.orders.length})
              </span>
              {results.orders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/pesanan', { state: { selectedOrderId: ord.orderNumber } });
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-surface-hover text-left flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-content-primary group-hover:text-[#D9B06F]">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-content-muted">· {ord.customerEmail}</span>
                      </div>
                      <span className="text-[11px] text-content-muted">{ord.packageName} ({ord.suitType})</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover:text-content-primary" />
                </button>
              ))}
            </div>
          )}

          {/* Group 2: Resi & Pengiriman Cetak */}
          {results.prints.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-content-muted tracking-wider uppercase px-2">
                Nomor Resi Kurir ({results.prints.length})
              </span>
              {results.prints.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/cetak-pengiriman', { state: { searchTracking: p.shippingTrackingNumber } });
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-surface-hover text-left flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-content-primary group-hover:text-[#D9B06F]">
                        {p.shippingTrackingNumber}
                      </span>
                      <span className="text-[11px] text-content-muted block">
                        Pesanan {p.orderNumber} · {p.shippingCourier} ({p.customerName})
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover:text-content-primary" />
                </button>
              ))}
            </div>
          )}

          {/* Group 3: Gaya Jas */}
          {results.styles.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-content-muted tracking-wider uppercase px-2">
                Katalog Gaya Jas ({results.styles.length})
              </span>
              {results.styles.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/katalog-jas');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-surface-hover text-left flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-content-primary group-hover:text-[#D9B06F]">
                        {st.name}
                      </span>
                      <span className="text-[11px] text-content-muted block">
                        Kategori {st.category} · {st.count} foto dibuat
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover:text-content-primary" />
                </button>
              ))}
            </div>
          )}

          {/* Group 4: Voucher & Promo */}
          {results.vouchers.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-content-muted tracking-wider uppercase px-2">
                Voucher Promo ({results.vouchers.length})
              </span>
              {results.vouchers.map((vc) => (
                <button
                  key={vc.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/voucher-promo');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-surface-hover text-left flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-content-primary group-hover:text-[#D9B06F]">
                        {vc.code}
                      </span>
                      <span className="text-[11px] text-content-muted block">{vc.title}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover:text-content-primary" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-surface-hover/50 border-t border-border-subtle flex items-center justify-between text-[11px] text-content-muted">
          <span>Gunakan panah untuk navigasi atau klik item langsung</span>
          <span>Tekan ESC untuk menutup</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;
