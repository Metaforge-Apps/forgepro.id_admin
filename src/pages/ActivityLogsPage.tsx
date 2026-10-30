import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Settings,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import type { ActivityLogItem, WebhookItem } from '../types';
import { useCentralStore } from '../mocks/selectors';
import { BUSINESS_CONFIG } from '../config/business';

export function ActivityLogsPage() {
  const navigate = useNavigate();
  const { state, updateState } = useCentralStore();
  const activityLogs = state.activityLogs;
  const webhooks = state.webhooks;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activityFilter, setActivityFilter] = useState<string>('Semua aktivitas');
  const [dateFilter, setDateFilter] = useState<string>('Hari ini');

  // Modals
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookItem | null>(null);
  const [showWebhookSettings, setShowWebhookSettings] = useState<boolean>(false);
  const [endpointUrl, setEndpointUrl] = useState<string>(
    'https://api.forgepro.id/webhooks/orders'
  );

  // Listen to Header "Ekspor log" button
  useEffect(() => {
    const handleHeaderAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'export-logs') {
        alert('Mengekspor log aktivitas & pengiriman webhook ke CSV...');
      }
    };
    window.addEventListener('forgepro-action', handleHeaderAction);
    return () => window.removeEventListener('forgepro-action', handleHeaderAction);
  }, []);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((item) => {
      if (
        activityFilter !== 'Semua aktivitas' &&
        item.category !== activityFilter
      ) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchSource = item.source.toLowerCase().includes(q);
        const matchAct = item.activity.toLowerCase().includes(q);
        if (!matchSource && !matchAct) return false;
      }
      return true;
    });
  }, [activityLogs, activityFilter, searchQuery]);

  const webhookStats = useMemo(() => {
    const totalWebhooks = webhooks.length;
    const successCount = webhooks.filter((w) => w.statusType === 'success').length;
    const failedCount = webhooks.filter((w) => w.statusType === 'error').length;
    return {
      activityCount: activityLogs.length,
      totalWebhooks,
      successCount,
      failedCount,
    };
  }, [activityLogs.length, webhooks]);

  const handleRetryWebhook = (wh: WebhookItem) => {
    const nextAttempt = Math.min(
      BUSINESS_CONFIG.webhookPolicy.maxRetries,
      (wh.attemptCount ?? 2) + 1
    );
    updateState((prev) => ({
      ...prev,
      webhooks: prev.webhooks.map((item) =>
        item.id === wh.id
          ? {
              ...item,
              statusBadge: '200 · Berhasil',
              statusType: 'success',
              httpStatus: 200,
              latency: '210 ms',
              attemptCount: nextAttempt,
              attempts: `${nextAttempt} dari ${BUSINESS_CONFIG.webhookPolicy.maxRetries}`,
              actionLabel: 'Detail',
            }
          : item
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 3 Summary Stat Cards Sesuai Referensi Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Aktivitas tercatat
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {webhookStats.activityCount}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            19 Oktober 2026 · WIB
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Webhook terkirim
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {webhookStats.successCount}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Dari {webhookStats.totalWebhooks} pengiriman tercatat
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Perlu dicoba ulang
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {webhookStats.failedCount}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Maks. {BUSINESS_CONFIG.webhookPolicy.maxRetriesLabel} ({BUSINESS_CONFIG.webhookPolicy.backoffDescription})
          </span>
        </Card>
      </div>

      {/* Card 1: Log aktivitas */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Log aktivitas
          </h2>
          <span className="text-xs text-content-muted">
            Disimpan selama 90 hari
          </span>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari admin, pesanan, atau aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Semua aktivitas">Semua aktivitas</option>
                <option value="Pesanan">Pesanan</option>
                <option value="Katalog">Katalog</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Hari ini">Hari ini</option>
                <option value="7 hari terakhir">7 hari terakhir</option>
                <option value="30 hari terakhir">30 hari terakhir</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">WAKTU (WIB)</th>
                <th className="pb-3 px-4">ADMIN / SUMBER</th>
                <th className="pb-3 px-4">AKTIVITAS</th>
                <th className="pb-3 px-4">HASIL</th>
                <th className="pb-3 pl-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                >
                  <td className="py-4 pr-4 text-content-muted whitespace-nowrap">
                    {log.time}
                  </td>
                  <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                    {log.source}
                  </td>
                  <td className="py-4 px-4 text-content-muted">
                    {log.activity}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      {log.result}
                    </span>
                  </td>
                  <td className="py-4 pl-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
                    >
                      <span>Detail</span>
                      <span>&rarr;</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border-subtle text-xs text-content-muted">
          <span>4 aktivitas terbaru dari 148 aktivitas hari ini · </span>
          <button
            type="button"
            onClick={() => alert('Menampilkan seluruh 148 aktivitas hari ini...')}
            className="text-content-muted hover:text-content-primary transition-colors inline-flex items-center gap-1"
          >
            <span>Lihat semua</span>
            <span>&rarr;</span>
          </button>
        </div>
      </Card>

      {/* Card 2: Pengiriman webhook */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Pengiriman webhook
          </h2>

          <button
            type="button"
            onClick={() => setShowWebhookSettings(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors self-start sm:self-auto"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan webhook</span>
          </button>
        </div>

        {/* Endpoint Produksi Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-content-primary">
              Endpoint produksi
            </span>
            <span className="text-xs text-content-muted">{endpointUrl}</span>
          </div>

          <span className="inline-flex items-center self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Terhubung
          </span>
        </div>

        {/* Webhook Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">WAKTU (WIB)</th>
                <th className="pb-3 px-4">EVENT / PESANAN</th>
                <th className="pb-3 px-4">HASIL PENGIRIMAN</th>
                <th className="pb-3 px-4">PERCOBAAN</th>
                <th className="pb-3 pl-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {webhooks.map((wh) => (
                <tr
                  key={wh.id}
                  onClick={() => setSelectedWebhook(wh)}
                  className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                >
                  {/* WAKTU (WIB) */}
                  <td className="py-4 pr-4 text-content-muted whitespace-nowrap">
                    {wh.time}
                  </td>

                  {/* EVENT / PESANAN */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-content-primary">
                        {wh.eventTitle}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-content-muted">
                        <span>{wh.eventName} ·</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/pesanan', { state: { selectedOrderId: wh.orderNumber } });
                          }}
                          className="font-mono font-bold text-content-primary hover:text-[#D9B06F] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>{wh.orderNumber}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* HASIL PENGIRIMAN */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          wh.statusType === 'success'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {wh.statusBadge}
                      </span>
                      <span className="text-[11px] text-content-muted">
                        {wh.latency}
                      </span>
                    </div>
                  </td>

                  {/* PERCOBAAN */}
                  <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                    {wh.attempts}
                  </td>

                  {/* AKSI */}
                  <td className="py-4 pl-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (wh.actionLabel === 'Coba ulang') {
                          handleRetryWebhook(wh);
                        } else {
                          setSelectedWebhook(wh);
                        }
                      }}
                      className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
                    >
                      <span>{wh.actionLabel}</span>
                      <span>&rarr;</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Info Notice: Percobaan ulang otomatis */}
      <div className="flex items-start gap-2.5 px-1 pt-1">
        <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-content-primary">
            Percobaan ulang otomatis
          </span>
          <p className="text-xs text-content-muted leading-relaxed">
            Pengiriman gagal dicoba ulang otomatis maksimal {BUSINESS_CONFIG.webhookPolicy.maxRetries} kali ({BUSINESS_CONFIG.webhookPolicy.backoffDescription}).
            Periksa endpoint dan respons server tujuan sebelum melakukan percobaan ulang manual.
          </p>
        </div>
      </div>

      {/* Modal Detail Log Aktivitas */}
      {selectedLog && (
        <div
          onClick={() => setSelectedLog(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Detail aktivitas
            </h3>
            <p className="text-xs text-content-muted mb-5">
              {selectedLog.time} WIB · {selectedLog.source}
            </p>

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Aktivitas</span>
                <span className="font-semibold text-content-primary">
                  {selectedLog.activity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Sumber tindakan</span>
                <span className="text-content-primary">{selectedLog.source}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Status hasil</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {selectedLog.result}
                </span>
              </div>
              {selectedLog.targetId && (
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
                  <span className="text-content-muted">Entitas Terkait</span>
                  {selectedLog.targetId.startsWith('PRO-') ? (
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedLog.targetId;
                        setSelectedLog(null);
                        navigate('/pesanan', { state: { selectedOrderId: target } });
                      }}
                      className="font-mono text-xs font-bold text-[#D9B06F] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{selectedLog.targetId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="font-mono text-xs text-content-primary">
                      {selectedLog.targetId}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Webhook */}
      {selectedWebhook && (
        <div
          onClick={() => setSelectedWebhook(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedWebhook(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              {selectedWebhook.eventTitle}
            </h3>
            <p className="text-xs text-content-muted mb-5">
              {selectedWebhook.eventSub} · {selectedWebhook.time} WIB
            </p>

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Endpoint tujuan</span>
                <span className="font-mono text-[11px] text-content-primary">
                  {endpointUrl}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Respons HTTP</span>
                <span className="font-semibold text-content-primary">
                  {selectedWebhook.statusBadge} ({selectedWebhook.latency})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Jumlah percobaan</span>
                <span className="text-content-primary">
                  {selectedWebhook.attempts}
                </span>
              </div>
              {selectedWebhook.orderNumber && (
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
                  <span className="text-content-muted">Pesanan Terkait</span>
                  <button
                    type="button"
                    onClick={() => {
                      const orderNum = selectedWebhook.orderNumber;
                      setSelectedWebhook(null);
                      navigate('/pesanan', { state: { selectedOrderId: orderNum } });
                    }}
                    className="font-mono text-xs font-bold text-[#D9B06F] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{selectedWebhook.orderNumber}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedWebhook(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengaturan Webhook */}
      {showWebhookSettings && (
        <div
          onClick={() => setShowWebhookSettings(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowWebhookSettings(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Pengaturan webhook
            </h3>
            <p className="text-xs text-content-muted mb-5">
              Konfigurasi URL tujuan pengiriman event pesanan ForgePro.id.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Endpoint produksi
                </label>
                <input
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowWebhookSettings(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={() => setShowWebhookSettings(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
                >
                  Simpan endpoint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLogsPage;
