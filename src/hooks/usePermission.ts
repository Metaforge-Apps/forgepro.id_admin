import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ROLE_PERMISSIONS,
  ROUTE_ACCESS_MAP,
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
 * Hook Sistem Izin & Peran Admin ForgePro.id (Fase 6: Item 30)
 */
export function usePermission(): UsePermissionReturn {
  const { user } = useAuth();
  const currentRole = (user?.role || 'Admin Utama') as AdminRole;

  const roleConfig = useMemo(() => {
    return ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS['Admin Utama'];
  }, [currentRole]);

  const isAdminUtama = currentRole === 'Admin Utama';

  const canAccessRoute = (path: string): boolean => {
    if (isAdminUtama) return true;
    const allowedRoles = ROUTE_ACCESS_MAP[path];
    if (!allowedRoles) return true; // Default allow if not in map
    return allowedRoles.includes(currentRole);
  };

  const hasRole = (...roles: AdminRole[]): boolean => {
    return roles.includes(currentRole);
  };

  return {
    currentRole,
    roleConfig,
    canAccessRoute,
    hasRole,
    canEdit: isAdminUtama || roleConfig.canEdit,
    canDelete: isAdminUtama || roleConfig.canDelete,
    canExport: isAdminUtama || roleConfig.canExport,
    isAdminUtama,
  };
}

export default usePermission;
