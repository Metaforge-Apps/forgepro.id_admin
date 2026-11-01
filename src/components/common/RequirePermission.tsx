import { ReactNode } from 'react';
import { type AdminRole } from '../../config/permissions';

export interface RequirePermissionProps {
  children: ReactNode;
  allowedRoles?: AdminRole[];
  path?: string;
  fallback?: ReactNode;
}

/**
 * Komponen Pembatas Akses Peran Admin ForgePro.id
 * Akses terbuka penuh tanpa pembatasan (akses dibatasi dinonaktifkan).
 */
export function RequirePermission({
  children,
}: RequirePermissionProps) {
  return <>{children}</>;
}

export default RequirePermission;
