/**
 * TypeScript Definitions for Package Controller (Paket & Harga — ForgePro.id)
 */

export type PackageStatus = 'Tayang' | 'Draf';

export type SuitChoiceOption =
  | '2 gaya jas'
  | '4 gaya jas'
  | '5 gaya jas'
  | 'Seluruh gaya jas';

export interface PricingPackageItem {
  id: string;
  name: string;
  tag: string;
  status: PackageStatus;
  price: string;
  priceRaw: string;
  sku: string;
  photoCount: string;
  suitChoices: string;
  priceSub: string;
  description: string;
  features: string[];
  extraBenefits?: string;
  accessDuration: string;
  displayOrder: string;
  salesShare: string;
  isFeatured: boolean;
}

export interface CreatePackagePayload {
  name: string;
  description: string;
  photoCount: string;
  suitChoices: string;
  extraBenefits: string;
  accessDuration: string;
  displayOrder: string;
  status: PackageStatus;
  sku: string;
  priceRaw: string;
}

export interface UpdatePackagePayload {
  name?: string;
  description?: string;
  photoCount?: string;
  suitChoices?: string;
  extraBenefits?: string;
  accessDuration?: string;
  displayOrder?: string;
  status?: PackageStatus;
  sku?: string;
  priceRaw?: string;
}

export interface PackageRuleItem {
  title: string;
  setting: string;
  actionText?: string;
  badge?: string;
}
