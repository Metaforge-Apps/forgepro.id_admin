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

/**
 * Matriks Izin Peran Admin ForgePro.id (Fase 6: Item 30)
 * - Admin Utama: Akses penuh tanpa batasan ke seluruh menu & konfigurasi
 * - Operasional: Fokus pada alur pesanan, cetak pengiriman, dan log aktivitas
 * - Produk: Fokus pada katalog jas, paket harga, dan voucher promo
 * - Keuangan: Fokus pada pelaporan pesanan, transaksi, dan verifikasi bayar
 * - Support: Akses tiket bantuan, detail pesanan (catatan internal), dan kurir
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
    description: 'Mengelola pesanan, proses generator AI FLUX, cetak fisik, resi kurir, dan memantau log sistem.',
    accessibleRoutes: [
      '/dashboard',
      '/pesanan',
      '/cetak-pengiriman',
      '/log-aktivitas',
      '/profil',
    ],
    canEdit: true,
    canDelete: false,
    canExport: true,
  },
  'Produk': {
    label: 'Produk',
    description: 'Mengelola katalog gaya jas FLUX, paket kredit & harga, serta kupon voucher promosi.',
    accessibleRoutes: [
      '/dashboard',
      '/katalog-jas',
      '/katalog-jas/tambah',
      '/katalog-jas/edit',
      '/paket-harga',
      '/paket-harga/tambah',
      '/paket-harga/edit',
      '/voucher-promo',
      '/profil',
    ],
    canEdit: true,
    canDelete: true,
    canExport: true,
  },
  'Keuangan': {
    label: 'Keuangan',
    description: 'Memantau transaksi pesanan Google Play, verifikasi manual GPA, pembayaran cetak fisik, dan audit finansial.',
    accessibleRoutes: [
      '/dashboard',
      '/pesanan',
      '/cetak-pengiriman',
      '/paket-harga',
      '/voucher-promo',
      '/profil',
    ],
    canEdit: true,
    canDelete: false,
    canExport: true,
  },
  'Support': {
    label: 'Support & CS',
    description: 'Membantu pelanggan: melihat detail pesanan, catatan internal CS, dan informasi pelacakan resi.',
    accessibleRoutes: [
      '/dashboard',
      '/pesanan',
      '/cetak-pengiriman',
      '/profil',
    ],
    canEdit: false,
    canDelete: false,
    canExport: false,
  },
};

/**
 * Peta Izin Akses Per Route
 */
export const ROUTE_ACCESS_MAP: Record<string, AdminRole[]> = {
  '/dashboard': ['Admin Utama', 'Operasional', 'Produk', 'Keuangan', 'Support'],
  '/pesanan': ['Admin Utama', 'Operasional', 'Keuangan', 'Support'],
  '/cetak-pengiriman': ['Admin Utama', 'Operasional', 'Support'],
  '/katalog-jas': ['Admin Utama', 'Produk'],
  '/katalog-jas/tambah': ['Admin Utama', 'Produk'],
  '/katalog-jas/edit': ['Admin Utama', 'Produk'],
  '/paket-harga': ['Admin Utama', 'Produk', 'Keuangan'],
  '/paket-harga/tambah': ['Admin Utama', 'Produk'],
  '/paket-harga/edit': ['Admin Utama', 'Produk'],
  '/voucher-promo': ['Admin Utama', 'Produk', 'Keuangan'],
  '/manajemen-admin': ['Admin Utama'],
  '/log-aktivitas': ['Admin Utama', 'Operasional'],
  '/pengaturan': ['Admin Utama'],
  '/profil': ['Admin Utama', 'Operasional', 'Produk', 'Keuangan', 'Support'],
};

export default ROLE_PERMISSIONS;
