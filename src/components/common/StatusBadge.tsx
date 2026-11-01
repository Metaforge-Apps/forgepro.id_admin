import React from 'react';
import { Badge, type BadgeProps } from './Badge';

export type StatusBadgeProps = BadgeProps;

/**
 * StatusBadge Component (Fase 0: 0.4)
 * Alias terstandar untuk Badge dengan pemetaan warna status terpusat.
 */
export function StatusBadge(props: StatusBadgeProps) {
  return <Badge {...props} />;
}

export default StatusBadge;
