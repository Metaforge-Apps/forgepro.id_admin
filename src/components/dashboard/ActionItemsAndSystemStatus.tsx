import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { useCentralStore } from '../../mocks/selectors';
import {
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Truck,
  Radio,
  CheckCircle2,
  Sparkles,
  Server,
  HardDrive,
  Mail,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';

export function ActionItemsAndSystemStatus() {
  const navigate = useNavigate();
  const { state } = useCentralStore();

  const failedJobsCount = state.aiJobs.filter((j) => j.status === 'Gagal').length;
  const reviewJobsCount = state.aiJobs.filter((j) => j.status === 'Perlu ditinjau').length;
  const failedWebhooksCount = state.webhooks.filter((w) => w.statusType === 'error').length;
  const pendingResiPrintsCount = state.orders.filter(
    (o) => o.printPaymentId && !o.shippingTrackingNumber
  ).length;

  const totalActionItems = failedJobsCount + reviewJobsCount + failedWebhooksCount + pendingResiPrintsCount;

  return (
    <div className="flex flex-col gap-5">
      {/* Kartu Perlu Tindakan (Action Items) */}
      <Card padding="p-5 sm:p-6" className="flex flex-col gap-4 border-amber-500/20 bg-gradient-to-br from-surface-card to-amber-500/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-content-primary">
                Perlu Tindakan Operasional
              </h3>
              <p className="text-xs text-content-muted">
                {totalActionItems > 0
                  ? `${totalActionItems} item operasional memerlukan respon atau persetujuan admin`
                  : 'Semua sistem & pesanan berjalan normal tanpa kendala'}
              </p>
            </div>
          </div>
          {totalActionItems > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {totalActionItems} Perhatian
            </span>
          ) : (
            <StatusBadge status="Tuntas" variant="emerald" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Item 1: Review Moderasi AI */}
          <button
            type="button"
            onClick={() => navigate('/log-aktivitas')}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
              reviewJobsCount > 0
                ? 'bg-surface-card border-rose-500/40 hover:bg-rose-500/5 hover:border-rose-500'
                : 'bg-surface-card/60 border-border-subtle opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Moderasi AI
              </span>
              <span className={`text-xs font-bold ${reviewJobsCount > 0 ? 'text-rose-500' : 'text-content-muted'}`}>
                {reviewJobsCount}
              </span>
            </div>
            <p className="text-[11px] text-content-muted">
              {reviewJobsCount > 0
                ? 'Foto terindikasi kata terlarang butuh persetujuan'
                : 'Tidak ada foto yang ditahan'}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-content-primary pt-1">
              <span>Buka Moderasi</span>
              <ChevronRight className="w-3 h-3 text-[#D9B06F]" />
            </div>
          </button>

          {/* Item 2: Render AI Gagal */}
          <button
            type="button"
            onClick={() => navigate('/log-aktivitas')}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
              failedJobsCount > 0
                ? 'bg-surface-card border-amber-500/40 hover:bg-amber-500/5 hover:border-amber-500'
                : 'bg-surface-card/60 border-border-subtle opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                Render Gagal
              </span>
              <span className={`text-xs font-bold ${failedJobsCount > 0 ? 'text-amber-500' : 'text-content-muted'}`}>
                {failedJobsCount}
              </span>
            </div>
            <p className="text-[11px] text-content-muted">
              {failedJobsCount > 0
                ? 'Job FLUX timeout atau error perlu retry'
                : 'Semua worker berjalan lancar'}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-content-primary pt-1">
              <span>Antrean Worker</span>
              <ChevronRight className="w-3 h-3 text-[#D9B06F]" />
            </div>
          </button>

          {/* Item 3: Cetak Fisik Menunggu Resi */}
          <button
            type="button"
            onClick={() => navigate('/cetak-pengiriman')}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
              pendingResiPrintsCount > 0
                ? 'bg-surface-card border-blue-500/40 hover:bg-blue-500/5 hover:border-blue-500'
                : 'bg-surface-card/60 border-border-subtle opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-500" />
                Menunggu Resi
              </span>
              <span className={`text-xs font-bold ${pendingResiPrintsCount > 0 ? 'text-blue-500' : 'text-content-muted'}`}>
                {pendingResiPrintsCount}
              </span>
            </div>
            <p className="text-[11px] text-content-muted">
              {pendingResiPrintsCount > 0
                ? 'Cetak lunas menunggu input nomor resi kurir'
                : 'Semua pesanan cetak memiliki resi'}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-content-primary pt-1">
              <span>Ke Modul Cetak</span>
              <ChevronRight className="w-3 h-3 text-[#D9B06F]" />
            </div>
          </button>

          {/* Item 4: Webhook Gagal */}
          <button
            type="button"
            onClick={() => navigate('/log-aktivitas')}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
              failedWebhooksCount > 0
                ? 'bg-surface-card border-rose-500/40 hover:bg-rose-500/5 hover:border-rose-500'
                : 'bg-surface-card/60 border-border-subtle opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-content-primary flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                Webhook Gagal
              </span>
              <span className={`text-xs font-bold ${failedWebhooksCount > 0 ? 'text-rose-500' : 'text-content-muted'}`}>
                {failedWebhooksCount}
              </span>
            </div>
            <p className="text-[11px] text-content-muted">
              {failedWebhooksCount > 0
                ? 'Percobaan ulang otomatis (maks 5x)'
                : 'Semua webhook 200 OK'}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-content-primary pt-1">
              <span>Log Webhook</span>
              <ChevronRight className="w-3 h-3 text-[#D9B06F]" />
            </div>
          </button>
        </div>
      </Card>

      {/* Baris Status Sistem (System Health Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D9B06F]" />
            <span className="text-xs font-medium text-content-primary">Fal.ai FLUX</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Normal" />
        </div>

        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-content-primary">Google Play</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sinkron" />
        </div>

        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-xs font-medium text-content-primary">Webhook</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Aktif" />
        </div>

        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-content-primary">Storage S3</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Terhubung" />
        </div>

        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-xs font-medium text-content-primary">SendGrid</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="SPF/DKIM Valid" />
        </div>

        <div className="p-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-content-primary">Biteship API</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Siap" />
        </div>
      </div>
    </div>
  );
}

export default ActionItemsAndSystemStatus;
