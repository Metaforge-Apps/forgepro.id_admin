import React, { useState } from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { useCentralStore } from '../../mocks/selectors';
import type { LegalDocumentItem } from '../../types';
import { formatTanggalWIB } from '../../config/business';
import {
  FileText,
  Shield,
  HelpCircle,
  Camera,
  History,
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';

interface LegalContentTabProps {
  onShowToast: (message: string, tone?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export function LegalContentTab({ onShowToast }: LegalContentTabProps) {
  const { state, updateState } = useCentralStore();
  const docs = state.legalDocuments;

  const [selectedDocId, setSelectedDocId] = useState<string>(docs[0]?.id || '');
  const currentDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  const [title, setTitle] = useState<string>(currentDoc?.title || '');
  const [version, setVersion] = useState<string>(currentDoc?.version || '');
  const [summary, setSummary] = useState<string>(currentDoc?.summary || '');
  const [contentMarkdown, setContentMarkdown] = useState<string>(currentDoc?.contentMarkdown || '');
  const [status, setStatus] = useState<'Tayang' | 'Draf'>(currentDoc?.status || 'Tayang');

  const handleSelectDoc = (doc: LegalDocumentItem) => {
    setSelectedDocId(doc.id);
    setTitle(doc.title);
    setVersion(doc.version);
    setSummary(doc.summary);
    setContentMarkdown(doc.contentMarkdown);
    setStatus(doc.status);
  };

  const handleSaveDoc = () => {
    if (!currentDoc) return;
    const nowWib = formatTanggalWIB(new Date().toISOString());

    updateState((prev) => ({
      ...prev,
      legalDocuments: prev.legalDocuments.map((d) =>
        d.id === currentDoc.id
          ? {
              ...d,
              title,
              version,
              summary,
              contentMarkdown,
              status,
              effectiveDateWib: nowWib,
              updatedBy: 'Admin Utama (Andi Prasetyo)',
            }
          : d
      ),
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          time: nowWib,
          source: 'Admin Utama (Andi Prasetyo)',
          activity: `Pembaruan dokumen legal: ${title} versi ${version} (${status})`,
          category: 'Pengaturan',
          result: 'Berhasil',
          targetId: currentDoc.slug,
        },
        ...prev.activityLogs,
      ],
    }));

    onShowToast(`Dokumen "${title}" berhasil diperbarui ke versi ${version}.`, 'success');
  };

  const getDocIcon = (slug: string) => {
    switch (slug) {
      case 'terms':
        return <FileText className="w-4 h-4 text-[#D9B06F]" />;
      case 'privacy':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'refund_policy':
        return <Camera className="w-4 h-4 text-blue-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar Info */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-hover/70 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-content-primary">
            Pusat Dokumen Legal & Ketentuan Layanan Aplikasi
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            Setiap pembaruan versi Syarat & Ketentuan atau Kebijakan Privasi akan otomatis tercatat dan disinkronkan ke audit trail consent pelanggan di aplikasi Flutter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDoc}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:opacity-95 transition-opacity"
          >
            Terbitkan / Simpan Versi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Daftar Dokumen (4 Kolom) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {docs.map((doc) => {
            const isSelected = doc.id === currentDoc?.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelectDoc(doc)}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-surface-card border-[#D9B06F] shadow-sm'
                    : 'bg-surface-card/60 border-border-subtle hover:bg-surface-hover hover:border-border-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getDocIcon(doc.slug)}
                    <span className="font-semibold text-xs text-content-primary">{doc.title}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-hover text-content-muted">
                    {doc.version}
                  </span>
                </div>
                <p className="text-[11px] text-content-muted line-clamp-2 leading-relaxed">{doc.summary}</p>
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50 text-[10px] text-content-muted">
                  <span>Berlaku: {doc.effectiveDateWib}</span>
                  <StatusBadge status={doc.status} variant={doc.status === 'Tayang' ? 'emerald' : 'slate'} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Kolom Kanan: Editor Dokumen Legal (8 Kolom) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-content-primary">Judul Dokumen</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-content-primary">Nomor Versi</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-card text-xs font-mono text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-content-primary">Status Publikasi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Tayang' | 'Draf')}
                  className="px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
                >
                  <option value="Tayang">Tayang (Aktif di Aplikasi)</option>
                  <option value="Draf">Draf (Sedang Ditinjau)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-content-primary">Terakhir Diperbarui Oleh</label>
                <div className="px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-hover/50 text-xs text-content-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {currentDoc?.updatedBy || 'Admin Utama'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-content-primary">Ringkasan Perubahan Klausul</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-content-primary">Isi Teks Legal (Markdown)</label>
              <textarea
                rows={12}
                value={contentMarkdown}
                onChange={(e) => setContentMarkdown(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-border-subtle bg-surface-card text-xs font-mono text-content-primary focus:outline-none focus:border-[#D9B06F] leading-relaxed"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LegalContentTab;
