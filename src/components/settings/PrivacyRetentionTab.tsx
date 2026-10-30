import React, { useState } from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useCentralStore } from '../../mocks/selectors';
import { BUSINESS_CONFIG, formatTanggalWIB, maskEmail } from '../../config/business';
import type { PrivacyDeletionJob, PrivacyManualDeletionRequest } from '../../types';
import {
  ShieldCheck,
  Clock,
  Trash2,
  FileCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  UserX,
} from 'lucide-react';

interface PrivacyRetentionTabProps {
  onShowToast: (message: string, tone?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export function PrivacyRetentionTab({ onShowToast }: PrivacyRetentionTabProps) {
  const { state, updateState } = useCentralStore();
  const deletionJobs = state.privacyDeletionJobs;
  const manualRequests = state.privacyManualRequests;
  const consentLogs = state.consentLogs;

  const [downloadDays, setDownloadDays] = useState<number>(BUSINESS_CONFIG.retentionPolicy.aiResultRetentionDays);
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState<boolean>(true);
  const [warnBeforeExpiry, setWarnBeforeExpiry] = useState<boolean>(true);

  // Modal / Confirm state for manual deletion
  const [targetRequestToPurge, setTargetRequestToPurge] = useState<PrivacyManualDeletionRequest | null>(null);
  const [isExecutingJob, setIsExecutingJob] = useState<boolean>(false);

  // Handle execute automated purge job now
  const handleRunPurgeNow = () => {
    setIsExecutingJob(true);
    setTimeout(() => {
      const newJob: PrivacyDeletionJob = {
        id: `del-${Date.now()}`,
        batchCode: `PURGE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
        executedAtWib: formatTanggalWIB(new Date().toISOString()),
        targetType: 'Selfie pelanggan (> 24 jam)',
        deletedCount: 14,
        status: 'Berhasil',
        notes: 'Pembersihan biometrik rutin selfie > 24 jam selesai. 14 berkas selfie dihapus permanen dari storage bucket.',
      };

      updateState((prev) => ({
        ...prev,
        privacyDeletionJobs: [newJob, ...prev.privacyDeletionJobs],
      }));
      setIsExecutingJob(false);
      onShowToast('Job pembersihan biometrik berhasil dijalankan. 14 selfie kadaluwarsa telah dihapus permanen.', 'success');
    }, 600);
  };

  // Handle approve manual deletion request
  const handleConfirmManualPurge = () => {
    if (!targetRequestToPurge) return;
    const nowWib = formatTanggalWIB(new Date().toISOString());

    updateState((prev) => ({
      ...prev,
      privacyManualRequests: prev.privacyManualRequests.map((req) =>
        req.id === targetRequestToPurge.id
          ? {
              ...req,
              status: 'Selesai dihapus',
              completedAtWib: nowWib,
              processedBy: 'Admin Utama (Andi Prasetyo)',
            }
          : req
      ),
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          time: nowWib,
          source: 'Admin Utama (Andi Prasetyo)',
          activity: `Persetujuan hak hapus data (UU PDP): ${targetRequestToPurge.customerEmail} (${targetRequestToPurge.requestNumber})`,
          category: 'Pengaturan',
          result: 'Berhasil',
          targetId: targetRequestToPurge.orderNumber,
        },
        ...prev.activityLogs,
      ],
    }));

    onShowToast(`Data pelanggan ${maskEmail(targetRequestToPurge.customerEmail)} telah berhasil dihapus permanen sesuai amanat UU PDP.`, 'success');
    setTargetRequestToPurge(null);
  };

  // Export proof of deletion
  const handleExportProof = (req: PrivacyManualDeletionRequest) => {
    const proofText = `BUKTI PENGHAPUSAN DATA PRIBADI (UU PDP NO. 27 TAHUN 2022)
---------------------------------------------------------------
Nomor Permohonan : ${req.requestNumber}
Email Pemohon    : ${req.customerEmail}
Nomor Pesanan    : ${req.orderNumber}
Waktu Permohonan : ${req.requestedAtWib}
Waktu Eksekusi   : ${req.completedAtWib || 'Diproses sekarang'}
Petugas Eksekutor: ${req.processedBy || 'Sistem ForgePro.id'}
Status Tindakan  : DIHAPUS PERMANEN (Selfie mentah, log pemrosesan, dan embedding wajah)
Dasar Hukum      : Pasal 39 UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi
Hash Verifikasi  : SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}
---------------------------------------------------------------
Dokumen ini sah sebagai tanda bukti penghapusan data resmi ForgePro.id.`;

    const blob = new Blob([proofText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bukti-Hapus-PDP-${req.requestNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Bukti penghapusan data pelanggan berhasil diunduh.', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Kepatuhan UU PDP No. 27/2022 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-content-primary">
                Kepatuhan Penuh UU No. 27 Tahun 2022 (UU PDP)
              </h3>
              <StatusBadge status="Aktif" variant="emerald" />
            </div>
            <p className="text-xs text-content-muted mt-0.5 leading-relaxed">
              ForgePro.id menerapkan standar retensi data ketat: selfie biometrik dihapus otomatis dalam waktu maks 24 jam setelah rendering FLUX selesai.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRunPurgeNow}
          disabled={isExecutingJob}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card hover:bg-surface-hover border border-border-subtle text-content-primary shrink-0 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          {isExecutingJob ? 'Memproses...' : 'Jalankan Pembersihan Manual'}
        </button>
      </div>

      {/* Row 1: Parameter Retensi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <Card padding="p-6" className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D9B06F]" />
                <h3 className="font-semibold text-sm text-content-primary">Kebijakan Masa Simpan Data</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-hover text-content-muted">
                business.ts
              </span>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              {/* Selfie Biometrik (Locked) */}
              <div className="p-3.5 rounded-xl bg-surface-hover/50 border border-border-subtle flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-content-primary">Selfie Wajah Biometrik Mentah</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">24 Jam (Wajib Hukum)</span>
                </div>
                <p className="text-[11px] text-content-muted leading-relaxed">
                  Selfie pelanggan tidak disimpan permanen di server maupun database. File langsung dijadwalkan untuk dihapus tuntas oleh worker cron 24 jam sejak foto diterima.
                </p>
              </div>

              {/* Hasil Render AI */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-content-primary">Masa Unduh Foto Hasil AI (Hari)</label>
                  <span className="font-bold text-[#D9B06F]">{downloadDays} Hari</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={downloadDays}
                  onChange={(e) => setDownloadDays(Number(e.target.value))}
                  className="w-full accent-[#D9B06F] cursor-pointer"
                />
                <span className="text-[11px] text-content-muted">
                  Tautan unduhan pelanggan di aplikasi Flutter akan kadaluwarsa setelah {downloadDays} hari. File di storage bucket S3/GCS dihapus permanen.
                </span>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-border-subtle flex flex-col gap-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-content-primary">Pembersihan berkas kadaluwarsa otomatis (Cron)</span>
                  <input
                    type="checkbox"
                    checked={autoPurgeEnabled}
                    onChange={(e) => setAutoPurgeEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#D9B06F] rounded"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-content-primary">Kirim email pengingat H-3 sebelum tautan unduh kedaluwarsa</span>
                  <input
                    type="checkbox"
                    checked={warnBeforeExpiry}
                    onChange={(e) => setWarnBeforeExpiry(e.target.checked)}
                    className="w-4 h-4 accent-[#D9B06F] rounded"
                  />
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Ringkasan Job Otomatis */}
        <div className="lg:col-span-6">
          <Card padding="p-6" className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-sm text-content-primary">Riwayat Job Pembersihan Terakhir</h3>
              </div>
              <span className="text-[11px] text-content-muted">{deletionJobs.length} Job tercatat</span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {deletionJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-content-primary">{job.batchCode}</span>
                      <StatusBadge
                        status={job.status}
                        variant={job.status === 'Berhasil' ? 'emerald' : 'amber'}
                      />
                    </div>
                    <span className="text-[11px] text-content-muted">{job.targetType}</span>
                    <span className="text-[11px] text-content-muted mt-0.5">{job.notes}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-500">-{job.deletedCount} berkas</span>
                    <p className="text-[10px] text-content-muted mt-0.5">{job.executedAtWib}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Permintaan Penghapusan Data Manual Pelanggan (UU PDP Pasal 39) */}
      <Card padding="p-6" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-500" />
              <h3 className="font-semibold text-sm text-content-primary">
                Permintaan Penghapusan Data Pelanggan (Hak Dihapus / Right to Erasure)
              </h3>
            </div>
            <p className="text-xs text-content-muted mt-0.5">
              Pelanggan berhak mengajukan permohonan penghapusan seluruh data terkait email mereka sesuai Pasal 39 UU PDP.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-hover text-content-primary">
            {manualRequests.filter((r) => r.status === 'Menunggu').length} Menunggu Tindakan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-medium">
                <th className="py-2.5 px-3">NO. PERMOHONAN</th>
                <th className="py-2.5 px-3">EMAIL PELANGGAN</th>
                <th className="py-2.5 px-3">PESANAN TERKAIT</th>
                <th className="py-2.5 px-3">ALASAN</th>
                <th className="py-2.5 px-3">WAKTU DIAJUKAN</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {manualRequests.map((req) => (
                <tr key={req.id} className="hover:bg-surface-hover/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-content-primary">
                    {req.requestNumber}
                  </td>
                  <td className="py-3 px-3 text-content-primary font-medium">
                    {maskEmail(req.customerEmail)}
                  </td>
                  <td className="py-3 px-3 font-mono text-content-muted">
                    {req.orderNumber}
                  </td>
                  <td className="py-3 px-3 text-content-muted max-w-[200px] truncate" title={req.reason}>
                    {req.reason}
                  </td>
                  <td className="py-3 px-3 text-content-muted">
                    {req.requestedAtWib}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      status={req.status}
                      variant={
                        req.status === 'Selesai dihapus'
                          ? 'emerald'
                          : req.status === 'Diproses'
                          ? 'blue'
                          : 'amber'
                      }
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {req.status !== 'Selesai dihapus' ? (
                        <button
                          type="button"
                          onClick={() => setTargetRequestToPurge(req)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 transition-colors"
                        >
                          Hapus Data
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExportProof(req)}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-hover text-content-primary font-medium border border-border-subtle transition-colors flex items-center gap-1.5"
                          title="Unduh Bukti Penghapusan Resmi"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Bukti PDP
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

      {/* Row 3: Log Persetujuan Syarat & Ketentuan (Consent Audit Trail) */}
      <Card padding="p-6" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-content-primary">
              Log Persetujuan Pelanggan (Consent Audit Trail)
            </h3>
            <p className="text-xs text-content-muted mt-0.5">
              Bukti sah persetujuan klausul privasi dan ketentuan layanan saat pelanggan mengunggah foto selfie di aplikasi.
            </p>
          </div>
          <span className="text-xs text-content-muted">{consentLogs.length} Entri Persetujuan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-medium">
                <th className="py-2.5 px-3">PESANAN</th>
                <th className="py-2.5 px-3">EMAIL</th>
                <th className="py-2.5 px-3">VERSI SYARAT</th>
                <th className="py-2.5 px-3">VERSI PRIVASI</th>
                <th className="py-2.5 px-3">WAKTU PERSETUJUAN</th>
                <th className="py-2.5 px-3">IP ADDRESS</th>
                <th className="py-2.5 px-3">PERANGKAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {consentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-hover/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-content-primary">
                    {log.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 text-content-primary">
                    {maskEmail(log.customerEmail)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-surface-hover font-mono text-[11px] text-content-primary">
                      {log.termsVersion}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-surface-hover font-mono text-[11px] text-content-primary">
                      {log.privacyVersion}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-content-muted">
                    {log.consentedAtWib}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-content-muted">
                    {log.ipMasked}
                  </td>
                  <td className="py-2.5 px-3 text-content-muted">
                    {log.deviceInfo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Dialog Konfirmasi Penghapusan Manual Data Pelanggan */}
      <ConfirmDialog
        open={!!targetRequestToPurge}
        title="Penghapusan Permanen Data Pelanggan"
        description={`Anda akan menghapus permanen data untuk ${targetRequestToPurge?.customerEmail} (Pesanan ${targetRequestToPurge?.orderNumber}). Seluruh data selfie mentah, vektor biometrik, dan riwayat unduhan akan dimusnahkan. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Permanen Sekarang"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleConfirmManualPurge}
        onClose={() => setTargetRequestToPurge(null)}
      />
    </div>
  );
}

export default PrivacyRetentionTab;
