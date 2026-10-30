import React, { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import {
  LifeBuoy,
  Search,
  ChevronDown,
  X,
  Send,
  Sparkles,
  DollarSign,
  Ban,
  CheckCircle2,
  Clock,
  Printer,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  User,
} from 'lucide-react';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import { mockDb } from '../mocks/db';
import { orderController } from '../controllers/order-controller';
import type { ComplaintTicket, ComplaintStatus } from '../types';

const TABS: { label: string; filter: string }[] = [
  { label: 'Semua Tiket', filter: 'Semua' },
  { label: 'Baru Masuk', filter: 'Baru' },
  { label: 'Sedang Ditinjau', filter: 'Ditinjau' },
  { label: 'Selesai', filter: 'Selesai' },
  { label: 'Ditolak', filter: 'Ditolak' },
];

export function RefundComplaintsPage() {
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() =>
    mockDb.getState().complaints
  );

  React.useEffect(() => {
    const unsub = mockDb.subscribe(() => {
      setComplaints(mockDb.getState().complaints);
    });
    return unsub;
  }, []);

  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua kategori');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Detail Drawer state
  const selectedTicket = useMemo(
    () => complaints.find((c) => c.id === selectedTicketId || c.ticketNumber === selectedTicketId) ?? null,
    [complaints, selectedTicketId]
  );

  const relatedOrder = useMemo(
    () => (selectedTicket ? orderController.getOrderById(selectedTicket.orderNumber) : null),
    [selectedTicket]
  );

  // Reply form state
  const [replyMessage, setReplyMessage] = useState<string>('');

  // Resolution modals state
  const [showRerenderModal, setShowRerenderModal] = useState<boolean>(false);
  const [rerenderNote, setRerenderNote] = useState<string>('');

  const [showPlayRefundModal, setShowPlayRefundModal] = useState<boolean>(false);
  const [playRefundReason, setPlayRefundReason] = useState<string>('');

  const [showPrintRefundModal, setShowPrintRefundModal] = useState<boolean>(false);
  const [printRefundReason, setPrintRefundReason] = useState<string>('');

  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Dynamic stat cards
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Baru' || c.status === 'Ditinjau').length;
    const aiComplaints = complaints.filter((c) => c.category === 'wajah_kurang_mirip').length;
    const paymentOrPrintComplaints = complaints.filter(
      (c) => c.category === 'pembayaran_ganda' || c.category === 'cetak_rusak_terlambat'
    ).length;

    return { total, pending, aiComplaints, paymentOrPrintComplaints };
  }, [complaints]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return complaints.filter((item) => {
      if (activeTab === 'Baru Masuk' && item.status !== 'Baru') return false;
      if (activeTab === 'Sedang Ditinjau' && item.status !== 'Ditinjau') return false;
      if (activeTab === 'Selesai' && item.status !== 'Selesai') return false;
      if (activeTab === 'Ditolak' && item.status !== 'Ditolak') return false;

      if (selectedCategory !== 'Semua kategori' && item.category !== selectedCategory) {
        return false;
      }

      if (q !== '') {
        const matchTicket = item.ticketNumber.toLowerCase().includes(q);
        const matchOrder = item.orderNumber.toLowerCase().includes(q);
        const matchEmail = item.customerEmail.toLowerCase().includes(q);
        const matchSubject = item.subject.toLowerCase().includes(q);
        if (!matchTicket && !matchOrder && !matchEmail && !matchSubject) return false;
      }

      return true;
    });
  }, [complaints, activeTab, selectedCategory, searchQuery]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    mockDb.addComplaintReply(selectedTicket.id, {
      sender: 'admin',
      senderName: 'Maya Lestari (Admin)',
      message: replyMessage.trim(),
    });

    if (selectedTicket.status === 'Baru') {
      mockDb.updateComplaintTicket(selectedTicket.id, { status: 'Ditinjau' });
    }

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Membalas tiket komplain · ${selectedTicket.ticketNumber} (${selectedTicket.orderNumber})`,
      result: 'Berhasil',
      targetId: selectedTicket.ticketNumber,
    });

    setReplyMessage('');
    showToast('Balasan berhasil dikirimkan ke pelanggan via Email & Push Flutter', 'success');
  };

  const handleResolveWithRerender = () => {
    if (!selectedTicket) return;
    const note = rerenderNote.trim() || 'Kompensasi render ulang gratis disetujui admin';
    orderController.requestAiRegeneration(selectedTicket.orderNumber, note);
    mockDb.updateComplaintTicket(selectedTicket.id, {
      status: 'Selesai',
      resolutionType: 'regenerasi_gratis',
      resolutionNote: note,
    });
    mockDb.addComplaintReply(selectedTicket.id, {
      sender: 'system',
      senderName: 'Sistem ForgePro.id',
      message: `Tiket diselesaikan dengan resolusi: Kompensasi Render Ulang AI Gratis (${note}).`,
    });
    setShowRerenderModal(false);
    showToast('Kompensasi render ulang AI berhasil diproses & tiket diselesaikan', 'success');
  };

  const handleResolveWithPlayRefund = () => {
    if (!selectedTicket || !relatedOrder) return;
    const reason = playRefundReason.trim() || 'Refund disetujui via tiket komplain';
    orderController.syncGooglePlayRefund(selectedTicket.orderNumber, reason);
    mockDb.updateComplaintTicket(selectedTicket.id, {
      status: 'Selesai',
      resolutionType: 'refund_play',
      resolutionNote: reason,
      refundAmountRp: relatedOrder.amount,
    });
    mockDb.addComplaintReply(selectedTicket.id, {
      sender: 'system',
      senderName: 'Sistem ForgePro.id',
      message: `Tiket diselesaikan dengan resolusi: Pengembalian dana Google Play Rp${relatedOrder.amount.toLocaleString('id-ID')}.`,
    });
    setShowPlayRefundModal(false);
    showToast('Sinkronisasi refund Google Play berhasil & tiket diselesaikan', 'success');
  };

  const handleResolveWithPrintRefund = () => {
    if (!selectedTicket) return;
    const reason = printRefundReason.trim() || 'Refund biaya cetak fisik disetujui via komplain';
    orderController.refundPrintPayment(selectedTicket.orderNumber, reason);
    mockDb.updateComplaintTicket(selectedTicket.id, {
      status: 'Selesai',
      resolutionType: 'refund_cetak',
      resolutionNote: reason,
    });
    mockDb.addComplaintReply(selectedTicket.id, {
      sender: 'system',
      senderName: 'Sistem ForgePro.id',
      message: `Tiket diselesaikan dengan resolusi: Refund biaya cetak & ongkir via payment gateway.`,
    });
    setShowPrintRefundModal(false);
    showToast('Refund biaya cetak fisik berhasil diproses & tiket diselesaikan', 'success');
  };

  const handleRejectComplaint = () => {
    if (!selectedTicket) return;
    const reason = rejectReason.trim() || 'Komplain tidak memenuhi syarat pengembalian';
    mockDb.updateComplaintTicket(selectedTicket.id, {
      status: 'Ditolak',
      resolutionType: 'ditolak',
      resolutionNote: reason,
    });
    mockDb.addComplaintReply(selectedTicket.id, {
      sender: 'system',
      senderName: 'Sistem ForgePro.id',
      message: `Tiket ditolak oleh tim admin. Alasan: ${reason}`,
    });
    setShowRejectModal(false);
    showToast('Tiket komplain ditolak', 'info');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Total Tiket Komplain
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.total}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Semua komplain pelanggan terdaftar
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Menunggu Tindakan
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-[#D9B06F]">
              {stats.pending}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Status Baru &amp; Sedang Ditinjau
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Komplain Hasil AI
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.aiComplaints}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Ketidakmiripan wajah / prompt
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Komplain Bayar &amp; Cetak
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.paymentOrPrintComplaints}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4">
            Token Play / kendala kurir lab
          </span>
        </Card>
      </div>

      {/* Main Complaints Table Card */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-content-primary">
              Tiket Komplain &amp; Permintaan Refund
            </h2>
            <span className="text-xs text-content-muted mt-1 block">
              Kelola komplain pelanggan, mitigasi regenerasi AI gratis, dan sinkronisasi refund
            </span>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto border-b border-border-subtle pb-px [scrollbar-width:none]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.filter || (activeTab === 'Semua' && tab.filter === 'Semua');
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(tab.filter)}
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

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari nomor tiket, no pesanan, email, atau keluhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

          <div className="relative shrink-0">
            <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
            >
              <option value="Semua kategori">Semua kategori</option>
              <option value="wajah_kurang_mirip">Hasil AI kurang mirip</option>
              <option value="pembayaran_ganda">Pembayaran / Token Play</option>
              <option value="cetak_rusak_terlambat">Cetak fisik &amp; pengiriman</option>
              <option value="gagal_unduh">Tautan unduh kedaluwarsa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">NO. TIKET / PESANAN</th>
                <th className="pb-3 px-4">PELANGGAN</th>
                <th className="pb-3 px-4">KATEGORI &amp; SUBJEK</th>
                <th className="pb-3 px-4">PRIORITAS</th>
                <th className="pb-3 px-4">STATUS</th>
                <th className="pb-3 px-4">WAKTU LAPOR</th>
                <th className="pb-3 pl-4 pr-6 text-left sticky right-0 bg-surface-card z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredComplaints.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedTicketId(item.id)}
                  className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                >
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-[#D9B06F]">
                        {item.ticketNumber}
                      </span>
                      <span className="font-mono text-[11px] text-content-muted">
                        Ref: {item.orderNumber}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-content-primary">
                        {item.customerEmail}
                      </span>
                      <span className="text-[11px] text-content-muted">
                        {item.customerWhatsapp || '-'}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 max-w-sm">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/30 w-fit">
                        {item.categoryLabel}
                      </span>
                      <span className="font-medium text-content-primary line-clamp-1">
                        {item.subject}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.priority === 'Tinggi'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : item.priority === 'Normal'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'Selesai'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : item.status === 'Baru'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : item.status === 'Ditolak'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-content-muted text-[11px]">
                    {item.createdAtWib}
                  </td>

                  <td className="py-4 pl-4 pr-6 whitespace-nowrap sticky right-0 bg-surface-card group-hover:bg-surface-hover/80 z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.12)]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicketId(item.id);
                      }}
                      className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
                    >
                      <span>Buka tiket</span>
                      <span>&rarr;</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-content-muted">
                    Tidak ada tiket komplain yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border-subtle">
          <span className="text-xs text-content-muted">
            Menampilkan {filteredComplaints.length} dari total {complaints.length} tiket komplain
          </span>
        </div>
      </Card>

      {/* Drawer Detail Tiket Komplain */}
      {selectedTicket && (
        <Drawer
          open={Boolean(selectedTicket)}
          onClose={() => setSelectedTicketId(null)}
          widthClass="max-w-2xl"
          title={
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-xl sm:text-2xl font-medium text-content-primary">
                #{selectedTicket.ticketNumber}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  selectedTicket.status === 'Selesai'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : selectedTicket.status === 'Baru'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : selectedTicket.status === 'Ditolak'
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}
              >
                {selectedTicket.status}
              </span>
            </div>
          }
          subtitle={
            <div className="flex items-center gap-2 text-xs text-content-muted mt-1">
              <span>Pesanan: {selectedTicket.orderNumber}</span>
              <span>•</span>
              <span>Kategori: {selectedTicket.categoryLabel}</span>
            </div>
          }
        >
          <div className="flex flex-col h-full space-y-5 text-xs animate-fade-in">
            {/* Header Informasi Tiket */}
            <div className="p-4 rounded-2xl bg-surface-hover/50 border border-border-subtle space-y-2.5">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="font-semibold text-content-primary text-sm">{selectedTicket.subject}</span>
                  <p className="text-content-muted">
                    Pelapor: {selectedTicket.customerEmail} ({selectedTicket.customerWhatsapp || 'Tanpa WhatsApp'})
                  </p>
                </div>
                <span className="text-[11px] text-content-muted">{selectedTicket.createdAtWib}</span>
              </div>
              <p className="p-3 rounded-xl bg-surface-card border border-border-subtle text-content-primary leading-relaxed">
                {selectedTicket.description}
              </p>
            </div>

            {/* Status Resolusi Jika Sudah Selesai */}
            {selectedTicket.resolutionType && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-1">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolusi: {selectedTicket.resolutionType.toUpperCase()}</span>
                </span>
                <p className="text-xs">{selectedTicket.resolutionNote}</p>
                {selectedTicket.refundAmountRp && (
                  <p className="text-xs font-semibold">
                    Dana Dikembalikan: Rp{selectedTicket.refundAmountRp.toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            )}

            {/* Thread Diskusi & Balasan */}
            <div className="flex-1 flex flex-col space-y-3 min-h-[180px]">
              <span className="font-semibold text-content-primary text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#D9B06F]" />
                <span>Diskusi Tiket ({selectedTicket.replies?.length || 0})</span>
              </span>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[260px] pr-1">
                {!selectedTicket.replies || selectedTicket.replies.length === 0 ? (
                  <p className="text-content-muted italic">Belum ada percakapan dalam tiket ini.</p>
                ) : (
                  selectedTicket.replies.map((rep) => {
                    const isAdmin = rep.sender === 'admin';
                    const isSystem = rep.sender === 'system';

                    return (
                      <div
                        key={rep.id}
                        className={`p-3 rounded-xl border leading-relaxed ${
                          isSystem
                            ? 'bg-[#D9B06F]/10 border-[#D9B06F]/30 text-content-primary text-center italic'
                            : isAdmin
                            ? 'bg-surface-card border-border-card text-content-primary ml-4'
                            : 'bg-surface-hover border-border-subtle text-content-primary mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-content-muted mb-1">
                          <span className="font-semibold text-content-primary">{rep.senderName}</span>
                          <span>{rep.timestampWib}</span>
                        </div>
                        <p className="text-xs">{rep.message}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Form Balasan */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-2 border-t border-border-subtle">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Kirim pesan balasan ke pelanggan (notifikasi email & in-app flutter)..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F] resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844] disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Balasan</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Action Bar Resolusi Tiket */}
            {selectedTicket.status !== 'Selesai' && selectedTicket.status !== 'Ditolak' && (
              <div className="pt-3 border-t border-border-subtle space-y-2">
                <span className="font-semibold text-content-primary block">
                  Pilihan Resolusi Masalah:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRerenderNote('');
                      setShowRerenderModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold bg-[#111A2C] text-[#D9B06F] border border-[#D9B06F]/40 hover:bg-[#1A2844]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kompensasi: Render Ulang Gratis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPlayRefundReason('');
                      setShowPlayRefundModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Sinkronisasi Refund Google Play</span>
                  </button>

                  {relatedOrder?.hasPhysicalPrint && (
                    <button
                      type="button"
                      onClick={() => {
                        setPrintRefundReason('');
                        setShowPrintRefundModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Refund Biaya Cetak Fisik</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setRejectReason('');
                      setShowRejectModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold border border-border-subtle hover:bg-surface-hover text-content-muted"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Tolak Komplain</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* Modal Konfirmasi Kompensasi Render Ulang */}
      <ConfirmDialog
        open={showRerenderModal}
        onClose={() => setShowRerenderModal(false)}
        title="Kompensasi: Render Ulang AI Gratis"
        description={`Tindakan ini akan mengantrekan render ulang gratis untuk pesanan ${selectedTicket?.orderNumber} dan mengubah status tiket menjadi Selesai.`}
        confirmLabel="Jadwalkan Render Ulang & Selesaikan"
        variant="primary"
        onConfirm={handleResolveWithRerender}
      >
        <div className="space-y-3 text-xs my-3">
          <label className="text-content-muted block mb-1">Catatan Resolusi Tiket:</label>
          <textarea
            value={rerenderNote}
            onChange={(e) => setRerenderNote(e.target.value)}
            placeholder="Contoh: Menambahkan prompt kacamata dan pencahayaan Rembrandt sesuai permintaan..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F] resize-none"
          />
        </div>
      </ConfirmDialog>

      {/* Modal Sinkronisasi Refund Google Play */}
      <ConfirmDialog
        open={showPlayRefundModal}
        onClose={() => setShowPlayRefundModal(false)}
        title="Sinkronisasi Refund Google Play"
        description={`Tindakan ini akan mengembalikan pesanan ${selectedTicket?.orderNumber} menjadi status Gagal/Refund dan mencatat pengembalian dana.`}
        confirmLabel="Konfirmasi Refund Play"
        variant="danger"
        onConfirm={handleResolveWithPlayRefund}
      >
        <div className="space-y-3 text-xs my-3">
          <label className="text-content-muted block mb-1">Alasan Pengembalian Dana Google Play:</label>
          <textarea
            value={playRefundReason}
            onChange={(e) => setPlayRefundReason(e.target.value)}
            placeholder="Contoh: Kesalahan token Google Play, pelanggan melampirkan GPA valid..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
          />
        </div>
      </ConfirmDialog>

      {/* Modal Refund Cetak Fisik */}
      <ConfirmDialog
        open={showPrintRefundModal}
        onClose={() => setShowPrintRefundModal(false)}
        title="Refund Biaya Cetak Fisik (Gateway)"
        description={`Mengajukan pengembalian dana biaya cetak & ongkir untuk pesanan ${selectedTicket?.orderNumber}.`}
        confirmLabel="Refund Biaya Cetak"
        variant="danger"
        onConfirm={handleResolveWithPrintRefund}
      >
        <div className="space-y-3 text-xs my-3">
          <label className="text-content-muted block mb-1">Alasan Refund Biaya Cetak:</label>
          <textarea
            value={printRefundReason}
            onChange={(e) => setPrintRefundReason(e.target.value)}
            placeholder="Contoh: Kertas cetak terlipat saat transit atau pembatalan pengiriman..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
          />
        </div>
      </ConfirmDialog>

      {/* Modal Tolak Komplain */}
      <ConfirmDialog
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Tolak Tiket Komplain"
        description={`Tindakan ini akan menolak komplain ${selectedTicket?.ticketNumber}.`}
        confirmLabel="Tolak Komplain"
        variant="danger"
        onConfirm={handleRejectComplaint}
      >
        <div className="space-y-3 text-xs my-3">
          <label className="text-content-muted block mb-1">Alasan Penolakan (Wajib):</label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Contoh: Hasil render telah sesuai dengan foto selfie awal yang diunggah..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-rose-500 resize-none"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}

export default RefundComplaintsPage;
