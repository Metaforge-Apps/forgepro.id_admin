import type { PricingPackageItem, PackageRuleItem } from './package.types';

/**
 * Data awal paket. Disalin dari `suitPackages` di aplikasi Flutter
 * (forgepro_apps/lib/features/generation/domain/models.dart).
 * Default user baru / paket dasar adalah 100 kredit AI.
 */
export const INITIAL_PACKAGES: PricingPackageItem[] = [
  {
    id: 'pkg-esensial',
    tier: 'esensial',
    name: 'Esensial',
    tag: 'Paket aktif',
    status: 'Tayang',
    priceValue: 59000,
    price: 'Rp59.000',
    sku: 'forgepro_esensial',
    photoCount: 12,
    creditAmount: 100,
    maxTemplates: 1,
    priceSub: 'referensi · sekali beli',
    description: '100 Kredit AI (hingga 50 foto · 1 template jas).',
    features: [
      '12 hasil foto AI resolusi tinggi',
      '100 kredit AI bawaan',
      'Pilihan 1 template jas',
    ],
    extraBenefits: '',
    accessDuration: '14 hari',
    displayOrder: 1,
    salesShare: '28%',
    isFeatured: false,
  },
  {
    id: 'pkg-profesional',
    tier: 'profesional',
    name: 'Profesional',
    tag: 'Paling diminati',
    status: 'Tayang',
    priceValue: 99000,
    price: 'Rp99.000',
    sku: 'forgepro_profesional',
    photoCount: 24,
    creditAmount: 100,
    maxTemplates: 1,
    priceSub: 'referensi · sekali beli',
    description: '100 Kredit AI (hingga 50 foto · bebas ganti template & prompt).',
    features: [
      '24 hasil foto AI resolusi tinggi',
      '100 kredit AI',
      'Pilihan 1 template jas',
    ],
    extraBenefits: '',
    accessDuration: '14 hari',
    displayOrder: 2,
    salesShare: '54%',
    isFeatured: true,
  },
  {
    id: 'pkg-eksklusif',
    tier: 'eksklusif',
    name: 'Eksklusif',
    tag: 'Paket aktif',
    status: 'Tayang',
    priceValue: 169000,
    price: 'Rp169.000',
    sku: 'forgepro_eksklusif',
    photoCount: 48,
    creditAmount: 200,
    maxTemplates: 3,
    priceSub: 'referensi · sekali beli',
    description: '200 Kredit AI (hingga 100 foto · eksplorasi 3 gaya jas).',
    features: [
      '48 hasil foto AI resolusi tinggi',
      '200 kredit AI',
      'Pilihan 3 template jas',
    ],
    extraBenefits: '',
    accessDuration: '14 hari',
    displayOrder: 3,
    salesShare: '18%',
    isFeatured: false,
  },
];

export const INITIAL_PACKAGE_RULES: PackageRuleItem[] = [
  {
    title: 'Masa akses unduhan',
    setting: '14 hari sejak foto selesai diproses',
    actionText: 'Ubah →',
  },
  {
    title: 'Cetak fisik & pengiriman',
    setting: 'Tambahan opsional; biaya cetak dan kirim terpisah',
    actionText: 'Kelola →',
  },
  {
    title: 'Penerapan perubahan',
    setting: 'Hanya untuk pesanan baru setelah disimpan',
    badge: 'Aktif',
  },
];
