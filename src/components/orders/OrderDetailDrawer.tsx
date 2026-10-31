import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  Star,
  FileText,
  Sparkles,
  CreditCard,
  Ban,
  CheckCircle2,
  Maximize2,
  MessageSquare,
  Package,
} from 'lucide-react';
import type { OrderItem, GeneratedPhotoItem } from '../../controllers/order-controller/order.types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';
import { mockDb } from '../../mocks/db';

export interface OrderDetailDrawerProps {
  order: OrderItem | null;
  orderId?: string;
  open: boolean;
  onClose: () => void;
  printPayment?: unknown;
  onVerifyManualPayment: (orderId: string, gpaId: string, reason: string) => void;
  onRequestAiRegeneration: (orderId: string, reason: string) => void;
  onExtendDownload: (orderId: string, daysToAdd: number) => void;
  onAddInternalNote: (orderId: string, note: string) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  onSyncRefund: (orderId: string, reason: string) => void;
  onExtendPrintPayment?: (orderNumber: string, hours: number) => void;
  onRefundPrintPayment?: (orderNumber: string, reason: string) => void;
}

type TabType =
  | 'ringkasan'
  | 'pembayaran'
  | 'hasil-ai'
  | 'riwayat'
  | 'catatan';

const formatRupiah = (val: number): string =>
  `Rp${Math.round(val).toLocaleString('id-ID')}`;

/**
 * Resolver foto hasil AI FLUX ke aset template ForgePro.id
 */
function resolvePhotoThumbnail(templateId?: string, variant: number = 0): string {
  if (!templateId) return '/images/suits/suit-navy-klasik.jpg';
  const clean = templateId.toLowerCase().replace(/^suit-/, '').trim();

  const menMap: Record<string, string> = {
    'navy-eksekutif': '/images/templates/men/navy-eksekutif.jpg',
    'abu-muda-modern': '/images/templates/men/abu-muda-modern.jpg',
    'hitam-formal': '/images/templates/men/hitam-formal.jpg',
    'charcoal-klasik': '/images/templates/men/charcoal-klasik.jpg',
    'biru-royal': '/images/templates/men/biru-royal.jpg',
    'coklat-hangat': '/images/templates/men/coklat-hangat.jpg',
    'double-breasted-navy': '/images/templates/men/double-breasted-navy.jpg',
    'pinstripe-direktur': '/images/templates/men/pinstripe-direktur.jpg',
    'tuxedo-hitam': '/images/templates/men/tuxedo-hitam.jpg',
    'tuxedo-ivory': '/images/templates/men/tuxedo-ivory.jpg',
    'tuxedo-midnight': '/images/templates/men/tuxedo-midnight.jpg',
    'beige-resepsi': '/images/templates/men/beige-resepsi.jpg',
    'pengantin-champagne': '/images/templates/men/pengantin-champagne.jpg',
    'pengantin-putih': '/images/templates/men/pengantin-putih.jpg',
    'espresso-brown': '/images/templates/men/coklat-hangat.jpg',
  };

  if (menMap[clean]) return menMap[clean];

  const suitMap: Record<string, string> = {
    'navy-klasik': '/images/suits/suit-navy-klasik.jpg',
    'hitam-formal': '/images/suits/suit-hitam-formal.jpg',
    'abu-profesional': '/images/suits/suit-abu-profesional.jpg',
    'blazer-krem': '/images/suits/suit-blazer-krem.jpg',
    'krem-linen': '/images/suits/suit-blazer-krem.jpg',
    'blazer-hijab': '/images/suits/suit-blazer-hijab.jpg',
    'tuksedo-malam': '/images/suits/suit-tuksedo-malam.jpg',
  };

  if (suitMap[clean]) return suitMap[clean];

  if (clean.includes('wanita') || clean.includes('blazer') || clean.includes('hijab')) {
    const womenIndex = ((variant % 8) + 1);
    return `/images/templates/women/template-${womenIndex}.png`;
  }

  const pool = [
    '/images/templates/men/navy-eksekutif.jpg',
    '/images/templates/men/charcoal-klasik.jpg',
    '/images/templates/men/abu-muda-modern.jpg',
    '/images/templates/men/biru-royal.jpg',
    '/images/suits/suit-navy-klasik.jpg',
  ];
  return pool[variant % pool.length];
}

/**
 * Komponen Detail Pesanan Komprehensif — ForgePro.id
 * Mengikuti 100% sistem desain ForgePro.id:
 * - Dialog modal terpusat (backdrop blur, rounded-3xl, card navy/light surface)
 * - Heading Playfair Display serif, monospace untuk kode & token, aksen emas #D9B06F
 * - Kepatuhan penuh warna umpan balik Aturan 0.5 (Hijau = sukses, Merah = bahaya/batal/refund, Amber = antre/tinjau)
 * - Galeri foto AI dengan lightbox zoom, download instan, retensi UU PDP, & catatan internal
 */
export function OrderDetailDrawer({
  order,
  orderId,
  open,
  onClose,
  onVerifyManualPayment,
  onRequestAiRegeneration,
  onExtendDownload,
  onAddInternalNote,
  onCancelOrder,
  onSyncRefund,
}: OrderDetailDrawerProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');

  // Privacy unmasking state (UU PDP No. 27/2022)
  const [isCustomerUnmasked, setIsCustomerUnmasked] = useState<boolean>(false);

  // Sub-dialogs state
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifyGpaId, setVerifyGpaId] = useState<string>('');
  const [verifyReason, setVerifyReason] = useState<string>('');

  const [showRerenderModal, setShowRerenderModal] = useState<boolean>(false);
  const [rerenderReason, setRerenderReason] = useState<string>('');

  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');

  const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
  const [refundReason, setRefundReason] = useState<string>('');

  // Lightbox Zoom Photo state
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    templateId: string;
    variant: number;
  } | null>(null);

  // Internal Note form state
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Unconditional memoization hooks complying with React Rules of Hooks
  const emailVal = order?.customerEmail;
  const phoneVal = order?.customerPhone;

  const maskedEmail = useMemo(() => {
    if (!emailVal) return '';
    if (isCustomerUnmasked) return emailVal;
    const parts = emailVal.split('@');
    if (parts.length < 2) return '***@mail.com';
    const user = parts[0];
    const visibleLen = Math.min(2, user.length);
    return `${user.substring(0, visibleLen)}***@${parts[1]}`;
  }, [emailVal, isCustomerUnmasked]);

  const maskedPhone = useMemo(() => {
    if (!phoneVal) return '-';
    if (isCustomerUnmasked) return phoneVal;
    if (phoneVal.length < 6) return '0812-****';
    return `${phoneVal.slice(0, 4)}-****-${phoneVal.slice(-3)}`;
  }, [phoneVal, isCustomerUnmasked]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewPhoto) {
          setPreviewPhoto(null);
        } else if (!showVerifyModal && !showRerenderModal && !showCancelModal && !showRefundModal) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, previewPhoto, showVerifyModal, showRerenderModal, showCancelModal, showRefundModal]);

  if (!open) return null;

  // Empty / Not Found state handling without blank page crash
  if (!order) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      >
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-surface-card border border-border-card shadow-2xl p-6 relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-content-primary">
                  Pesanan Tidak Ditemukan
                </h3>
                <p className="text-[11px] text-content-muted">
                  Periksa kembali nomor atau ID pesanan
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-5 text-xs text-content-muted space-y-3">
            <p className="leading-relaxed">
              Data pesanan dengan identitas{' '}
              <strong className="font-mono text-content-primary bg-surface-main px-1.5 py-0.5 rounded border border-border-subtle">
                {orderId || 'Tidak Ditentukan'}
              </strong>{' '}
              tidak ditemukan dalam basis data atau telah dibatalkan.
            </p>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Silakan pastikan format nomor pesanan benar (contoh: <code className="text-[#9A7432] dark:text-[#D9B06F] font-mono">FP-20241026-0819</code>).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm"
            >
              Kembali ke Daftar Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe defaults for array fields to guarantee zero runtime exceptions
  const results = order.results || [];
  const templateIds = order.templateIds || [];
  const internalNotes = order.internalNotes || [];

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} berhasil disalin ke clipboard`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleUnmask = () => {
    const next = !isCustomerUnmasked;
    setIsCustomerUnmasked(next);
    if (next) {
      mockDb.appendActivityLog({
        source: 'Admin Utama',
        category: 'Privasi',
        activity: `Melihat data kontak pelanggan (UU PDP No. 27/2022) · ${order.orderNumber} (${order.customerEmail})`,
        result: 'Berhasil',
        targetId: order.orderNumber,
      });
      showToast('Data kontak pelanggan ditampilkan dan dicatat di log audit privasi', 'info');
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddInternalNote(order.id, newNoteText.trim());
    setNewNoteText('');
    showToast('Catatan internal pesanan berhasil disimpan', 'success');
  };

  const handleDownloadZip = () => {
    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Mengunduh berkas arsip foto resolusi tinggi (.ZIP) · ${order.orderNumber}`,
      result: 'Berhasil',
      targetId: order.orderNumber,
    });
    showToast(`Menyiapkan paket ZIP foto resolusi tinggi untuk ${order.orderNumber}...`, 'success');
  };

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeCount?: number;
  }[] = [
    { id: 'ringkasan', label: 'Ringkasan', icon: FileText },
    { id: 'pembayaran', label: 'Pembayaran IAP', icon: CreditCard },
    { id: 'hasil-ai', label: 'Hasil Foto FLUX', icon: Sparkles, badgeCount: results.length },
    { id: 'riwayat', label: 'Riwayat & Siklus', icon: Clock },
    {
      id: 'catatan',
      label: 'Catatan Internal',
      icon: MessageSquare,
      badgeCount: internalNotes.length,
    },
  ];

  return (
    <>
      {/* Centered Modal Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      >
        {/* Modal Window Container */}
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-surface-card border border-border-card shadow-2xl relative overflow-hidden"
        >
          {/* Header Modal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 pt-6 pb-5 border-b border-border-subtle bg-surface-card shrink-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-content-primary">
                  #{order.orderNumber}
                </h2>
                <button
                  type="button"
                  onClick={() => handleCopy(order.orderNumber, 'ord_code', 'Nomor pesanan')}
                  className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
                  title="Salin nomor pesanan"
                >
                  {copiedKey === 'ord_code' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Status Badges */}
                <StatusBadge status={order.paymentStatus} size="sm" />
                <StatusBadge status={order.photoStatus} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
                <span>Dibuat: <strong className="text-content-primary font-medium">{order.timeDisplay} WIB</strong></span>
                <span>•</span>
                <span>Paket <strong className="text-content-primary font-medium">{order.packageName}</strong> ({order.photoCount} Foto)</span>
                <span>•</span>
                <span className="font-mono text-content-muted">{maskedEmail}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail pesanan"
              className="self-start sm:self-center p-2 rounded-xl text-content-muted hover:text-content-primary bg-surface-hover/80 hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 px-6 sm:px-8 border-b border-border-subtle bg-surface-card overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0 pt-2 pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold transition-all whitespace-nowrap border-b-2 -mb-px select-none ${
                    isActive
                      ? 'border-[#D9B06F] text-[#9A7432] dark:text-[#D9B06F]'
                      : 'border-transparent text-content-muted hover:text-content-primary hover:border-border-subtle'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9B06F]' : 'text-content-muted'}`} />
                  <span>{tab.label}</span>
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#D9B06F]/20 text-[#8A6528] dark:text-[#D9B06F]'
                          : 'bg-surface-hover text-content-muted'
                      }`}
                    >
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modal Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 [scrollbar-width:thin]">
            {/* TAB 1: RINGKASAN */}
            {activeTab === 'ringkasan' && (
              <div className="space-y-6 animate-fade-in text-xs">
                {/* Kontak Pelanggan dengan Masking UU PDP */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#D9B06F]/10 border border-[#D9B06F]/20 flex items-center justify-center text-[#D9B06F] shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-semibold text-content-primary">
                          Identitas Pelanggan (Guest First)
                        </h4>
                        <p className="text-[11px] text-content-muted">
                          Pesanan terikat email tanpa login. Perlindungan data biometrik sesuai UU PDP No. 27/2022.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleUnmask}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors shadow-xs"
                    >
                      {isCustomerUnmasked ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-content-muted" />
                          <span>Sembunyikan</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-[#D9B06F]" />
                          <span>Buka Masking</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-surface-card border border-border-card shadow-xs">
                      <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
                        Nama Pelanggan
                      </span>
                      <span className="text-sm font-semibold text-content-primary block truncate">
                        {order.customerName || 'Tamu ForgePro'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-card border border-border-card shadow-xs">
                      <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
                        Email Pesanan
                      </span>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-sm font-mono font-medium text-content-primary truncate">
                          {maskedEmail}
                        </span>
                        {isCustomerUnmasked && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order.customerEmail, 'email', 'Email')}
                            className="text-content-muted hover:text-content-primary p-0.5"
                          >
                            {copiedKey === 'email' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-card border border-border-card shadow-xs">
                      <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
                        No. WhatsApp / HP
                      </span>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-sm font-mono font-medium text-content-primary truncate">
                          {maskedPhone}
                        </span>
                        {isCustomerUnmasked && order.customerPhone && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order.customerPhone!, 'phone', 'No. HP')}
                            className="text-content-muted hover:text-content-primary p-0.5"
                          >
                            {copiedKey === 'phone' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-card border border-border-card shadow-xs">
                      <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
                        ID Database Internal
                      </span>
                      <span className="text-xs font-mono text-content-muted block truncate">
                        {order.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Paket & Pilihan Jas */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D9B06F]/10 border border-[#D9B06F]/20 flex items-center justify-center text-[#D9B06F] shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-semibold text-content-primary">
                        Paket Foto AI &amp; Gaya Jas
                      </h4>
                      <p className="text-[11px] text-content-muted">
                        Spesifikasi resolusi, kuota kredit AI, dan template yang dipilih pelanggan.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="p-4 rounded-xl bg-surface-card border border-border-card space-y-1 shadow-xs">
                      <span className="text-content-muted text-[11px] block">Paket Terpilih</span>
                      <span className="text-base font-semibold text-content-primary block">
                        {order.packageName}
                      </span>
                      <span className="text-[11px] text-content-muted block">
                        Total {order.photoCount} varian foto resolusi studio
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-card border border-border-card space-y-1 shadow-xs">
                      <span className="text-content-muted text-[11px] block">Kredit AI FLUX</span>
                      <span className="text-base font-semibold text-content-primary block">
                        {order.totalCredits - order.creditsRemaining} / {order.totalCredits} Kredit
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                        Tersisa {order.creditsRemaining} kredit kuota render
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-card border border-border-card space-y-1 shadow-xs">
                      <span className="text-content-muted text-[11px] block">Kategori Gaya Jas</span>
                      <span className="text-base font-semibold text-content-primary block truncate">
                        {order.suitType}
                      </span>
                      <span className="text-[11px] text-content-muted block">
                        {templateIds.length} gaya template terhubung
                      </span>
                    </div>
                  </div>

                  {/* Template Badges */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-2">
                      Template Jas yang Digenerate:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {templateIds.map((tpl) => (
                        <span
                          key={tpl}
                          className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#D9B06F]/10 text-[#8A6528] dark:text-[#D9B06F] border border-[#D9B06F]/30"
                        >
                          {tpl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prompt Pelanggan & Moderasi */}
                {order.customPrompt && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D9B06F]" />
                        <h4 className="font-serif text-base font-semibold text-content-primary">
                          Prompt Tambahan Pelanggan
                        </h4>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          order.promptModerationStatus === 'Lolos'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : order.promptModerationStatus === 'Ditandai'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {order.promptModerationStatus === 'Lolos'
                          ? '✓ Lolos Moderasi FLUX'
                          : order.promptModerationStatus === 'Ditandai'
                          ? '⚠ Ditandai (Perlu Ditinjau)'
                          : '⛔ Diblokir Filter'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-card border border-border-card font-mono text-xs text-content-primary italic leading-relaxed flex items-start justify-between gap-3 shadow-xs">
                      <span>&ldquo;{order.customPrompt}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.customPrompt!, 'prompt', 'Prompt pelanggan')}
                        className="p-1 rounded-lg hover:bg-surface-hover text-content-muted hover:text-content-primary shrink-0 transition-colors"
                        title="Salin prompt"
                      >
                        {copiedKey === 'prompt' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PEMBAYARAN IAP (GOOGLE PLAY) */}
            {activeTab === 'pembayaran' && (
              <div className="space-y-6 animate-fade-in text-xs">
                {/* Banner Google Play Billing Policy */}
                <div className="p-5 rounded-2xl bg-[#D9B06F]/10 border border-[#D9B06F]/30 text-content-primary flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D9B06F]/20 flex items-center justify-center text-[#8A6528] dark:text-[#D9B06F] shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-base font-semibold text-[#8A6528] dark:text-[#D9B06F]">
                      Google Play Billing Policy &amp; RTDN Webhook
                    </h4>
                    <p className="text-content-muted leading-relaxed">
                      Sesuai regulasi Google Play Developer, produk digital foto AI ditagihkan sekali beli (one-time purchase) melalui Google Play Store. Perubahan status pembayaran terikat otomatis pada event RTDN (Real-time Developer Notifications) server-to-server.
                    </p>
                  </div>
                </div>

                {/* Detail Transaksi Google Play */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D9B06F]/10 border border-[#D9B06F]/20 flex items-center justify-center text-[#D9B06F] shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-semibold text-content-primary">
                        Data Transaksi Google Play Developer API
                      </h4>
                      <p className="text-[11px] text-content-muted">
                        Identifier unik transaksi untuk keperluan pelaporan pajak dan rekonsiliasi Google Play Console.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-xl bg-surface-card border border-border-card space-y-1.5 shadow-xs">
                      <span className="text-content-muted text-[10px] font-semibold uppercase tracking-wider block">
                        Google Play Order ID
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-content-primary truncate">
                          {order.googlePlayOrderId || 'Belum tersedia (Menunggu Callback RTDN)'}
                        </span>
                        {order.googlePlayOrderId && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order.googlePlayOrderId!, 'gpa', 'Google Play Order ID')}
                            className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
                          >
                            {copiedKey === 'gpa' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-card border border-border-card space-y-1.5 shadow-xs">
                      <span className="text-content-muted text-[10px] font-semibold uppercase tracking-wider block">
                        Purchase Token API
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-content-muted truncate max-w-[220px]">
                          {order.purchaseToken || '-'}
                        </span>
                        {order.purchaseToken && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order.purchaseToken!, 'token', 'Purchase Token')}
                            className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
                          >
                            {copiedKey === 'token' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="p-4 rounded-xl bg-surface-card border border-border-card space-y-2.5 shadow-xs">
                    <div className="flex justify-between items-center text-content-muted">
                      <span>Harga Asli Paket ({order.packageName})</span>
                      <span className="font-medium text-content-primary">
                        {formatRupiah(order.amount + order.discount)}
                      </span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                        <span>Diskon Kupon Promo ({order.voucherCode})</span>
                        <span className="font-semibold">-{formatRupiah(order.discount)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border-subtle flex justify-between items-center">
                      <span className="font-serif text-sm font-semibold text-content-primary">
                        Total Tagihan Google Play (Play Store)
                      </span>
                      <span className="font-serif text-lg font-bold text-[#9A7432] dark:text-[#D9B06F]">
                        {formatRupiah(order.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Refund Notification if Exists */}
                {order.refundAmount && (
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <Ban className="w-4 h-4" />
                      <span>Pesanan Telah Direfund di Google Play</span>
                    </div>
                    <p className="text-xs text-content-muted leading-relaxed">
                      Pengembalian dana sebesar <strong className="text-rose-500">{formatRupiah(order.refundAmount)}</strong> telah disetujui. Alasan: {order.refundReason || 'Persetujuan komplain pelanggan'}.
                    </p>
                    <span className="text-[11px] text-content-muted block">
                      Waktu refund: {order.refundedAtIso ? new Date(order.refundedAtIso).toLocaleString('id-ID') : '-'}
                    </span>
                  </div>
                )}

                {/* Payment Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {order.paymentStatus !== 'Dibayar' && (
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyGpaId(order.googlePlayOrderId || 'GPA.');
                        setVerifyReason('');
                        setShowVerifyModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm"
                    >
                      Verifikasi Manual Google Play
                    </button>
                  )}

                  {order.paymentStatus === 'Dibayar' && !order.refundAmount && (
                    <button
                      type="button"
                      onClick={() => {
                        setRefundReason('');
                        setShowRefundModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      Sinkronisasi Refund Google Play
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: HASIL FOTO FLUX & RETENSI UU PDP */}
            {activeTab === 'hasil-ai' && (
              <div className="space-y-6 animate-fade-in text-xs">
                {/* Banner Retensi Biometrik UU PDP */}
                {order.originalSelfieDeleted ? (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start gap-3.5">
                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-semibold">
                        Foto Selfie Asli Dihapus Otomatis (UU PDP No. 27/2022)
                      </h4>
                      <p className="text-xs leading-relaxed text-content-muted">
                        Sesuai standar perlindungan data pribadi nasional, berkas biometrik selfie mentah pelanggan telah dimusnahkan secara permanen dari server penyimpanan dalam kurun waktu 24 jam setelah pesanan diproses.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3.5">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-semibold">
                        Foto Selfie Mentah Tersedia Sementara (&lt; 24 Jam)
                      </h4>
                      <p className="text-xs leading-relaxed text-content-muted">
                        Berkas selfie biometrik masih tersimpan di bucket aman sementara untuk kebutuhan antrean generator AI, dan akan dibersihkan otomatis sesuai jadwal UU PDP.
                      </p>
                    </div>
                  </div>
                )}

                {/* Masa Simpan Unduhan */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-content-muted text-[11px] block">Batas Akses Unduhan Hasil Foto</span>
                    <span className="font-serif text-base font-semibold text-content-primary block">
                      {order.downloadExpiresAtIso
                        ? new Date(order.downloadExpiresAtIso).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '14 Hari sejak pemesanan'}
                    </span>
                    <span className="text-[11px] text-content-muted block">
                      Pelanggan dapat mengunduh arsip foto beresolusi penuh sebelum tenggat waktu berakhir.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onExtendDownload(order.id, 7);
                      showToast('Masa unduhan pesanan berhasil diperpanjang +7 hari', 'success');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors shrink-0 shadow-xs"
                  >
                    <span>+ Perpanjang 7 Hari</span>
                  </button>
                </div>

                {/* Galeri Hasil Foto FLUX */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-content-primary">
                        Galeri Hasil Foto FLUX 1.1 Pro
                      </h4>
                      <p className="text-xs text-content-muted">
                        {results.length} dari {order.photoCount} varian foto studio resolusi tinggi selesai dirender.
                      </p>
                    </div>

                    {order.downloadUrl && results.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDownloadZip}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Semua Foto (.ZIP)</span>
                      </button>
                    )}
                  </div>

                  {results.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-dashed border-border-subtle text-content-muted space-y-2 bg-surface-card">
                      <Sparkles className="w-8 h-8 mx-auto text-content-muted" />
                      <p className="font-medium text-sm text-content-primary">
                        Belum Ada Foto Selesai Dirender
                      </p>
                      <p className="text-xs max-w-md mx-auto">
                        Pesanan ini masih dalam status {order.photoStatus}. Hasil foto akan tampil di galeri ini secara otomatis setelah worker FLUX Fal.ai menyelesaikan pemrosesan.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {results.map((res: GeneratedPhotoItem, idx: number) => {
                        const imgUrl = res.imageUrl || resolvePhotoThumbnail(res.templateId, idx);
                        return (
                          <div
                            key={idx}
                            className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface-card border border-border-card hover:border-[#D9B06F]/60 transition-all shadow-sm"
                          >
                            {/* Portrait Aspect Ratio 3:4 */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-main">
                              <img
                                src={imgUrl}
                                alt={`Varian #${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  // Fallback gracefully
                                  (e.target as HTMLImageElement).src = '/images/suits/suit-navy-klasik.jpg';
                                }}
                              />

                              {/* QC Pill */}
                              <div className="absolute top-2.5 left-2.5 z-10">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-xs">
                                  ✓ QC FLUX
                                </span>
                              </div>

                              {/* Hover Overlay with Lightbox trigger */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhoto({
                                      url: imgUrl,
                                      templateId: res.templateId,
                                      variant: idx + 1,
                                    })
                                  }
                                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                                  title="Perbesar foto"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Mengunduh foto varian #${idx + 1}...`, 'info');
                                  }}
                                  className="p-2.5 rounded-xl bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-colors"
                                  title="Unduh foto ini"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Caption & Actions */}
                            <div className="p-3 bg-surface-card border-t border-border-subtle flex items-center justify-between text-xs">
                              <div className="truncate">
                                <span className="font-semibold text-content-primary block truncate">
                                  Varian #{idx + 1}
                                </span>
                                <span className="text-[10px] text-content-muted block truncate">
                                  {res.templateId}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-[#9A7432] dark:text-[#D9B06F]">
                                3:4
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ulasan & Rating Pelanggan */}
                {order.rating && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (order.rating || 0)
                                ? 'fill-[#D9B06F] text-[#D9B06F]'
                                : 'text-border-subtle'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-serif text-sm font-semibold text-content-primary ml-1">
                        {order.rating}.0 / 5.0 Rating Pelanggan
                      </span>
                    </div>

                    {order.ratingReview && (
                      <p className="text-xs text-content-primary italic bg-surface-card p-4 rounded-xl border border-border-card leading-relaxed shadow-xs">
                        &ldquo;{order.ratingReview}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* AI Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRerenderReason('');
                      setShowRerenderModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D9B06F]" />
                    <span>Render Ulang AI (Fal.ai FLUX)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCancelReason('');
                      setShowCancelModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Batalkan Pesanan</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: RIWAYAT & SIKLUS HIDUP PESANAN */}
            {activeTab === 'riwayat' && (
              <div className="space-y-6 animate-fade-in text-xs">
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D9B06F]/10 border border-[#D9B06F]/20 flex items-center justify-center text-[#D9B06F] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-semibold text-content-primary">
                        Kronologi Siklus Hidup Pesanan
                      </h4>
                      <p className="text-[11px] text-content-muted">
                        Jejak audit otomatis dari pembuatan pesanan, pembayaran Play Store, proses AI, hingga pengiriman.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-7 space-y-7 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border-subtle">
                    {/* Event 1: Pesanan Dibuat */}
                    <div className="relative">
                      <div className="absolute -left-7 top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-surface-card shadow-xs" />
                      <div className="p-4 rounded-xl bg-surface-card border border-border-card shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-content-primary text-sm">
                            Pesanan Dibuat oleh Pelanggan (Guest First)
                          </span>
                          <span className="text-[11px] text-content-muted">{order.timeDisplay} WIB</span>
                        </div>
                        <p className="text-content-muted">
                          Pemesanan via aplikasi Flutter ForgePro.id · Paket {order.packageName} ({order.photoCount} foto)
                        </p>
                        <span className="font-mono text-[11px] text-[#9A7432] dark:text-[#D9B06F] block">
                          Nomor Referensi Resmi: #{order.orderNumber}
                        </span>
                      </div>
                    </div>

                    {/* Event 2: Pembayaran Google Play */}
                    <div className="relative">
                      <div
                        className={`absolute -left-7 top-1 w-5 h-5 rounded-full border-4 border-surface-card shadow-xs ${
                          order.paymentStatus === 'Dibayar'
                            ? 'bg-emerald-500'
                            : order.paymentStatus === 'Menunggu'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <div className="p-4 rounded-xl bg-surface-card border border-border-card shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-content-primary text-sm">
                            {order.paymentStatus === 'Dibayar'
                              ? 'Pembayaran Google Play Terverifikasi'
                              : order.paymentStatus === 'Menunggu'
                              ? 'Menunggu Konfirmasi Token Google Play'
                              : 'Pembayaran Gagal / Dibatalkan'}
                          </span>
                          <span className="text-[11px] text-content-muted">
                            Total: {formatRupiah(order.amount)}
                          </span>
                        </div>
                        <p className="text-content-muted">
                          {order.googlePlayOrderId
                            ? `Order ID: ${order.googlePlayOrderId} · Token terkonfirmasi via RTDN webhook`
                            : 'Menunggu respon callback pembayaran dari Play Store'}
                        </p>
                      </div>
                    </div>

                    {/* Event 3: Pemrosesan AI Fal.ai FLUX */}
                    <div className="relative">
                      <div
                        className={`absolute -left-7 top-1 w-5 h-5 rounded-full border-4 border-surface-card shadow-xs ${
                          order.photoStatus === 'Selesai'
                            ? 'bg-emerald-500'
                            : order.photoStatus === 'Diproses'
                            ? 'bg-blue-500'
                            : order.photoStatus === 'Dibatalkan'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <div className="p-4 rounded-xl bg-surface-card border border-border-card shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-content-primary text-sm">
                            {order.photoStatus === 'Selesai'
                              ? `Generator AI Selesai (${results.length} Varian Foto)`
                              : order.photoStatus === 'Diproses'
                              ? 'Worker Generator Fal.ai FLUX Berjalan'
                              : order.photoStatus === 'Dibatalkan'
                              ? 'Proses AI Dibatalkan'
                              : 'Menunggu Giliran Antrean AI'}
                          </span>
                          <span className="text-[11px] text-content-muted">FLUX 1.1 Pro</span>
                        </div>
                        <p className="text-content-muted">
                          Model fal-ai/flux-pro/v1.1 · Pencahayaan studio profesional · {order.photoCount} varian pose
                        </p>
                      </div>
                    </div>

                    {/* Event 4: Cetak Fisik jika ada */}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CATATAN INTERNAL ADMIN */}
            {activeTab === 'catatan' && (
              <div className="space-y-6 animate-fade-in text-xs flex flex-col">
                {/* Form Input Catatan Baru */}
                <form
                  onSubmit={handleAddNote}
                  className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D9B06F]/10 border border-[#D9B06F]/20 flex items-center justify-center text-[#D9B06F] shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-semibold text-content-primary">
                        Tambah Catatan Internal Admin
                      </h4>
                      <p className="text-[11px] text-content-muted">
                        Catatan ini hanya terlihat oleh staf admin dan tidak dapat diakses oleh pelanggan.
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Tuliskan catatan rekonsiliasi manual, penanganan komplain, atau instruksi khusus kurir..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface-card text-content-primary text-xs placeholder:text-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors resize-none shadow-xs"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] disabled:opacity-40 transition-all shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simpan Catatan</span>
                    </button>
                  </div>
                </form>

                {/* Feed Catatan Internal */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A2234] border border-border-card space-y-4">
                  <span className="font-serif text-base font-semibold text-content-primary block">
                    Riwayat Catatan ({internalNotes.length})
                  </span>

                  {internalNotes.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-surface-card border border-border-card text-content-muted shadow-xs">
                      <p className="italic">Belum ada catatan internal untuk pesanan ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-xl bg-surface-card border border-border-card shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#D9B06F]/20 text-[#8A6528] dark:text-[#D9B06F] flex items-center justify-center font-bold text-[10px]">
                                {note.author.charAt(0)}
                              </span>
                              <span className="font-semibold text-content-primary">{note.author}</span>
                            </div>
                            <span className="text-[11px] text-content-muted">{note.timestamp}</span>
                          </div>
                          <p className="text-content-primary text-xs leading-relaxed pl-8">
                            {note.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Sticky Bottom Footer */}
          <div className="px-6 sm:px-8 py-4 border-t border-border-subtle bg-surface-card/95 backdrop-blur-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCancelReason('');
                  setShowCancelModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Batalkan Pesanan
              </button>

              {order.paymentStatus !== 'Dibayar' && (
                <button
                  type="button"
                  onClick={() => {
                    setVerifyGpaId(order.googlePlayOrderId || 'GPA.');
                    setVerifyReason('');
                    setShowVerifyModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Verifikasi GPA
                </button>
              )}

              {order.photoStatus === 'Selesai' && (
                <button
                  type="button"
                  onClick={() => {
                    setRerenderReason('');
                    setShowRerenderModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D9B06F]" />
                  <span>Render Ulang</span>
                </button>
              )}
            </div>

            {/* Right Primary Action */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
              >
                Tutup
              </button>

              {results.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Semua Foto (.ZIP)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal: Perbesar Foto AI FLUX */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-surface-card border border-border-card shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-card">
              <div>
                <h3 className="font-serif text-lg font-semibold text-content-primary">
                  Varian #{previewPhoto.variant} · {previewPhoto.templateId}
                </h3>
                <span className="text-[11px] text-content-muted">
                  Resolusi Studio 3000 × 4000 px · 300 DPI · Lolos QC FLUX 1.1
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 bg-black/40 overflow-hidden min-h-[360px]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.templateId}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-surface-card text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Lolos Quality Control FLUX Pro
              </span>
              <button
                type="button"
                onClick={() => {
                  showToast(`Mengunduh berkas foto varian #${previewPhoto.variant}...`, 'success');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Foto Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verifikasi Manual Google Play */}
      <ConfirmDialog
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verifikasi Manual Google Play Billing"
        description="Pastikan Order ID telah diverifikasi pada konsol Google Play Developer. Tindakan ini akan mengubah status pembayaran menjadi Dibayar dan memicu antrean generate AI."
        confirmLabel="Verifikasi & Simpan"
        variant="primary"
        onConfirm={() => {
          if (!verifyGpaId.startsWith('GPA.')) {
            showToast('Google Play Order ID harus diawali "GPA."', 'danger');
            return;
          }
          if (!verifyReason.trim()) {
            showToast('Alasan verifikasi manual wajib diisi untuk catatan audit', 'danger');
            return;
          }
          onVerifyManualPayment(order.id, verifyGpaId, verifyReason.trim());
          setShowVerifyModal(false);
          showToast('Status pembayaran Google Play berhasil diverifikasi manual', 'success');
        }}
      >
        <div className="space-y-3.5 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1 font-semibold">
              Google Play Order ID (GPA.xxxx):
            </label>
            <input
              type="text"
              value={verifyGpaId}
              onChange={(e) => setVerifyGpaId(e.target.value)}
              placeholder="GPA.3312-4982-1192-38192"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono text-xs focus:outline-none focus:border-[#D9B06F]"
            />
          </div>
          <div>
            <label className="text-content-muted block mb-1 font-semibold">
              Alasan Verifikasi (Wajib untuk audit log):
            </label>
            <textarea
              value={verifyReason}
              onChange={(e) => setVerifyReason(e.target.value)}
              placeholder="Contoh: Bukti invoice Google Play terverifikasi via email CS, token terputus saat checkout..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary text-xs focus:outline-none focus:border-[#D9B06F] resize-none"
            />
          </div>
        </div>
      </ConfirmDialog>

      {/* Modal Render Ulang AI */}
      <ConfirmDialog
        open={showRerenderModal}
        onClose={() => setShowRerenderModal(false)}
        title="Render Ulang AI (Fal.ai FLUX)"
        description={`Estimasi biaya Fal.ai: Rp4.200 (${order.photoCount} foto). Tindakan ini akan mengembalikan status proses foto menjadi Diproses dan merender ulang varian gaya jas.`}
        confirmLabel="Jadwalkan Render Ulang"
        variant="primary"
        onConfirm={() => {
          if (!rerenderReason.trim()) {
            showToast('Alasan render ulang wajib diisi untuk log audit', 'danger');
            return;
          }
          onRequestAiRegeneration(order.id, rerenderReason.trim());
          setShowRerenderModal(false);
          showToast('Permintaan render ulang AI berhasil dikirim ke antrean FLUX', 'success');
        }}
      >
        <div className="space-y-3.5 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1 font-semibold">
              Alasan Render Ulang (Audit):
            </label>
            <textarea
              value={rerenderReason}
              onChange={(e) => setRerenderReason(e.target.value)}
              placeholder="Contoh: Kompensasi perbaikan kemiripan kacamata, penyesuaian pencahayaan studio..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary text-xs focus:outline-none focus:border-[#D9B06F] resize-none"
            />
          </div>
        </div>
      </ConfirmDialog>

      {/* Modal Batalkan Pesanan */}
      <ConfirmDialog
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Batalkan Proses Pesanan"
        description="Apakah Anda yakin ingin membatalkan pesanan ini? Status proses foto akan diubah menjadi Dibatalkan."
        confirmLabel="Batalkan Pesanan"
        variant="danger"
        onConfirm={() => {
          if (!cancelReason.trim()) {
            showToast('Alasan pembatalan wajib diisi', 'danger');
            return;
          }
          onCancelOrder(order.id, cancelReason.trim());
          setShowCancelModal(false);
          showToast('Pesanan berhasil dibatalkan', 'info');
        }}
      >
        <div className="space-y-3.5 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1 font-semibold">
              Alasan Pembatalan:
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Contoh: Permintaan pelanggan sebelum generate, foto selfie tidak memenuhi syarat..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>
      </ConfirmDialog>

      {/* Modal Refund Google Play */}
      <ConfirmDialog
        open={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Sinkronisasi Refund Google Play"
        description={`Tindakan ini akan mencatat pengembalian dana sebesar ${formatRupiah(order.amount)} pada pembukuan, mengubah status pesanan, dan mencatat audit log.`}
        confirmLabel="Proses Sinkronisasi Refund"
        variant="danger"
        onConfirm={() => {
          if (!refundReason.trim()) {
            showToast('Alasan refund Google Play wajib diisi', 'danger');
            return;
          }
          onSyncRefund(order.id, refundReason.trim());
          setShowRefundModal(false);
          showToast('Sinkronisasi refund Google Play berhasil dicatat', 'success');
        }}
      >
        <div className="space-y-3.5 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1 font-semibold">
              Alasan Pengembalian Dana (Refund):
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Contoh: Pelanggan mengajukan voided purchase di Google Play Store, resolusi tiket komplain..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>
      </ConfirmDialog>
    </>
  );
}

// Export both default and named alias
export default OrderDetailDrawer;
export { OrderDetailDrawer as OrderDetailModal };
