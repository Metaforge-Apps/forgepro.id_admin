/**
 * TypeScript Definitions for Style Controller (Katalog Gaya Jas — ForgePro.id)
 */

export type SuitCategory = 'Bisnis' | 'Formal' | 'Seremonial';

export type SuitCategoryFilter = 'Semua' | SuitCategory;

export type SuitStatus = 'Tayang' | 'Draf';

export type SuitStatusFilter = 'Semua status' | SuitStatus;

export type SuitSortOption = 'Terbaru' | 'Terpopuler' | 'Nama A-Z';

export interface SuitStyleItem {
  id: string;
  name: string;
  category: SuitCategory;
  status: SuitStatus;
  stats: string;
  count: number;
  image: string;
  description?: string;
  updatedAt?: string;
}

export interface CreateSuitStylePayload {
  name: string;
  category: SuitCategory;
  description?: string;
  status?: SuitStatus;
  image?: string;
}

export interface UpdateSuitStylePayload {
  name?: string;
  category?: SuitCategory;
  description?: string;
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
