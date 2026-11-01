import React, { useState } from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { useCentralStore } from '../../mocks/selectors';
import type { MessageTemplateItem, SentMessageLog, MessageChannel } from '../../types';
import { formatTanggalWIB } from '../../config/business';
import {
  Mail,
  Send,
  Eye,
  RefreshCw,
  Smartphone,
  Inbox,
  X,
} from 'lucide-react';

interface MessageTemplatesTabProps {
  onShowToast: (message: string, tone?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export function MessageTemplatesTab({ onShowToast }: MessageTemplatesTabProps) {
  const { state, updateState } = useCentralStore();
  const templates = state.messageTemplates;
  const sentLogs = state.sentMessages;

  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>('Email');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.find((t) => t.channel === 'Email')?.id || templates[0]?.id || ''
  );

  // Active template being edited
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [subject, setSubject] = useState<string>(currentTemplate?.subject || '');
  const [bodyTemplate, setBodyTemplate] = useState<string>(currentTemplate?.bodyTemplate || '');
  const [activeTabSub, setActiveTabSub] = useState<'editor' | 'logs'>('editor');

  // Modal Kirim Uji Coba
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [testRecipient, setTestRecipient] = useState<string>('andi@forgepro.id');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  // Synchronize inputs when template changes
  const handleSelectTemplate = (tmpl: MessageTemplateItem) => {
    setSelectedTemplateId(tmpl.id);
    setSubject(tmpl.subject);
    setBodyTemplate(tmpl.bodyTemplate);
  };

  // Insert variable tag into editor
  const handleInsertVariable = (variable: string) => {
    setBodyTemplate((prev) => `${prev} {{${variable}}}`);
  };

  // Preview replacement simulation
  const getRenderedPreview = () => {
    let rendered = bodyTemplate || '';
    const sampleData: Record<string, string> = {
      nomor_pesanan: 'PRO-20261030-019',
      nama_paket: 'Profesional (12 Foto HD)',
      link_unduh: 'https://unduh.forgepro.id/dl/xyz-9821-secure',
      link_bayar: 'https://pay.forgepro.id/invoice/INV-2026-0044',
      resi: 'SPXID04829103847',
      sisa_hari: '3',
      kurir: 'SiCepat BEST',
    };

    Object.entries(sampleData).forEach(([k, v]) => {
      const reg = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
      rendered = rendered.replace(reg, v);
    });

    return rendered;
  };

  // Save current template
  const handleSaveTemplate = () => {
    if (!currentTemplate) return;
    updateState((prev) => ({
      ...prev,
      messageTemplates: prev.messageTemplates.map((t) =>
        t.id === currentTemplate.id
          ? {
              ...t,
              subject,
              bodyTemplate,
              lastUpdatedWib: formatTanggalWIB(new Date().toISOString()),
            }
          : t
      ),
    }));
    onShowToast(`Template "${currentTemplate.name}" berhasil disimpan.`, 'success');
  };

  // Send test message
  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);

    setTimeout(() => {
      const newLog: SentMessageLog = {
        id: `msg-${Date.now()}`,
        timeWib: formatTanggalWIB(new Date().toISOString()),
        orderNumber: 'PRO-TEST-UJI',
        recipient: testRecipient,
        channel: currentTemplate?.channel || 'Email',
        templateName: currentTemplate?.name || 'Uji Coba Pesan',
        status: 'Terkirim',
      };

      updateState((prev) => ({
        ...prev,
        sentMessages: [newLog, ...prev.sentMessages],
      }));

      setIsSendingTest(false);
      setShowTestModal(false);
      onShowToast(`Pesan tes berhasil dikirim ke ${testRecipient} via ${currentTemplate?.channel}.`, 'success');
    }, 700);
  };

  // Resend failed message from log
  const handleResendLog = (log: SentMessageLog) => {
    updateState((prev) => ({
      ...prev,
      sentMessages: prev.sentMessages.map((item) =>
        item.id === log.id
          ? {
              ...item,
              status: 'Terkirim',
              timeWib: formatTanggalWIB(new Date().toISOString()),
              errorDetail: undefined,
            }
          : item
      ),
    }));
    onShowToast(`Pesan berhasil dikirim ulang ke ${log.recipient}.`, 'success');
  };

  const channelTemplates = templates.filter((t) => t.channel === selectedChannel);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Tabs: Editor Template vs Log Riwayat Pengiriman */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSub('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTabSub === 'editor'
                ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]'
                : 'text-content-muted hover:text-content-primary hover:bg-surface-hover'
            }`}
          >
            Editor Template Pesan
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSub('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTabSub === 'logs'
                ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]'
                : 'text-content-muted hover:text-content-primary hover:bg-surface-hover'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Log Pengiriman Pesan
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-card border border-border-subtle">
              {sentLogs.length}
            </span>
          </button>
        </div>

        {activeTabSub === 'editor' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTestModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#D9B06F]" />
              Kirim Tes
            </button>
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:opacity-95 transition-opacity"
            >
              Simpan Perubahan
            </button>
          </div>
        )}
      </div>

      {activeTabSub === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kolom Kiri: Pemilihan Channel & Daftar Template (4 Kolom) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex rounded-xl bg-surface-hover/70 p-1 border border-border-subtle">
              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('Email');
                  const first = templates.find((t) => t.channel === 'Email');
                  if (first) handleSelectTemplate(first);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  selectedChannel === 'Email'
                    ? 'bg-surface-card text-content-primary shadow-sm'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-[#D9B06F]" />
                Email Pelanggan
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('WhatsApp');
                  const first = templates.find((t) => t.channel === 'WhatsApp');
                  if (first) handleSelectTemplate(first);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  selectedChannel === 'WhatsApp'
                    ? 'bg-surface-card text-content-primary shadow-sm'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                WhatsApp
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {channelTemplates.map((item) => {
                const isSelected = item.id === currentTemplate?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTemplate(item)}
                    className={`p-3.5 rounded-xl text-left border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-surface-card border-[#D9B06F] shadow-sm'
                        : 'bg-surface-card/60 border-border-subtle hover:bg-surface-hover hover:border-border-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-content-primary">{item.name}</span>
                      <StatusBadge status={item.status} variant={item.status === 'Aktif' ? 'emerald' : 'slate'} />
                    </div>
                    <span className="text-[11px] text-content-muted truncate">{item.triggerEvent}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Editor Form & Pratinjau Dinamis (8 Kolom) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <Card padding="p-6" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-content-primary">{currentTemplate?.name}</h3>
                  <span className="text-xs text-content-muted">Trigger: {currentTemplate?.triggerEvent}</span>
                </div>
                <span className="text-[11px] text-content-muted font-mono">
                  Diperbarui: {currentTemplate?.lastUpdatedWib}
                </span>
              </div>

              {currentTemplate?.channel === 'Email' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-content-primary">Subjek Email</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
              )}

              {/* Variable Chips */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-content-muted">Variabel Tersedia (Klik untuk Menambahkan):</span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentTemplate?.variables || ['nomor_pesanan', 'nama_paket', 'link_unduh', 'resi', 'sisa_hari', 'kurir']).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="px-2 py-1 rounded-md bg-surface-hover text-content-primary hover:bg-[#D9B06F]/20 hover:text-[#D9B06F] text-[11px] font-mono border border-border-subtle transition-colors"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Body */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-content-primary">Isi Pesan Template</label>
                <textarea
                  rows={8}
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-border-subtle bg-surface-card text-xs font-mono text-content-primary focus:outline-none focus:border-[#D9B06F] leading-relaxed"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-surface-hover/60 border border-border-subtle flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-content-primary pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#D9B06F]" />
                    Pratinjau Hasil Tampilan Pelanggan
                  </div>
                  <span className="text-[10px] text-content-muted uppercase tracking-wider">Simulasi Data Nyata</span>
                </div>
                {currentTemplate?.channel === 'Email' && (
                  <div className="text-xs font-semibold text-content-primary">
                    Subjek: {subject.replace(/{{nomor_pesanan}}/g, 'PRO-20261030-019')}
                  </div>
                )}
                <div className="text-xs text-content-primary leading-relaxed whitespace-pre-wrap font-sans">
                  {getRenderedPreview()}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Log Pengiriman Pesan */}
      {activeTabSub === 'logs' && (
        <Card padding="p-6" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-content-primary">Riwayat Log Notifikasi Pelanggan</h3>
              <p className="text-xs text-content-muted mt-0.5">
                Pemantauan status pengiriman email transaksional dan pesan WhatsApp otomatis.
              </p>
            </div>
            <span className="text-xs text-content-muted">{sentLogs.length} Pesan Dikirim</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-content-muted font-medium">
                  <th className="py-2.5 px-3">WAKTU (WIB)</th>
                  <th className="py-2.5 px-3">PESANAN</th>
                  <th className="py-2.5 px-3">PENERIMA</th>
                  <th className="py-2.5 px-3">SALURAN</th>
                  <th className="py-2.5 px-3">TEMPLATE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60">
                {sentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover/40 transition-colors">
                    <td className="py-2.5 px-3 text-content-muted">{log.timeWib}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-content-primary">{log.orderNumber}</td>
                    <td className="py-2.5 px-3 text-content-primary font-medium">{log.recipient}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1">
                        {log.channel === 'Email' ? (
                          <Mail className="w-3.5 h-3.5 text-[#D9B06F]" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        {log.channel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-content-primary">{log.templateName}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge
                        status={log.status}
                        variant={log.status === 'Terkirim' ? 'emerald' : log.status === 'Gagal' ? 'rose' : 'amber'}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {log.status === 'Gagal' ? (
                        <button
                          type="button"
                          onClick={() => handleResendLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Kirim Ulang
                        </button>
                      ) : (
                        <span className="text-[11px] text-content-muted">Tersampaikan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Kirim Pesan Uji Coba */}
      {showTestModal && (
        <div
          onClick={() => setShowTestModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowTestModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-xl font-medium text-content-primary mb-1">
              Kirim Pesan Uji Coba
            </h3>
            <p className="text-xs text-content-muted mb-4">
              Uji template <span className="text-content-primary font-semibold">"{currentTemplate?.name}"</span> dengan data variabel simulasi.
            </p>

            <form onSubmit={handleSendTest} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  {currentTemplate?.channel === 'Email' ? 'Alamat Email Tujuan' : 'Nomor WhatsApp Tujuan (+62)'}
                </label>
                <input
                  type={currentTemplate?.channel === 'Email' ? 'email' : 'text'}
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
                >
                  {isSendingTest ? 'Mengirim...' : 'Kirim Uji Coba'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageTemplatesTab;
