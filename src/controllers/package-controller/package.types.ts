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
  description: string;
  photoCount: number;
  creditAmount: number;
  maxTemplates: number;
  extraBenefits: string;
  accessDuration: string;
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
  extraBenefits?: string;
  accessDuration?: string;
  displayOrder?: number;
  status?: PackageStatus;
  sku?: string;
  priceValue?: number;
  isFeatured?: boolean;
}

export interface PackageRuleItem {
  title: string;
  setting: string;
  actionText?: string;
  badge?: string;
}
