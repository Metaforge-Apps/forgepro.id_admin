import React, { useState, useMemo } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  RefreshCw,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  Star,
  ExternalLink,
  DollarSign,
  FileText,
  Sparkles,
  CreditCard,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import type { OrderItem } from '../../controllers/order-controller/order.types';
import type { PrintPayment } from '../../types';
import { Drawer } from '../common/Drawer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { mockDb } from '../../mocks/db';
import { getCourierTrackingUrl } from '../../config/business';

export interface OrderDetailDrawerProps {
  order: OrderItem | null;
  open: boolean;
  onClose: () => void;
  printPayment?: PrintPayment;
  onVerifyManualPayment: (orderId: string, gpaId: string, reason: string) => void;
  onRequestAiRegeneration: (orderId: string, reason: string) => void;
  onExtendDownload: (orderId: string, daysToAdd: number) => void;
  onAddInternalNote: (orderId: string, note: string) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  onSyncRefund: (orderId: string, reason: string) => void;
  onExtendPrintPayment: (orderNumber: string, hours: number) => void;
  onRefundPrintPayment: (orderNumber: string, reason: string) => void;
}

type TabType =
  | 'ringkasan'
  | 'pembayaran'
  | 'hasil-ai'
  | 'cetak-pengiriman'
  | 'riwayat'
  | 'catatan';

const formatRupiah = (val: number): string =>
  `Rp${Math.round(val).toLocaleString('id-ID')}`;

export function OrderDetailDrawer({
  order,
  open,
  onClose,
  printPayment,
  onVerifyManualPayment,
  onRequestAiRegeneration,
  onExtendDownload,
  onAddInternalNote,
  onCancelOrder,
  onSyncRefund,
  onExtendPrintPayment,
  onRefundPrintPayment,
}: OrderDetailDrawerProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');

  // Privacy unmasking state
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

  const [showPrintRefundModal, setShowPrintRefundModal] = useState<boolean>(false);
  const [printRefundReason, setPrintRefundReason] = useState<string>('');

  // Internal Note form state
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!order) return null;

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`${label} disalin ke clipboard`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleUnmask = () => {
    const next = !isCustomerUnmasked;
    setIsCustomerUnmasked(next);
    if (next) {
      mockDb.appendActivityLog({
        source: 'Admin Utama',
        category: 'Privasi',
        activity: `Melihat data kontak pelanggan (UU PDP) · ${order.orderNumber} (${order.customerEmail})`,
        result: 'Berhasil',
        targetId: order.orderNumber,
      });
      showToast('Data kontak pelanggan ditampilkan dan dicatat di log audit privasi', 'info');
    }
  };

  const maskedEmail = useMemo(() => {
    if (isCustomerUnmasked) return order.customerEmail;
    const parts = order.customerEmail.split('@');
    if (parts.length < 2) return '***@mail.com';
    const user = parts[0];
    const visibleLen = Math.min(2, user.length);
    return `${user.substring(0, visibleLen)}***@${parts[1]}`;
  }, [order.customerEmail, isCustomerUnmasked]);

  const maskedPhone = useMemo(() => {
    if (!order.customerPhone) return '-';
    if (isCustomerUnmasked) return order.customerPhone;
    if (order.customerPhone.length < 6) return '0812-****';
    return `${order.customerPhone.slice(0, 4)}-****-${order.customerPhone.slice(-3)}`;
  }, [order.customerPhone, isCustomerUnmasked]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddInternalNote(order.id, newNoteText.trim());
    setNewNoteText('');
    showToast('Catatan internal berhasil ditambahkan', 'success');
  };

  const handleDownloadZip = () => {
    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Mengunduh berkas arsip foto ZIP · ${order.orderNumber}`,
      result: 'Berhasil',
      targetId: order.orderNumber,
    });
    showToast(`Mengunduh paket ZIP arsip resolusi tinggi untuk ${order.orderNumber}...`, 'success');
  };

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ringkasan', label: 'Ringkasan', icon: FileText },
    { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
    { id: 'hasil-ai', label: 'Hasil AI', icon: Sparkles },
    { id: 'cetak-pengiriman', label: 'Cetak & Kirim', icon: Truck },
    { id: 'riwayat', label: 'Riwayat', icon: Clock },
    { id: 'catatan', label: 'Catatan', icon: FileText },
  ];

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        widthClass="max-w-3xl"
        title={
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl sm:text-2xl font-medium text-content-primary">
              #{order.orderNumber}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                order.paymentStatus === 'Dibayar'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : order.paymentStatus === 'Menunggu'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}
            >
              {order.paymentStatus}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                order.photoStatus === 'Selesai'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : order.photoStatus === 'Diproses'
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  : order.photoStatus === 'Dibatalkan'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : 'bg-zinc-500/10 text-content-muted border-zinc-500/20'
              }`}
            >
              {order.photoStatus}
            </span>
          </div>
        }
        subtitle={
          <div className="flex items-center gap-2 text-xs text-content-muted mt-1">
            <span>Dibuat: {order.timeDisplay} WIB</span>
            <span>•</span>
            <span>Paket {order.packageName} ({order.photoCount} Foto)</span>
          </div>
        }
      >
        <div className="flex flex-col h-full">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-border-subtle overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0 pb-px mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold transition-all whitespace-nowrap border-b-2 select-none ${
                    isActive
                      ? 'border-[#D9B06F] text-[#9A7432] dark:text-[#D9B06F]'
                      : 'border-transparent text-content-muted hover:text-content-primary hover:border-border-subtle'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D9B06F]' : 'text-content-muted'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6 text-xs animate-fade-in">
              {/* Kontak Pelanggan dengan Masking UU PDP */}
              <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold text-content-primary text-sm">
                    <ShieldCheck className="w-4 h-4 text-[#D9B06F]" />
                    <span>Identitas Pelanggan (Guest First)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleUnmask}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border-subtle hover:bg-surface-card transition-colors text-content-primary"
                  >
                    {isCustomerUnmasked ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-content-muted" />
                        <span>Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#D9B06F]" />
                        <span>Tampilkan Asli</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-content-muted block mb-0.5">Nama Pelanggan:</span>
                    <span className="font-semibold text-content-primary">{order.customerName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block mb-0.5">Email Pesanan:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-content-primary font-medium">{maskedEmail}</span>
                      {isCustomerUnmasked && (
                        <button
                          type="button"
                          onClick={() => handleCopy(order.customerEmail, 'email', 'Email pelanggan')}
                          className="text-content-muted hover:text-content-primary"
                        >
                          {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-content-muted block mb-0.5">No. WhatsApp / HP:</span>
                    <span className="font-mono text-content-primary font-medium">{maskedPhone}</span>
                  </div>
                  <div>
                    <span className="text-content-muted block mb-0.5">ID Internal Database:</span>
                    <span className="font-mono text-content-muted text-[11px]">{order.id}</span>
                  </div>
                </div>
              </div>

              {/* Paket & Gaya Jas */}
              <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-3">
                <span className="font-semibold text-content-primary text-sm block">
                  Detail Paket &amp; Pilihan Jas
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-content-muted block mb-0.5">Paket AI:</span>
                    <span className="font-medium text-content-primary">{order.packageName} ({order.photoCount} Foto)</span>
                  </div>
                  <div>
                    <span className="text-content-muted block mb-0.5">Kredit AI Digunakan:</span>
                    <span className="font-medium text-content-primary">
                      {order.totalCredits - order.creditsRemaining} dari {order.totalCredits} kredit
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-content-muted block mb-1">Pilihan Template Gaya Jas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.templateIds.map((tpl) => (
                        <span
                          key={tpl}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/30"
                        >
                          {tpl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Pelanggan & Moderasi */}
              {order.customPrompt && (
                <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-content-primary text-sm">
                      Prompt Khusus Pelanggan
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        order.promptModerationStatus === 'Lolos'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : order.promptModerationStatus === 'Ditandai'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}
                    >
                      {order.promptModerationStatus === 'Lolos'
                        ? '✓ Lolos Moderasi FLUX'
                        : order.promptModerationStatus === 'Ditandai'
                        ? '⚠ Ditandai (Perlu Ditinjau)'
                        : '⛔ Diblokir Filter'}
                    </span>
                  </div>
                  <p className="p-3 rounded-xl bg-surface-card border border-border-subtle font-mono text-xs text-content-primary italic leading-relaxed">
                    &ldquo;{order.customPrompt}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PEMBAYARAN */}
          {activeTab === 'pembayaran' && (
            <div className="space-y-6 text-xs animate-fade-in">
              {/* Notif Kebijakan Read-Only Google Play */}
              <div className="p-4 rounded-2xl bg-[#D9B06F]/10 border border-[#D9B06F]/30 text-content-primary flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#9A7432] dark:text-[#D9B06F] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-[#9A7432] dark:text-[#D9B06F]">
                    Sistem Pembayaran Google Play Billing (IAP)
                  </p>
                  <p className="text-content-muted leading-relaxed">
                    Produk digital foto AI ditagihkan melalui Google Play Store dan diverifikasi otomatis oleh
                    webhook server RTDN. Tombol perubahan status bebas dinonaktifkan untuk mencegah inkonsistensi
                    dengan Play Console.
                  </p>
                </div>
              </div>

              {/* Detail Transaksi Google Play */}
              <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-3">
                <span className="font-semibold text-content-primary text-sm block">
                  Data Google Play Developer API
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <span className="text-content-muted block mb-0.5">Google Play Order ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-content-primary">
                        {order.googlePlayOrderId || 'Belum tersedia (Menunggu Callback)'}
                      </span>
                      {order.googlePlayOrderId && (
                        <button
                          type="button"
                          onClick={() => handleCopy(order.googlePlayOrderId!, 'gpa', 'Google Play Order ID')}
                          className="text-content-muted hover:text-content-primary"
                        >
                          {copiedKey === 'gpa' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-content-muted block mb-0.5">Purchase Token:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-content-muted truncate max-w-[200px]">
                        {order.purchaseToken || '-'}
                      </span>
                      {order.purchaseToken && (
                        <button
                          type="button"
                          onClick={() => handleCopy(order.purchaseToken!, 'token', 'Purchase Token')}
                          className="text-content-muted hover:text-content-primary"
                        >
                          {copiedKey === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-border-subtle flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-content-muted">
                      <span>Harga Normal Paket ({order.packageName})</span>
                      <span>{formatRupiah(order.amount + order.discount)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between items-center text-emerald-500">
                        <span>Diskon Kupon Promo ({order.voucherCode})</span>
                        <span>-{formatRupiah(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold text-sm text-[#9A7432] dark:text-[#D9B06F] pt-1 border-t border-border-subtle">
                      <span>Total Tagihan Google Play</span>
                      <span>{formatRupiah(order.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Refund Jika Ada */}
              {order.refundAmount && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Ban className="w-4 h-4" />
                    <span>Pesanan Telah Di-Refund</span>
                  </div>
                  <p className="text-xs">
                    Nominal refund: {formatRupiah(order.refundAmount)} • Alasan: {order.refundReason || 'Persetujuan komplain'}
                  </p>
                  <p className="text-[11px] text-rose-500/80">Waktu: {order.refundedAtIso}</p>
                </div>
              )}

              {/* Aksi Khusus Rekonsiliasi & Refund */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                {order.paymentStatus !== 'Dibayar' && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyGpaId(order.googlePlayOrderId || 'GPA.');
                      setVerifyReason('');
                      setShowVerifyModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844] transition-colors"
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
                    className="px-4 py-2.5 rounded-xl font-semibold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    Sinkronisasi Refund Google Play
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HASIL AI & RETENSI UU PDP */}
          {activeTab === 'hasil-ai' && (
            <div className="space-y-6 text-xs animate-fade-in">
              {/* Selfie Retention Banner UU PDP No. 27/2022 */}
              {order.originalSelfieDeleted ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      Foto Selfie Asli Dihapus Otomatis (UU PDP No. 27/2022)
                    </p>
                    <p className="text-xs leading-relaxed text-content-muted">
                      Sesuai undang-undang pelindungan data pribadi, foto biometrik selfie mentah pelanggan
                      telah dihapus permanen dari bucket penyimpanan server dalam kurun waktu 24 jam setelah pesanan dibuat.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-3">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      Foto Selfie Mentah Tersedia Sementara (&lt; 24 Jam)
                    </p>
                    <p className="text-xs leading-relaxed text-content-muted">
                      File selfie mentah masih tersimpan di bucket sementara untuk keperluan antrean pemrosesan AI,
                      dan akan dihapus permanen secara terjadwal.
                    </p>
                  </div>
                </div>
              )}

              {/* Masa Simpan Unduhan */}
              <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle flex items-center justify-between">
                <div>
                  <span className="text-content-muted block mb-0.5">Batas Akses Unduhan Hasil:</span>
                  <span className="font-semibold text-content-primary">
                    {order.downloadExpiresAtIso
                      ? new Date(order.downloadExpiresAtIso).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '14 Hari sejak pemesanan'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onExtendDownload(order.id, 7);
                    showToast('Masa unduhan berhasil diperpanjang +7 hari', 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-card font-medium text-content-primary transition-colors"
                >
                  + Perpanjang 7 Hari
                </button>
              </div>

              {/* Grid Hasil Foto AI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-content-primary text-sm">
                    Galeri Hasil Foto FLUX ({order.results.length} dari {order.photoCount} varian)
                  </span>
                  {order.downloadUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-[#111A2C] text-[#D9B06F] hover:bg-[#1A2844] border border-[#D9B06F]/40 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Semua (.ZIP)</span>
                    </button>
                  )}
                </div>

                {order.results.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-border-subtle text-content-muted">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-content-muted" />
                    <span>Belum ada hasil foto yang selesai dirender.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {order.results.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-surface-hover/60 border border-border-subtle flex flex-col gap-2 group"
                      >
                        <div className="aspect-[3/4] rounded-lg bg-surface-main flex items-center justify-center relative overflow-hidden border border-border-subtle">
                          <div className="text-center p-2">
                            <span className="text-[11px] font-mono text-content-muted block">Varian #{idx + 1}</span>
                            <span className="text-[10px] text-[#D9B06F] font-serif block mt-1">{res.templateId}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-emerald-500 font-medium">✓ Lolos QC</span>
                          <button
                            type="button"
                            onClick={() => showToast(`Mengunduh foto varian #${idx + 1}...`, 'info')}
                            className="text-content-muted hover:text-content-primary p-1"
                            title="Unduh foto ini"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ulasan & Rating Pelanggan */}
              {order.rating && (
                <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-2">
                  <div className="flex items-center gap-1.5">
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
                    <span className="font-semibold text-content-primary ml-1 text-sm">
                      {order.rating}.0 / 5.0
                    </span>
                  </div>
                  {order.ratingReview && (
                    <p className="text-xs text-content-primary italic bg-surface-card p-3 rounded-xl border border-border-subtle">
                      &ldquo;{order.ratingReview}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Aksi AI: Render Ulang & Batalkan */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRerenderReason('');
                    setShowRerenderModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D9B06F]" />
                  <span>Render Ulang AI (FLUX)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCancelReason('');
                    setShowCancelModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Batalkan Pesanan</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CETAK FISIK & PENGIRIMAN */}
          {activeTab === 'cetak-pengiriman' && (
            <div className="space-y-6 text-xs animate-fade-in">
              {!order.hasPhysicalPrint ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border-subtle text-content-muted">
                  <Truck className="w-7 h-7 mx-auto mb-2 text-content-muted" />
                  <p className="font-medium text-sm text-content-primary">Tidak Ada Cetak Fisik</p>
                  <p className="text-xs mt-1">Pesanan ini merupakan paket digital AI dan tidak mencakup pesanan cetak fisik.</p>
                </div>
              ) : (
                <>
                  {/* Status Pembayaran Cetak Fisik (Payment Gateway) */}
                  <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-content-primary text-sm">
                        <CreditCard className="w-4 h-4 text-[#D9B06F]" />
                        <span>Pembayaran Cetak Fisik &amp; Ongkir (Gateway)</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          printPayment?.status === 'dibayar'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : printPayment?.status === 'menunggu'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}
                      >
                        {printPayment?.status?.toUpperCase() || order.printPaymentStatus?.toUpperCase() || 'BELUM DIBAYAR'}
                      </span>
                    </div>

                    {printPayment && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <span className="text-content-muted block mb-0.5">Provider Gateway:</span>
                          <span className="font-medium text-content-primary uppercase">
                            {printPayment.provider} • {printPayment.channelLabel}
                          </span>
                        </div>
                        <div>
                          <span className="text-content-muted block mb-0.5">Ref ID Gateway:</span>
                          <span className="font-mono text-content-primary">{printPayment.externalRefId}</span>
                        </div>
                        <div>
                          <span className="text-content-muted block mb-0.5">Biaya Cetak + Ongkir:</span>
                          <span className="font-semibold text-content-primary">
                            {formatRupiah(printPayment.printCostRp)} (Cetak) + {formatRupiah(printPayment.shippingCostRp)} (Ongkir)
                          </span>
                        </div>
                        <div>
                          <span className="text-content-muted block mb-0.5">Total Ditagihkan:</span>
                          <span className="font-bold text-sm text-[#9A7432] dark:text-[#D9B06F]">
                            {formatRupiah(printPayment.totalAmountRp)}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-content-muted block mb-0.5">Batas Waktu Pembayaran:</span>
                          <span className="font-medium text-content-primary">
                            {new Date(printPayment.expiresAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Data Pengiriman & Alamat */}
                  <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-content-primary text-sm">
                        Alamat Pengiriman &amp; Ekspedisi
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const full = `${order.recipientName || order.customerName}\n${order.customerPhone}\n${order.shippingAddress}`;
                          handleCopy(full, 'addr', 'Alamat lengkap pengiriman');
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border-subtle hover:bg-surface-card transition-colors text-content-primary"
                      >
                        {copiedKey === 'addr' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#D9B06F]" />}
                        <span>Salin Alamat</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-content-muted block mb-0.5">Penerima Paket:</span>
                        <span className="font-semibold text-content-primary">{order.recipientName || order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-content-muted block mb-0.5">Spesifikasi Cetak:</span>
                        <span className="font-medium text-content-primary">{order.printSpec || 'Ukuran Standar'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-content-muted block mb-0.5">Alamat Lengkap:</span>
                        <span className="font-medium text-content-primary leading-relaxed">{order.shippingAddress || '-'}</span>
                      </div>
                      <div>
                        <span className="text-content-muted block mb-0.5">Kurir:</span>
                        <span className="font-semibold text-content-primary">{order.shippingCourier || 'JNE'}</span>
                      </div>
                      <div>
                        <span className="text-content-muted block mb-0.5">Nomor Resi:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-content-primary">
                            {order.shippingTrackingNumber || 'Belum tersedia'}
                          </span>
                          {order.shippingTrackingNumber && order.shippingTrackingNumber !== 'Belum tersedia' && (
                            <a
                              href={getCourierTrackingUrl(order.shippingCourier || 'JNE', order.shippingTrackingNumber)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#9A7432] dark:text-[#D9B06F] hover:underline inline-flex items-center gap-1"
                              title="Lacak kurir di tab baru"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aksi Pembayaran Cetak */}
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    {printPayment && printPayment.status !== 'dibayar' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Tautan bayar cetak dikirim ulang ke ${order.customerEmail} dan WhatsApp!`, 'success');
                            mockDb.appendActivityLog({
                              source: 'Admin Utama',
                              category: 'Pesanan',
                              activity: `Kirim ulang tautan invoice cetak fisik · ${order.orderNumber}`,
                              result: 'Berhasil',
                              targetId: order.orderNumber,
                            });
                          }}
                          className="px-4 py-2.5 rounded-xl font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844] transition-colors"
                        >
                          Kirim Ulang Tautan Bayar (WA / Email)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onExtendPrintPayment(order.orderNumber, 24);
                            showToast('Tenggat bayar cetak fisik diperpanjang +24 jam', 'success');
                          }}
                          className="px-4 py-2.5 rounded-xl font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors"
                        >
                          + Perpanjang Batas Bayar (24 Jam)
                        </button>
                      </>
                    )}

                    {printPayment && printPayment.status === 'dibayar' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPrintRefundReason('');
                          setShowPrintRefundModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl font-semibold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        Refund Biaya Cetak Fisik
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 5: RIWAYAT / TIMELINE */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4 text-xs animate-fade-in">
              <span className="font-semibold text-content-primary text-sm block mb-2">
                Kronologi Siklus Hidup Pesanan
              </span>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
                {/* Event 1: Pesanan Dibuat */}
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-surface-card" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-content-primary">Pesanan Dibuat oleh Pelanggan (Guest)</span>
                    <p className="text-content-muted">{order.timeDisplay} WIB • Aplikasi Mobile Flutter</p>
                    <p className="text-content-muted text-[11px]">Nomor pesanan resmi diterbitkan: {order.orderNumber}</p>
                  </div>
                </div>

                {/* Event 2: Pembayaran Google Play */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-surface-card ${
                      order.paymentStatus === 'Dibayar'
                        ? 'bg-emerald-500'
                        : order.paymentStatus === 'Menunggu'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-content-primary">
                      {order.paymentStatus === 'Dibayar'
                        ? 'Pembayaran Google Play Terverifikasi'
                        : order.paymentStatus === 'Menunggu'
                        ? 'Menunggu Konfirmasi Token Google Play'
                        : 'Pembayaran Dibatalkan / Gagal'}
                    </span>
                    <p className="text-content-muted">
                      {order.googlePlayOrderId ? `Order ID: ${order.googlePlayOrderId}` : 'Menunggu respon callback'}
                    </p>
                  </div>
                </div>

                {/* Event 3: AI Processing */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-surface-card ${
                      order.photoStatus === 'Selesai'
                        ? 'bg-emerald-500'
                        : order.photoStatus === 'Diproses'
                        ? 'bg-blue-500'
                        : 'bg-zinc-500'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-content-primary">
                      {order.photoStatus === 'Selesai'
                        ? `Render AI FLUX Selesai (${order.results.length} Varian)`
                        : order.photoStatus === 'Diproses'
                        ? 'Antrean Generator FLUX Fal.ai Berjalan'
                        : 'Menunggu Giliran Generate AI'}
                    </span>
                    <p className="text-content-muted">
                      Model: fal-ai/flux-pro/v1.1 • Estimasi {order.photoCount} foto resolusi tinggi
                    </p>
                  </div>
                </div>

                {/* Event 4: Cetak Fisik jika ada */}
                {order.hasPhysicalPrint && (
                  <div className="relative">
                    <div
                      className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-surface-card ${
                        order.shippingStatus === 'Diterima' || order.shippingStatus === 'Dikirim'
                          ? 'bg-emerald-500'
                          : 'bg-[#D9B06F]'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-content-primary">
                        Cetak Fisik &amp; Pengiriman Kurir ({order.shippingStatus})
                      </span>
                      <p className="text-content-muted">
                        Kurir: {order.shippingCourier} • Resi: {order.shippingTrackingNumber || 'Menunggu penyerahan'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CATATAN INTERNAL */}
          {activeTab === 'catatan' && (
            <div className="space-y-5 text-xs animate-fade-in flex flex-col h-full">
              {/* Form Input Catatan Baru */}
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <label className="font-semibold text-content-primary text-sm block">
                  Tambah Catatan Internal Admin
                </label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Tulis catatan penanganan, instruksi khusus kurir, atau rekonsiliasi manual..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F] transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844] disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan Catatan</span>
                  </button>
                </div>
              </form>

              {/* Feed Catatan Internal */}
              <div className="space-y-3 pt-3 border-t border-border-subtle flex-1 overflow-y-auto">
                <span className="text-content-muted font-medium block">
                  Riwayat Catatan Internal ({order.internalNotes?.length || 0}):
                </span>

                {!order.internalNotes || order.internalNotes.length === 0 ? (
                  <p className="text-content-muted italic">Belum ada catatan internal untuk pesanan ini.</p>
                ) : (
                  order.internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl bg-surface-hover/50 border border-border-subtle space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-content-primary">{note.author}</span>
                        <span className="text-content-muted">{note.timestamp}</span>
                      </div>
                      <p className="text-content-primary leading-relaxed">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Modal Verifikasi Manual Google Play */}
      <ConfirmDialog
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verifikasi Manual Google Play Billing"
        description="Pastikan Order ID telah diverifikasi pada konsol Google Play. Tindakan ini akan mengubah status pembayaran menjadi Dibayar dan memicu antrean AI."
        confirmLabel="Verifikasi & Simpan"
        variant="primary"
        onConfirm={() => {
          if (!verifyGpaId.startsWith('GPA.')) {
            showToast('Google Play Order ID harus diawali "GPA."', 'danger');
            return;
          }
          if (!verifyReason.trim()) {
            showToast('Alasan verifikasi manual wajib diisi', 'danger');
            return;
          }
          onVerifyManualPayment(order.id, verifyGpaId, verifyReason.trim());
          setShowVerifyModal(false);
          showToast('Status pembayaran Google Play berhasil diverifikasi manual', 'success');
        }}
      >
        <div className="space-y-3 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1">Google Play Order ID (GPA.xxxx):</label>
            <input
              type="text"
              value={verifyGpaId}
              onChange={(e) => setVerifyGpaId(e.target.value)}
              placeholder="GPA.3312-4982-1192-38192"
              className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary font-mono text-xs focus:outline-none focus:border-[#D9B06F]"
            />
          </div>
          <div>
            <label className="text-content-muted block mb-1">Alasan Verifikasi (Wajib untuk audit log):</label>
            <textarea
              value={verifyReason}
              onChange={(e) => setVerifyReason(e.target.value)}
              placeholder="Contoh: Bukti invoice Google Play terverifikasi via email CS, token terputus saat checkout..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F] resize-none"
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
          showToast('Permintaan render ulang AI berhasil dikirim ke antrean', 'success');
        }}
      >
        <div className="space-y-3 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1">Alasan Render Ulang (Audit):</label>
            <textarea
              value={rerenderReason}
              onChange={(e) => setRerenderReason(e.target.value)}
              placeholder="Contoh: Kompensasi tiket komplain kacamata kurang mirip, penyesuaian pencahayaan..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F] resize-none"
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
        <div className="space-y-3 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1">Alasan Pembatalan:</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Contoh: Permintaan pelanggan sebelum generate, foto selfie tidak memenuhi syarat..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
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
        <div className="space-y-3 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1">Alasan Pengembalian Dana (Refund):</label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Contoh: Pelanggan mengajukan voided purchase di Google Play Store, resolusi tiket komplain..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>
      </ConfirmDialog>

      {/* Modal Refund Biaya Cetak Fisik */}
      <ConfirmDialog
        open={showPrintRefundModal}
        onClose={() => setShowPrintRefundModal(false)}
        title="Refund Biaya Cetak Fisik via Payment Gateway"
        description={`Tindakan ini akan mengajukan pengembalian dana biaya cetak & ongkir (${printPayment ? formatRupiah(printPayment.totalAmountRp) : '-'}) melalui gateway ${printPayment?.provider.toUpperCase()}.`}
        confirmLabel="Refund Biaya Cetak"
        variant="danger"
        onConfirm={() => {
          if (!printRefundReason.trim()) {
            showToast('Alasan refund cetak fisik wajib diisi', 'danger');
            return;
          }
          onRefundPrintPayment(order.orderNumber, printRefundReason.trim());
          setShowPrintRefundModal(false);
          showToast('Refund biaya cetak berhasil diajukan ke gateway', 'success');
        }}
      >
        <div className="space-y-3 text-xs my-3">
          <div>
            <label className="text-content-muted block mb-1">Alasan Refund Cetak Fisik:</label>
            <textarea
              value={printRefundReason}
              onChange={(e) => setPrintRefundReason(e.target.value)}
              placeholder="Contoh: Pelanggan membatalkan permintaan cetak sebelum proses laminasi lab..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>
      </ConfirmDialog>
    </>
  );
}

export default OrderDetailDrawer;
