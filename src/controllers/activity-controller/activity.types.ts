import type { ActivityLogItem, ActivityCategory, WebhookItem } from '../../types';

export type { ActivityLogItem, ActivityCategory, WebhookItem };

export interface AddActivityPayload {
  source?: string;
  category: ActivityCategory;
  activity: string;
  result?: string;
}

export interface AddWebhookPayload {
  eventTitle: string;
  eventSub: string;
  statusBadge: string;
  statusType: 'success' | 'error';
  latency: string;
  attempts: string;
}
