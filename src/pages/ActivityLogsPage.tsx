import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Settings,
  Info,
  X,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Activity,
  Radio,
  FileCode,
} from 'lucide-react';
import type { ActivityLogItem, WebhookItem } from '../types';
import { useCentralStore } from '../mocks/selectors';
import { BUSINESS_CONFIG } from '../config/business';
import { AiQueueModerationTab } from '../components/activity-logs/AiQueueModerationTab';

const ACTIVITY_PAGE_TABS = [
  'Log Aktivitas Sistem',
  'Log Webhook & Retry',
  'Antrean Worker FLUX & Moderasi Prompt',
] as const;

type ActivityTabType = (typeof ACTIVITY_PAGE_TABS)[number];

export function ActivityLogsPage() {
  const navigate = useNavigate();
  const { state, updateState } = useCentralStore();
  const activityLogs = state.activityLogs;
  const webhooks = state.webhooks;

  const [activeTab, setActiveTab] = useState<ActivityTabType>('Log Aktivitas Sistem');

  // Filter Activity Log
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activityFilter, setActivityFilter] = useState<string>('Semua aktivitas');
  const [dateFilter, setDateFilter] = useState<string>('Hari ini');

  // Modals & Feedback
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookItem | null>(null);
  const [showWebhookSettings, setShowWebhookSettings] = useState<boolean>(false);
  const [endpointUrl, setEndpointUrl] = useState<string>(
    'https://api.forgepro.id/webhooks/orders'
  );

  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastTone, setToastTone] = useState<'success' | 'danger' | 'warning' | 'info'>('success');

  const showToast = (msg: string, tone: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastTone(tone);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = ['ID', 'Waktu (WIB)', 'Admin / Sumber', 'Kategori', 'Aktivitas', 'Hasil', 'IP Address', 'Entitas Terkait'];
    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.time}"`,
      `"${log.source}"`,
      `"${log.category}"`,
      `"${log.activity.replace(/"/g, '""')}"`,
      `"${log.result}"`,
      `"${log.ipAddress || '127.0.0.1'}"`,
      `"${log.targetId || '-'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Log-Aktivitas-ForgePro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Log aktivitas berhasil diekspor ke berkas CSV.', 'success');
  };

  // Listen to Header "Ekspor log" button
  useEffect(() => {
    const handleHeaderAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'export-logs') {
        handleExportCsv();
      }
    };
    window.addEventListener('forgepro-action', handleHeaderAction);
    return () => window.removeEventListener('forgepro-action', handleHeaderAction);
  }, [activityLogs]);

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
        const matchTarget = item.targetId?.toLowerCase().includes(q);
        if (!matchSource && !matchAct && !matchTarget) return false;
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
    showToast(`Percobaan ulang webhook ${wh.eventTitle} (${wh.orderNumber}) berhasil dikirim: HTTP 200 OK.`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback Toast Banner */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-medium animate-fade-in ${
            toastTone === 'danger'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : toastTone === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              : toastTone === 'info'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastTone === 'danger' || toastTone === 'warning' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-content-muted hover:text-content-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Main Navigation Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-border-subtle pb-px [scrollbar-width:none]">
        {ACTIVITY_PAGE_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px select-none flex items-center gap-2 ${
                isActive
                  ? 'border-[#D9B06F] text-content-primary font-semibold'
                  : 'border-transparent text-content-muted hover:text-content-primary font-medium'
              }`}
            >
              {tab === 'Log Aktivitas Sistem' && <Activity className="w-3.5 h-3.5" />}
              {tab === 'Log Webhook & Retry' && <Radio className="w-3.5 h-3.5" />}
              {tab === 'Antrean Worker FLUX & Moderasi Prompt' && <Cpu className="w-3.5 h-3.5 text-[#D9B06F]" />}
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LOG AKTIVITAS SISTEM */}
      {activeTab === 'Log Aktivitas Sistem' && (
        <div className="flex flex-col gap-6">
          {/* Summary Stat Cards */}
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
                Disimpan selama 90 hari · WIB
              </span>
            </Card>

            <Card padding="p-6" className="flex flex-col justify-between">
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-medium text-content-muted">
                  Admin Aktif Beroperasi
                </span>
                <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
                  6 Admin
                </span>
              </div>
              <span className="text-xs text-content-muted mt-4 block">
                Multi-peran (Admin Utama, CS, Tim Cetak)
              </span>
            </Card>

            <Card padding="p-6" className="flex flex-col justify-between">
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-medium text-content-muted">
                  Log Perubahan Sensitif
                </span>
                <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-emerald-500">
                  100% Diaudit
                </span>
              </div>
              <span className="text-xs text-content-muted mt-4 block">
                Sebelum / sesudah diff tercatat lengkap
              </span>
            </Card>
          </div>

          {/* Table Card */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-content-primary">
                  Riwayat Aktivitas &amp; Jejak Audit Sistem
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  Setiap perubahan harga, status pesanan, dan hak akses tercatat dengan alamat IP dan timestamp WIB.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-[#D9B06F]" />
                Ekspor Log CSV
              </button>
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                <input
                  type="text"
                  placeholder="Cari admin, nomor pesanan, atau aktivitas..."
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
                    <option value="Pengaturan">Pengaturan</option>
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
                    <th className="pb-3 px-4">KATEGORI</th>
                    <th className="pb-3 px-4">AKTIVITAS</th>
                    <th className="pb-3 px-4">HASIL</th>
                    <th className="pb-3 pl-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 pr-4 text-content-muted whitespace-nowrap">
                        {log.time}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-content-primary whitespace-nowrap">
                        {log.source}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-surface-hover text-content-muted text-[11px]">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-content-primary">
                        {log.activity}
                        {log.targetId && (
                          <span className="ml-2 font-mono text-[11px] text-[#D9B06F]">
                            ({log.targetId})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge
                          status={log.result}
                          variant={log.result === 'Berhasil' ? 'emerald' : 'rose'}
                        />
                      </td>
                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
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

            <div className="pt-2 border-t border-border-subtle text-xs text-content-muted flex items-center justify-between">
              <span>Menampilkan {filteredLogs.length} aktivitas tersaring</span>
              <span>Zona Waktu: Asia/Jakarta (WIB)</span>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: LOG WEBHOOK & RETRY */}
      {activeTab === 'Log Webhook & Retry' && (
        <div className="flex flex-col gap-6">
          {/* Summary Stat Cards Webhook */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <Card padding="p-6" className="flex flex-col justify-between">
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-medium text-content-muted">
                  Webhook terkirim sukses
                </span>
                <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-emerald-500">
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
                <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-rose-500">
                  {webhookStats.failedCount}
                </span>
              </div>
              <span className="text-xs text-content-muted mt-4 block">
                Maks. {BUSINESS_CONFIG.webhookPolicy.maxRetriesLabel} ({BUSINESS_CONFIG.webhookPolicy.backoffDescription})
              </span>
            </Card>

            <Card padding="p-6" className="flex flex-col justify-between">
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-medium text-content-muted">
                  Endpoint URL Produksi
                </span>
                <span className="font-mono text-sm font-semibold text-content-primary truncate">
                  {endpointUrl}
                </span>
              </div>
              <span className="text-xs text-emerald-500 mt-4 block">
                Status: Terhubung &amp; Siap Menerima
              </span>
            </Card>
          </div>

          <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-content-primary">
                  Pengiriman Webhook Transaksional
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  Sinkronisasi peristiwa pesanan, verifikasi Google Play RTDN, dan nomor resi kurir.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowWebhookSettings(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors self-start sm:self-auto"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pengaturan Webhook</span>
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                    <th className="pb-3 pr-4">WAKTU (WIB)</th>
                    <th className="pb-3 px-4">EVENT / PESANAN</th>
                    <th className="pb-3 px-4">HASIL PENGIRIMAN</th>
                    <th className="pb-3 px-4">PERCOBAAN</th>
                    <th className="pb-3 pl-4 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {webhooks.map((wh) => (
                    <tr
                      key={wh.id}
                      onClick={() => setSelectedWebhook(wh)}
                      className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                    >
                      <td className="py-4 pr-4 text-content-muted whitespace-nowrap">
                        {wh.time}
                      </td>
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
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge
                            status={wh.statusBadge}
                            variant={wh.statusType === 'success' ? 'emerald' : 'rose'}
                          />
                          <span className="text-[11px] text-content-muted">
                            {wh.latency}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                        {wh.attempts}
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
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
        </div>
      )}

      {/* TAB 3: ANTREAN WORKER FLUX & MODERASI PROMPT */}
      {activeTab === 'Antrean Worker FLUX & Moderasi Prompt' && (
        <AiQueueModerationTab
          onShowToast={showToast}
          onNavigateOrder={(orderNum) => navigate('/pesanan', { state: { selectedOrderId: orderNum } })}
        />
      )}

      {/* Modal Detail Log Aktivitas */}
      {selectedLog && (
        <div
          onClick={() => setSelectedLog(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Detail Log Aktivitas &amp; Jejak Audit
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
                <span className="text-content-muted">Kategori</span>
                <span className="text-content-primary">{selectedLog.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Alamat IP Pelaku</span>
                <span className="font-mono text-content-primary">{selectedLog.ipAddress || '180.252.88.14 (Jakarta, ID)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Status hasil</span>
                <StatusBadge
                  status={selectedLog.result}
                  variant={selectedLog.result === 'Berhasil' ? 'emerald' : 'rose'}
                />
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
            className="w-full max-w-lg rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
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
            <p className="text-xs text-content-muted mb-4">
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

              {/* Raw JSON Payload Simulation */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border-subtle/50">
                <span className="text-content-muted font-semibold flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-[#D9B06F]" />
                  Payload JSON Terkirim:
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-border-subtle">
                  {JSON.stringify(
                    {
                      eventId: selectedWebhook.id,
                      eventName: selectedWebhook.eventName,
                      timestampWib: selectedWebhook.time,
                      orderNumber: selectedWebhook.orderNumber,
                      deliveryAttempt: selectedWebhook.attempts,
                      status: selectedWebhook.statusType,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              {selectedWebhook.actionLabel === 'Coba ulang' && (
                <button
                  type="button"
                  onClick={() => {
                    handleRetryWebhook(selectedWebhook);
                    setSelectedWebhook(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Coba Ulang Pengiriman
                </button>
              )}
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
              Pengaturan Webhook
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
                  onClick={() => {
                    setShowWebhookSettings(false);
                    showToast('Endpoint webhook berhasil diperbarui.', 'success');
                  }}
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
