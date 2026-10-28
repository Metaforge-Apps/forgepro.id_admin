import { NavigationSection } from '../types';

/**
 * Sidebar Navigation Structure
 * Sesuai dengan referensi desain Figma ForgePro.id
 */

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: 'OPERASIONAL',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        exact: true,
      },
      {
        id: 'pesanan-transaksi',
        label: 'Pesanan & Transaksi',
        path: '/pesanan',
        icon: 'History',
      },
      {
        id: 'cetak-pengiriman',
        label: 'Cetak Fisik & Pengiriman',
        path: '/cetak-pengiriman',
        icon: 'Activity',
      },
    ],
  },
  {
    title: 'KATALOG & PRODUK',
    items: [
      {
        id: 'katalog-jas',
        label: 'Katalog Gaya Jas',
        path: '/katalog-jas',
        icon: 'Layers',
      },
      {
        id: 'paket-harga',
        label: 'Paket & Harga',
        path: '/paket-harga',
        icon: 'ListOrdered',
      },
      {
        id: 'voucher-promo',
        label: 'Voucher & Promo',
        path: '/voucher-promo',
        icon: 'Percent',
      },
    ],
  },
  {
    title: 'SISTEM',
    items: [
      {
        id: 'manajemen-admin',
        label: 'Manajemen Admin',
        path: '/manajemen-admin',
        icon: 'Users',
      },
      {
        id: 'log-aktivitas',
        label: 'Log Aktivitas & Webhook',
        path: '/log-aktivitas',
        icon: 'FileText',
      },
      {
        id: 'pengaturan',
        label: 'Pengaturan',
        path: '/pengaturan',
        icon: 'Settings',
      },
    ],
  },
];

export default NAVIGATION_SECTIONS;
