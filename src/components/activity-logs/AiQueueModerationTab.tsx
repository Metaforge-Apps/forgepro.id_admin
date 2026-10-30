import React, { useState } from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { useCentralStore } from '../../mocks/selectors';
import type { AiQueueJob, BlockedPromptLog } from '../../types';
import { formatTanggalWIB, formatRupiah, maskEmail } from '../../config/business';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Ban,
  ArrowUpCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  Search,
  Filter,
  ExternalLink,
  Plus,
  Trash2,
  DollarSign,
  Cpu,
} from 'lucide-react';

interface AiQueueModerationTabProps {
  onShowToast: (message: string, tone?: 'success' | 'danger' | 'warning' | 'info') => void;
  onNavigateOrder?: (orderNumber: string) => void;
}

export function AiQueueModerationTab({ onShowToast, onNavigateOrder }: AiQueueModerationTabProps) {
  const { state, updateState } = useCentralStore();
  const aiJobs = state.aiJobs;
  const blockedPrompts = state.blockedPrompts;
  const bannedKeywords = state.bannedKeywords;

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'review' | 'blacklist'>('queue');
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('Semua status');
  const [searchJobQuery, setSearchJobQuery] = useState<string>('');

  // Unblurred photo IDs in moderation tab
  const [revealedPhotoIds, setRevealedPhotoIds] = useState<Record<string, boolean>>({});

  // Prompt tester state
  const [testPromptInput, setTestPromptInput] = useState<string>('A 28-year-old Indonesian professional businessman in bespoke navy blue suit, sharp lighting, 8k portrait');
  const [testPromptResult, setTestPromptResult] = useState<{ safe: boolean; matched: string[] } | null>(null);

  // New banned keyword state
  const [newKeyword, setNewKeyword] = useState<string>('');

  // Summary Metrics
  const queuedCount = aiJobs.filter((j) => j.status === 'Antre').length;
  const processingCount = aiJobs.filter((j) => j.status === 'Diproses').length;
  const completedCount = aiJobs.filter((j) => j.status === 'Selesai').length;
  const failedCount = aiJobs.filter((j) => j.status === 'Gagal').length;
  const reviewCount = aiJobs.filter((j) => j.status === 'Perlu ditinjau').length;
  const totalCostRp = aiJobs.reduce((acc, curr) => acc + curr.estimatedCostRp, 0);

  // Filtered jobs
  const filteredJobs = aiJobs.filter((j) => {
    if (jobStatusFilter !== 'Semua status' && j.status !== jobStatusFilter) return false;
    if (searchJobQuery.trim() !== '') {
      const q = searchJobQuery.toLowerCase();
      const matchCode = j.jobCode.toLowerCase().includes(q);
      const matchOrder = j.orderNumber.toLowerCase().includes(q);
      const matchStyle = j.styleName.toLowerCase().includes(q);
      const matchEmail = j.customerEmail.toLowerCase().includes(q);
      if (!matchCode && !matchOrder && !matchStyle && !matchEmail) return false;
    }
    return true;
  });

  // Action: Retry Job
  const handleRetryJob = (job: AiQueueJob) => {
    updateState((prev) => ({
      ...prev,
      aiJobs: prev.aiJobs.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status: 'Diproses',
              errorMessage: undefined,
              workerNode: 'node-fal-worker-01 (Priority Retry)',
            }
          : item
      ),
    }));
    onShowToast(`Job ${job.jobCode} dimasukkan kembali ke antrean render prioritas worker FLUX.`, 'success');
  };

  // Action: Cancel Job
  const handleCancelJob = (job: AiQueueJob) => {
    updateState((prev) => ({
      ...prev,
      aiJobs: prev.aiJobs.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status: 'Dibatalkan',
              errorMessage: 'Dibatalkan oleh operator admin.',
            }
          : item
      ),
    }));
    onShowToast(`Job ${job.jobCode} berhasil dibatalkan.`, 'danger');
  };

  // Action: Boost Priority
  const handleBoostPriority = (job: AiQueueJob) => {
    updateState((prev) => ({
      ...prev,
      aiJobs: prev.aiJobs.map((item) =>
        item.id === job.id
          ? {
              ...item,
              workerNode: `${item.workerNode} [VIP BOOST]`,
            }
          : item
      ),
    }));
    onShowToast(`Prioritas antrean untuk Job ${job.jobCode} berhasil dinaikkan ke urutan teratas.`, 'info');
  };

  // Action: Approve Review
  const handleApproveJob = (job: AiQueueJob) => {
    const nowWib = formatTanggalWIB(new Date().toISOString());
    updateState((prev) => ({
      ...prev,
      aiJobs: prev.aiJobs.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status: 'Selesai',
              completedAtWib: nowWib,
              flaggedKeywords: [],
            }
          : item
      ),
      orders: prev.orders.map((ord) =>
        ord.orderNumber === job.orderNumber
          ? {
              ...ord,
              aiStatus: 'Selesai',
            }
          : ord
      ),
    }));
    onShowToast(`Hasil foto untuk pesanan ${job.orderNumber} telah disetujui & tautan unduh dibuka untuk pelanggan.`, 'success');
  };

  // Action: Block Job & Result
  const handleBlockJob = (job: AiQueueJob) => {
    updateState((prev) => ({
      ...prev,
      aiJobs: prev.aiJobs.map((item) =>
        item.id === job.id
          ? {
              ...item,
              status: 'Dibatalkan',
              errorMessage: 'Hasil diblokir oleh admin: Pelanggaran pedoman konten wajah/pose.',
            }
          : item
      ),
      orders: prev.orders.map((ord) =>
        ord.orderNumber === job.orderNumber
          ? {
              ...ord,
              aiStatus: 'Dibatalkan',
            }
          : ord
      ),
    }));
    onShowToast(`Hasil foto untuk pesanan ${job.orderNumber} telah diblokir permanen.`, 'danger');
  };

  // Toggle Reveal Blurred Photo
  const toggleRevealPhoto = (id: string) => {
    setRevealedPhotoIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Run Prompt Tester
  const handleTestPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const promptLower = testPromptInput.toLowerCase();
    const matches = bannedKeywords.filter((kw) => promptLower.includes(kw.toLowerCase()));
    setTestPromptResult({
      safe: matches.length === 0,
      matched: matches,
    });
  };

  // Add Banned Keyword
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newKeyword.trim().toLowerCase();
    if (!clean || bannedKeywords.includes(clean)) return;

    updateState((prev) => ({
      ...prev,
      bannedKeywords: [...prev.bannedKeywords, clean],
    }));
    setNewKeyword('');
    onShowToast(`Kata terlarang "${clean}" berhasil ditambahkan ke filter blacklist.`, 'success');
  };

  // Delete Banned Keyword
  const handleDeleteKeyword = (kw: string) => {
    updateState((prev) => ({
      ...prev,
      bannedKeywords: prev.bannedKeywords.filter((k) => k !== kw),
    }));
    onShowToast(`Kata "${kw}" dihapus dari blacklist.`, 'warning');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <Card padding="p-4" className="flex flex-col gap-1 justify-between">
          <span className="text-[11px] font-medium text-content-muted">Dalam Antrean Worker</span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-amber-500">{queuedCount + processingCount}</span>
            <span className="text-[11px] text-content-muted">({processingCount} running)</span>
          </div>
          <span className="text-[10px] text-content-muted mt-1">Fal.ai Concurrency: 5 node</span>
        </Card>

        <Card padding="p-4" className="flex flex-col gap-1 justify-between">
          <span className="text-[11px] font-medium text-content-muted">Selesai Berhasil</span>
          <span className="font-serif text-2xl font-bold text-emerald-500">{completedCount}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">98,2% Success Rate</span>
        </Card>

        <Card padding="p-4" className="flex flex-col gap-1 justify-between">
          <span className="text-[11px] font-medium text-content-muted">Perlu Ditinjau Manual</span>
          <span className="font-serif text-2xl font-bold text-rose-500">{reviewCount}</span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Butuh persetujuan admin</span>
        </Card>

        <Card padding="p-4" className="flex flex-col gap-1 justify-between">
          <span className="text-[11px] font-medium text-content-muted">Render Gagal / Timeout</span>
          <span className="font-serif text-2xl font-bold text-content-primary">{failedCount}</span>
          <span className="text-[10px] text-content-muted mt-1">Auto-retry max 3x</span>
        </Card>

        <Card padding="p-4" className="flex flex-col gap-1 justify-between col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-[11px] font-medium text-content-muted">Total Biaya Fal.ai</span>
          <span className="font-serif text-xl font-bold text-[#D9B06F]">{formatRupiah(totalCostRp)}</span>
          <span className="text-[10px] text-content-muted mt-1">Avg ~Rp450 / foto</span>
        </Card>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'queue'
              ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]'
              : 'text-content-muted hover:text-content-primary hover:bg-surface-hover'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Antrean Worker FLUX
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-card border border-border-subtle">
            {aiJobs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('review')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'review'
              ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]'
              : 'text-content-muted hover:text-content-primary hover:bg-surface-hover'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          Perlu Ditinjau &amp; Moderasi
          {reviewCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {reviewCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('blacklist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'blacklist'
              ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]'
              : 'text-content-muted hover:text-content-primary hover:bg-surface-hover'
          }`}
        >
          <Ban className="w-3.5 h-3.5 text-amber-500" />
          Kata Terlarang &amp; Uji Prompt
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-card border border-border-subtle">
            {bannedKeywords.length}
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: ANTREAN WORKER FLUX */}
      {activeSubTab === 'queue' && (
        <Card padding="p-6" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-content-primary">
                Daftar Antrean &amp; Eksekusi Worker Fal.ai
              </h3>
              <p className="text-xs text-content-muted mt-0.5">
                Monitoring status konkurensi model FLUX via Fal.ai secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder="Cari job code, pesanan, gaya..."
                value={searchJobQuery}
                onChange={(e) => setSearchJobQuery(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
              />

              <select
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-card text-xs font-semibold text-content-primary focus:outline-none focus:border-[#D9B06F]"
              >
                <option value="Semua status">Semua status</option>
                <option value="Antre">Antre</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Gagal">Gagal</option>
                <option value="Perlu ditinjau">Perlu ditinjau</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-content-muted font-medium text-[11px]">
                  <th className="py-2.5 px-3">KODE JOB</th>
                  <th className="py-2.5 px-3">PESANAN</th>
                  <th className="py-2.5 px-3">PAKET &amp; GAYA</th>
                  <th className="py-2.5 px-3">FOTO TARGET</th>
                  <th className="py-2.5 px-3">DURASI</th>
                  <th className="py-2.5 px-3">EST. BIAYA</th>
                  <th className="py-2.5 px-3">WORKER NODE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-hover/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-content-primary">
                      {job.jobCode}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => onNavigateOrder ? onNavigateOrder(job.orderNumber) : null}
                        className="font-mono text-content-primary hover:text-[#D9B06F] font-medium flex items-center gap-1"
                      >
                        {job.orderNumber}
                        <ExternalLink className="w-2.5 h-2.5 text-content-muted" />
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-content-primary">{job.styleName}</span>
                        <span className="text-[11px] text-content-muted">{job.packageName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-content-primary">{job.photosGenerated}</span>
                      <span className="text-content-muted"> / {job.photoTargetCount}</span>
                    </td>
                    <td className="py-3 px-3 text-content-muted">
                      {job.durationSeconds ? `${job.durationSeconds} dtk` : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-content-primary">
                      {formatRupiah(job.estimatedCostRp)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-content-muted max-w-[130px] truncate" title={job.workerNode}>
                      {job.workerNode}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        status={job.status}
                        variant={
                          job.status === 'Selesai'
                            ? 'emerald'
                            : job.status === 'Diproses'
                            ? 'blue'
                            : job.status === 'Antre'
                            ? 'amber'
                            : 'rose'
                        }
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status === 'Gagal' && (
                          <button
                            type="button"
                            onClick={() => handleRetryJob(job)}
                            className="p-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-border-subtle text-emerald-500 transition-colors"
                            title="Retry Render"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {job.status === 'Antre' && (
                          <button
                            type="button"
                            onClick={() => handleBoostPriority(job)}
                            className="p-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-border-subtle text-[#D9B06F] transition-colors"
                            title="Naikkan Prioritas"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(job.status === 'Antre' || job.status === 'Diproses') && (
                          <button
                            type="button"
                            onClick={() => handleCancelJob(job)}
                            className="p-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-border-subtle text-rose-500 transition-colors"
                            title="Batalkan Job"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUB-TAB 2: MODERASI & PERLU DITINJAU */}
      {activeSubTab === 'review' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-content-primary">
                Antrean Moderasi Hasil Render AI &amp; Pencegahan Biometrik Terdistorsi
              </h4>
              <p className="text-xs text-content-muted mt-0.5 leading-relaxed">
                Foto yang mengandung kata mencurigakan atau dilaporkan memiliki ketidaksempurnaan anatomi (mata, tangan, pose) ditahan di sini dan tidak dapat diunduh oleh pelanggan sebelum disetujui admin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiJobs
              .filter((j) => j.status === 'Perlu ditinjau' || (j.flaggedKeywords && j.flaggedKeywords.length > 0))
              .map((job) => {
                const isRevealed = !!revealedPhotoIds[job.id];
                return (
                  <Card key={job.id} padding="p-5" className="flex flex-col gap-4 justify-between border-rose-500/30">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-content-primary">{job.jobCode}</span>
                        <StatusBadge status="Perlu ditinjau" variant="rose" />
                      </div>

                      {/* Photo Preview with Blur Protection */}
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-border-subtle flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80"
                          alt="Hasil AI"
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            isRevealed ? 'filter-none' : 'filter blur-md scale-105 opacity-60'
                          }`}
                        />

                        {!isRevealed && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 p-4 text-center">
                            <ShieldAlert className="w-6 h-6 text-rose-400" />
                            <span className="text-[11px] font-semibold text-white">Foto Tersamarkan (Perlu Moderasi)</span>
                            <button
                              type="button"
                              onClick={() => toggleRevealPhoto(job.id)}
                              className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-hover text-content-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D9B06F]" />
                              Buka Sensor
                            </button>
                          </div>
                        )}

                        {isRevealed && (
                          <button
                            type="button"
                            onClick={() => toggleRevealPhoto(job.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                            title="Sensor Kembali"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-content-muted">Pesanan:</span>
                          <span className="font-mono font-semibold text-content-primary">{job.orderNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-content-muted">Pelanggan:</span>
                          <span className="text-content-primary">{maskEmail(job.customerEmail)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-content-muted">Gaya Jas:</span>
                          <span className="font-semibold text-content-primary">{job.styleName}</span>
                        </div>

                        {job.flaggedKeywords && job.flaggedKeywords.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400">
                            <span className="font-semibold block">Kata Kunci Terindikasi:</span>
                            <span>{job.flaggedKeywords.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Moderation Actions */}
                    <div className="pt-3 border-t border-border-subtle flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveJob(job)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white text-center transition-colors"
                      >
                        Setujui Hasil
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRetryJob(job)}
                        className="p-2 rounded-xl text-xs font-semibold bg-surface-card hover:bg-surface-hover border border-border-subtle text-content-primary transition-colors"
                        title="Render Ulang FLUX"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBlockJob(job)}
                        className="p-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Blokir Hasil Permanen"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: KATA TERLARANG & UJI PROMPT */}
      {activeSubTab === 'blacklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kolom Kiri: Manajemen Kata Terlarang (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card padding="p-6" className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-sm text-content-primary">
                  Daftar Kata Terlarang (Prompt Blacklist)
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Kata-kata yang dilarang pada prompt kustom guna mencegah pengubahan fitur identitas wajah asli pelanggan (usia, warna kulit, bentuk wajah) serta konten tidak pantas.
                </p>
              </div>

              {/* Form Tambah Kata */}
              <form onSubmit={handleAddKeyword} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik kata baru (mis. 27-year-old)..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </button>
              </form>

              {/* Badges List */}
              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1">
                {bannedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-surface-hover border border-border-subtle text-content-primary"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteKeyword(kw)}
                      className="text-content-muted hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Kolom Kanan: Uji Prompt Interaktif & Log Terblokir (7 Kolom) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Live Prompt Tester */}
            <Card padding="p-6" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D9B06F]" />
                  <h3 className="font-semibold text-sm text-content-primary">
                    Uji Filter Prompt Interaktif
                  </h3>
                </div>
                <span className="text-[11px] text-content-muted">Linter FLUX Engine</span>
              </div>

              <form onSubmit={handleTestPrompt} className="flex flex-col gap-3">
                <textarea
                  rows={3}
                  value={testPromptInput}
                  onChange={(e) => setTestPromptInput(e.target.value)}
                  placeholder="Ketik teks prompt untuk diuji..."
                  className="w-full p-3 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-card hover:bg-surface-hover border border-border-subtle text-content-primary self-start transition-colors"
                >
                  Uji Prompt Sekarang
                </button>
              </form>

              {testPromptResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                    testPromptResult.safe
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {testPromptResult.safe ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">
                      {testPromptResult.safe ? 'Prompt Aman & Lolos Validasi' : 'Prompt Mengandung Kata Terlarang'}
                    </span>
                    <span className="text-[11px] opacity-90 leading-relaxed">
                      {testPromptResult.safe
                        ? 'Prompt tidak terdeteksi memuat kata terlarang atau pengubah identitas wajah biometrik.'
                        : `Ditemukan kecocokan kata terlarang: ${testPromptResult.matched.join(', ')}. Prompt ini akan otomatis ditolak jika dimasukkan pelanggan.`}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Log Prompt yang Terblokir */}
            <Card padding="p-6" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-content-primary">
                  Riwayat Log Prompt Terblokir
                </h3>
                <span className="text-xs text-content-muted">{blockedPrompts.length} Kejadian</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-content-muted font-medium">
                      <th className="py-2 px-2.5">WAKTU</th>
                      <th className="py-2 px-2.5">PESANAN</th>
                      <th className="py-2 px-2.5">PROMPT INPUT</th>
                      <th className="py-2 px-2.5">KATA TERDETEKSI</th>
                      <th className="py-2 px-2.5">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/60">
                    {blockedPrompts.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-hover/40 transition-colors">
                        <td className="py-2.5 px-2.5 text-content-muted">{log.timeWib}</td>
                        <td className="py-2.5 px-2.5 font-mono text-content-primary">{log.orderNumber}</td>
                        <td className="py-2.5 px-2.5 text-content-primary max-w-[180px] truncate" title={log.rawPrompt}>
                          {log.rawPrompt}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[11px] font-semibold">
                            {log.matchedWords.join(', ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <StatusBadge
                            status={log.actionTaken}
                            variant={log.actionTaken === 'Disetujui admin' ? 'emerald' : 'rose'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiQueueModerationTab;
