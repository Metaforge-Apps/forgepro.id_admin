/**
 * TypeScript Definitions for Style Controller (Katalog Gaya Jas — ForgePro.id)
 *
 * Disesuaikan dengan model `SuitTemplate` di aplikasi Flutter
 * (forgepro_apps/lib/features/templates/domain/suit_template.dart).
 */

/**
 * Kategori gaya. Harus identik dengan enum `SuitCategory` di aplikasi:
 * bisnis, formal, pernikahan, tuxedo, nusantara, smartCasual, wanita.
 */
export const SUIT_CATEGORIES = [
  'Bisnis',
  'Formal',
  'Pernikahan',
  'Tuxedo',
  'Nusantara',
  'Smart Casual',
  'Wanita',
] as const;

export type SuitCategory = (typeof SUIT_CATEGORIES)[number];

export type SuitCategoryFilter = 'Semua' | SuitCategory;

export type SuitStatus = 'Tayang' | 'Draf';

export type SuitStatusFilter = 'Semua status' | SuitStatus;

export type SuitSortOption = 'Terbaru' | 'Terpopuler' | 'Nama A-Z';

export const SUIT_ASPECT_RATIOS = ['9:16', '3:4', '16:9', '1:1'] as const;
export type SuitAspectRatio = (typeof SUIT_ASPECT_RATIOS)[number];

export interface SuitStyleItem {
  /** ID template yang dipakai aplikasi (mis. `navy-eksekutif`). */
  id: string;
  name: string;
  category: SuitCategory;
  status: SuitStatus;
  stats: string;
  count: number;
  /** Gambar contoh / thumbnail (URL atau data URL). */
  image: string;
  description?: string;
  /** Prompt AI standar untuk template ini (dikirim ke model AI). */
  prompt?: string;
  /** Aspek rasio bawaan / rekomendasi hasil generate AI (mis. 9:16 atau 16:9). */
  aspectRatio?: SuitAspectRatio;
  /** Tampil sebagai "Populer" di aplikasi. */
  isPopular?: boolean;
  /** Tampil sebagai "Baru" di aplikasi. */
  isNew?: boolean;
  tags?: string[];
  updatedAt?: string;
}

export interface CreateSuitStylePayload {
  id?: string;
  name: string;
  category: SuitCategory;
  description?: string;
  prompt?: string;
  aspectRatio?: SuitAspectRatio;
  isPopular?: boolean;
  isNew?: boolean;
  tags?: string[];
  status?: SuitStatus;
  image?: string;
}

export interface UpdateSuitStylePayload {
  name?: string;
  category?: SuitCategory;
  description?: string;
  prompt?: string;
  aspectRatio?: SuitAspectRatio;
  isPopular?: boolean;
  isNew?: boolean;
  tags?: string[];
  status?: SuitStatus;
  image?: string;
}

export interface SuitCategoryTab {
  label: string;
  category: SuitCategoryFilter;
  count: number;
}

export interface SuitStyleFilterParams {
  category?: SuitCategoryFilter;
  status?: SuitStatusFilter;
  searchQuery?: string;
  sortBy?: SuitSortOption;
}

export interface SuitCatalogSummary {
  total: number;
  published: number;
  draft: number;
  lastUpdated: string;
}
