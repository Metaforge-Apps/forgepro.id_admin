/**
 * TypeScript Definitions for Package Controller (Paket & Harga — ForgePro.id)
 *
 * Disesuaikan dengan model `SuitPackage` di aplikasi Flutter
 * (forgepro_apps/lib/features/generation/domain/models.dart).
 */

export type PackageStatus = 'Tayang' | 'Draf';

/** Tier paket. Harus identik dengan enum `SuitPackageTier` di aplikasi. */
export const PACKAGE_TIERS = ['esensial', 'profesional', 'eksklusif'] as const;

export type PackageTier = (typeof PACKAGE_TIERS)[number];

export const PACKAGE_TIER_LABEL: Record<PackageTier, string> = {
  esensial: 'Esensial',
  profesional: 'Profesional',
  eksklusif: 'Eksklusif',
};

export interface PricingPackageItem {
  id: string;
  /** Tier yang dikenali aplikasi (satu paket per tier). */
  tier: PackageTier;
  name: string;
  tag: string;
  status: PackageStatus;
  /** Harga referensi dalam rupiah (angka). */
  priceValue: number;
  /** Harga untuk tampilan, mis. "Rp59.000". */
  price: string;
  /** Google Play product ID (`product_id` di aplikasi). */
  sku: string;
  /** Jumlah hasil foto (`photo_count`). */
  photoCount: number;
  /** Kuota kredit AI (`creditAmount`). */
  creditAmount: number;
  /** Jumlah template jas yang boleh dipilih (`max_templates`). */
  maxTemplates: number;
  /** Biaya kredit per render foto (default 5 kredit) */
  creditPerPhoto: number;
  /** Apakah pelanggan diizinkan menyesuaikan custom prompt */
  canEditPrompt: boolean;
  /** Durasi masa unduh file arsip foto (hari) */
  downloadDurationDays: number;
  priceSub: string;
  description: string;
  features: string[];
  extraBenefits?: string;
  accessDuration: string;
  displayOrder: number;
  salesShare: string;
  /** Ditandai "Direkomendasikan" di aplikasi (`is_recommended`). */
  isFeatured: boolean;
}

export interface CreatePackagePayload {
  tier: PackageTier;
  name: string;
  description?: string;
  photoCount: number;
  creditAmount: number;
  maxTemplates: number;
  creditPerPhoto?: number;
  canEditPrompt?: boolean;
  downloadDurationDays?: number;
  extraBenefits?: string;
  accessDuration?: string;
  displayOrder: number;
  status: PackageStatus;
  sku: string;
  priceValue: number;
  isFeatured?: boolean;
}

export interface UpdatePackagePayload {
  name?: string;
  description?: string;
  photoCount?: number;
  creditAmount?: number;
  maxTemplates?: number;
  creditPerPhoto?: number;
  canEditPrompt?: boolean;
  downloadDurationDays?: number;
  extraBenefits?: string;
  accessDuration?: string;
  displayOrder?: number;
  status?: PackageStatus;
  sku?: string;
  priceValue?: number;
  isFeatured?: boolean;
}

export function buildPackageDescription(pkg: {
  photoCount: number;
  creditAmount: number;
  creditPerPhoto?: number;
  maxTemplates: number;
  canEditPrompt?: boolean;
}): string {
  const perPhoto = pkg.creditPerPhoto || 5;
  const renderCap = Math.floor(pkg.creditAmount / perPhoto);
  const promptPart = pkg.canEditPrompt ? ' · Bebas kustom prompt' : '';
  const templatePart = pkg.maxTemplates > 1 ? `${pkg.maxTemplates} gaya jas` : '1 gaya jas';
  return `${pkg.photoCount} foto hasil final (${pkg.creditAmount} kredit AI · hingga ${renderCap}x render · ${templatePart}${promptPart}).`;
}

export function buildPackageFeatures(pkg: {
  photoCount: number;
  creditAmount: number;
  creditPerPhoto?: number;
  maxTemplates: number;
  canEditPrompt?: boolean;
  downloadDurationDays?: number;
}): string[] {
  const perPhoto = pkg.creditPerPhoto || 5;
  return [
    `${pkg.photoCount} hasil foto AI resolusi tinggi siap cetak`,
    `${pkg.creditAmount} kuota kredit AI (${perPhoto} kredit/render, termasuk render ulang)`,
    `Pilihan ${pkg.maxTemplates} gaya jas pilihan dari katalog`,
    pkg.canEditPrompt ? 'Dukungan prompt kustom profesional' : 'Prompt standar studio foto',
    `Masa unduh ${pkg.downloadDurationDays || 14} hari (arsip aman)`,
  ];
}

export interface PackageRuleItem {
  title: string;
  setting: string;
  actionText?: string;
  badge?: string;
}
