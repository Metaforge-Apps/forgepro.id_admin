import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ROLE_PERMISSIONS,
  type AdminRole,
} from '../config/permissions';

export interface UsePermissionReturn {
  currentRole: AdminRole;
  roleConfig: typeof ROLE_PERMISSIONS[AdminRole];
  canAccessRoute: (path: string) => boolean;
  hasRole: (...roles: AdminRole[]) => boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  isAdminUtama: boolean;
}

/**
 * Hook Sistem Izin & Peran Admin ForgePro.id
 * Akses penuh terbuka ke semua modul dan fitur tanpa pembatasan peran.
 */
export function usePermission(): UsePermissionReturn {
  const { user } = useAuth();
  const currentRole = (user?.role || 'Admin Utama') as AdminRole;

  const roleConfig = useMemo(() => {
    return ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS['Admin Utama'];
  }, [currentRole]);

  return {
    currentRole,
    roleConfig,
    canAccessRoute: () => true,
    hasRole: () => true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    isAdminUtama: true,
  };
}

export default usePermission;
