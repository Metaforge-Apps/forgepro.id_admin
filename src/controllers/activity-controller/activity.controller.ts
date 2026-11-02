import type {
  ActivityLogItem,
  WebhookItem,
  AddActivityPayload,
} from './activity.types';
import { INITIAL_ACTIVITY_LOGS, INITIAL_WEBHOOKS } from './activity.seed';

const STORAGE_KEY_LOGS = 'forgepro_activity_logs_v1';
const STORAGE_KEY_WEBHOOKS = 'forgepro_webhooks_v1';

type ActivityListener = () => void;

function formatCurrentWIB(): string {
  const now = new Date();
  const day = now.getDate();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const month = months[now.getMonth()];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${day} ${month}, ${hh}:${mm}:${ss}`;
}

export class ActivityController {
  private logs: ActivityLogItem[];
  private webhooks: WebhookItem[];
  private listeners: Set<ActivityListener> = new Set();

  constructor() {
    this.logs = this.loadLogs();
    this.webhooks = this.loadWebhooks();
  }

  private loadLogs(): ActivityLogItem[] {
    if (typeof window === 'undefined') return [...INITIAL_ACTIVITY_LOGS];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LOGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_ACTIVITY_LOGS];
  }

  private loadWebhooks(): WebhookItem[] {
    if (typeof window === 'undefined') return [...INITIAL_WEBHOOKS];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WEBHOOKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_WEBHOOKS];
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.logs));
      localStorage.setItem(STORAGE_KEY_WEBHOOKS, JSON.stringify(this.webhooks));
    } catch {
      // Ignore
    }
  }

  private notify(): void {
    this.save();
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: ActivityListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAllLogs(): ActivityLogItem[] {
    return [...this.logs];
  }

  public getAllWebhooks(): WebhookItem[] {
    return [...this.webhooks];
  }

  public logActivity(payload: AddActivityPayload): ActivityLogItem {
    const item: ActivityLogItem = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: formatCurrentWIB(),
      source: payload.source || 'Admin Utama',
      category: payload.category,
      activity: payload.activity,
      result: payload.result || 'Berhasil',
    };
    this.logs = [item, ...this.logs];
    this.notify();
    return item;
  }

  public retryWebhook(id: string): WebhookItem | null {
    let target: WebhookItem | null = null;
    this.webhooks = this.webhooks.map((w) => {
      if (w.id === id) {
        target = {
          ...w,
          statusBadge: '200 · Berhasil',
          statusType: 'success',
          latency: '210 ms',
          attempts: '3 dari 3',
          actionLabel: 'Detail',
        };
        return target;
      }
      return w;
    });

    if (target) {
      this.logActivity({
        source: 'Sistem Webhook',
        category: 'Sistem',
        activity: `Pengiriman ulang webhook berhasil · ${id}`,
        result: 'Berhasil',
      });
      this.notify();
    }
    return target;
  }

  public exportLogsCSV(): void {
    const headers = ['ID', 'Waktu (WIB)', 'Pengguna / Sumber', 'Kategori', 'Aktivitas', 'Hasil'];
    const rows = this.logs.map((l) => [
      l.id,
      `"${l.time}"`,
      `"${l.source}"`,
      `"${l.category}"`,
      `"${l.activity.replace(/"/g, '""')}"`,
      `"${l.result}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `forgepro-activity-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const activityController = new ActivityController();
export default activityController;
