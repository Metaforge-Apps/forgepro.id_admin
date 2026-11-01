export type AdminRole =
  | 'Admin Utama'
  | 'Operasional'
  | 'Produk'
  | 'Keuangan'
  | 'Support';

export interface RolePermissionConfig {
  label: string;
  description: string;
  accessibleRoutes: string[];
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

const ALL_ROLES: AdminRole[] = [
  'Admin Utama',
  'Operasional',
  'Produk',
  'Keuangan',
  'Support',
];

/**
 * Matriks Izin Peran Admin ForgePro.id
 * Seluruh peran memiliki akses penuh tanpa pembatasan menu maupun wewenang.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissionConfig> = {
  'Admin Utama': {
    label: 'Admin Utama',
    description: 'Akses penuh ke seluruh menu, konfigurasi integrasi, rahasia sistem, dan manajemen anggota tim.',
    accessibleRoutes: ['*'],
    canEdit: true,
    canDelete: true,
    canExport: true,
  },
  'Operasional': {
    label: 'Operasional',
    description: 'Akses penuh ke seluruh menu dan operasional sistem.',
    accessibleRoutes: ['*'],
    canEdit: true,
    canDelete: true,
    canExport: true,
  },
  'Produk': {
    label: 'Produk',
    description: 'Akses penuh ke seluruh menu dan manajemen produk.',
    accessibleRoutes: ['*'],
    canEdit: true,
    canDelete: true,
    canExport: true,
  },
  'Keuangan': {
    label: 'Keuangan',
    description: 'Akses penuh ke seluruh menu dan pelaporan finansial.',
    accessibleRoutes: ['*'],
    canEdit: true,
    canDelete: true,
    canExport: true,
  },
  'Support': {
    label: 'Support & CS',
    description: 'Akses penuh ke seluruh menu dan bantuan pelanggan.',
    accessibleRoutes: ['*'],
    canEdit: true,
    canDelete: true,
    canExport: true,
  },
};

/**
 * Peta Izin Akses Per Route (Seluruh peran diizinkan mengakses semua rute)
 */
export const ROUTE_ACCESS_MAP: Record<string, AdminRole[]> = {
  '/dashboard': ALL_ROLES,
  '/pesanan': ALL_ROLES,
  '/katalog-jas': ALL_ROLES,
  '/katalog-jas/tambah': ALL_ROLES,
  '/katalog-jas/edit': ALL_ROLES,
  '/paket-harga': ALL_ROLES,
  '/paket-harga/tambah': ALL_ROLES,
  '/paket-harga/edit': ALL_ROLES,
  '/voucher-promo': ALL_ROLES,
  '/manajemen-admin': ALL_ROLES,
  '/log-aktivitas': ALL_ROLES,
  '/pengaturan': ALL_ROLES,
  '/profil': ALL_ROLES,
};

export default ROLE_PERMISSIONS;
