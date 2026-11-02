import { useState, useEffect, useCallback } from 'react';
import { activityController } from './activity.controller';
import type { ActivityLogItem, WebhookItem, AddActivityPayload } from './activity.types';

export function useActivityController() {
  const [logs, setLogs] = useState<ActivityLogItem[]>(() =>
    activityController.getAllLogs()
  );
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(() =>
    activityController.getAllWebhooks()
  );

  useEffect(() => {
    const unsub = activityController.subscribe(() => {
      setLogs(activityController.getAllLogs());
      setWebhooks(activityController.getAllWebhooks());
    });
    return unsub;
  }, []);

  const logActivity = useCallback((payload: AddActivityPayload) => {
    return activityController.logActivity(payload);
  }, []);

  const retryWebhook = useCallback((id: string) => {
    return activityController.retryWebhook(id);
  }, []);

  const exportLogsCSV = useCallback(() => {
    activityController.exportLogsCSV();
  }, []);

  return {
    logs,
    webhooks,
    logActivity,
    retryWebhook,
    exportLogsCSV,
  };
}

export default useActivityController;
