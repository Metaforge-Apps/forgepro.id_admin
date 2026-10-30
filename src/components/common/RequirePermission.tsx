import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { type AdminRole } from '../../config/permissions';

export interface RequirePermissionProps {
  children: ReactNode;
  allowedRoles?: AdminRole[];
  path?: string;
  fallback?: ReactNode;
}

/**
 * Komponen Pembatas Akses Peran Admin (Fase 6: Item 30)
 * Menampilkan tampilan ramah "Akses Dibatasi" bila peran admin tidak memiliki izin.
 */
export function RequirePermission({
  children,
  allowedRoles,
  path,
  fallback,
}: RequirePermissionProps) {
  const navigate = useNavigate();
  const { currentRole, canAccessRoute, hasRole, isAdminUtama } = usePermission();

  if (isAdminUtama) {
    return <>{children}</>;
  }

  let hasAccess = true;

  if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = hasRole(...allowedRoles);
  } else if (path) {
    hasAccess = canAccessRoute(path);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h3 className="font-serif text-2xl font-semibold text-content-primary mb-2">
        Akses Dibatasi
      </h3>

      <p className="text-xs text-content-muted max-w-md mb-6 leading-relaxed">
        Akun Anda dengan peran <strong className="text-content-primary">{currentRole}</strong> tidak memiliki izin untuk mengakses modul ini.
        {allowedRoles && allowedRoles.length > 0 && (
          <span className="block mt-1">
            Modul ini diperuntukkan bagi: {allowedRoles.join(', ')}.
          </span>
        )}
        Hubungi Admin Utama jika Anda memerlukan wewenang tambahan.
      </p>

      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Dashboard</span>
      </button>
    </div>
  );
}

export default RequirePermission;
