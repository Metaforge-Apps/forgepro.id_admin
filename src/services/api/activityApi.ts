import { apiRequest, isMockMode } from './apiClient';
import type { ActivityLogItem, WebhookItem } from '../../controllers/activity-controller/activity.types';
import { INITIAL_ACTIVITY_LOGS, INITIAL_WEBHOOKS } from '../../controllers/activity-controller/activity.seed';

export const activityApi = {
  async getLogs(): Promise<ActivityLogItem[]> {
    if (isMockMode()) {
      return [...INITIAL_ACTIVITY_LOGS];
    }
    const res = await apiRequest<ActivityLogItem[]>('/logs');
    return res.data;
  },

  async getWebhooks(): Promise<WebhookItem[]> {
    if (isMockMode()) {
      return [...INITIAL_WEBHOOKS];
    }
    const res = await apiRequest<WebhookItem[]>('/webhooks');
    return res.data;
  },

  async retryWebhook(id: string): Promise<WebhookItem> {
    if (isMockMode()) {
      const found = INITIAL_WEBHOOKS.find((w) => w.id === id);
      if (!found) throw new Error('Webhook not found');
      return {
        ...found,
        statusBadge: '200 · Berhasil',
        statusType: 'success',
        latency: '210 ms',
        attempts: '3 dari 3',
        actionLabel: 'Detail',
      };
    }
    const res = await apiRequest<WebhookItem>(`/webhooks/${id}/retry`, {
      method: 'POST',
    });
    return res.data;
  },
};

export default activityApi;
