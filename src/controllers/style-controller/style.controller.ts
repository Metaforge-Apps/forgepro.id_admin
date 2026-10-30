import {
  SuitStyleItem,
  SuitCategory,
  SuitStatus,
  SuitCategoryTab,
  SuitStyleFilterParams,
  SuitCatalogSummary,
  CreateSuitStylePayload,
  UpdateSuitStylePayload,
  SUIT_CATEGORIES,
} from './style.types';
import { INITIAL_SUIT_STYLES } from './style.seed';
import { mockDb } from '../../mocks/db';
import { getStatusBadgeClasses } from '../../config/statusColors';

export { INITIAL_SUIT_STYLES };

const META_STORAGE_KEY = 'forgepro_suit_styles_meta_v1';
const DEFAULT_IMAGE = '/images/templates/men/navy-eksekutif.jpg';

type StyleListener = () => void;

const formatNow = (): string =>
  `${new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })} WIB`;

/** Ubah nama menjadi ID template gaya aplikasi, mis. "Navy Eksekutif" -> "navy-eksekutif". */
export const slugifyStyleId = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildStats = (status: SuitStatus, count: number): string =>
  status === 'Tayang' ? `${count} foto dibuat` : 'Belum dipublikasikan';

/**
 * StyleController — Mengelola seluruh data & operasi Katalog Gaya Jas di ForgePro.id.
 * Bentuk data mengikuti `SuitTemplate` pada aplikasi Flutter.
 * Seluruh data dibaca/ditulis lewat basis data mock terpusat (src/mocks/db.ts);
 * jumlah "foto dibuat" dihitung otomatis dari pesanan.
 */
export class StyleController {
  private lastUpdated: string;

  constructor() {
    this.lastUpdated = this.loadLastUpdated();
  }

  private loadLastUpdated(): string {
    if (typeof window === 'undefined') return 'Data bawaan aplikasi';
    try {
      return localStorage.getItem(META_STORAGE_KEY) || 'Data bawaan aplikasi';
    } catch {
      return 'Data bawaan aplikasi';
    }
  }

  private saveLastUpdated(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(META_STORAGE_KEY, this.lastUpdated);
    } catch {
      // Abaikan error kuota penyimpanan
    }
  }

  /** Daftar gaya selalu dibaca dari basis data terpusat. */
  private get styles(): SuitStyleItem[] {
    return mockDb.getState().styles;
  }

  private set styles(next: SuitStyleItem[]) {
    mockDb.updateState((prev) => ({ ...prev, styles: next }));
  }

  private touch(): void {
    this.lastUpdated = formatNow();
    this.saveLastUpdated();
  }

  public subscribe(listener: StyleListener): () => void {
    return mockDb.subscribe(listener);
  }

  public getAllStyles(): SuitStyleItem[] {
    return [...this.styles];
  }

  public getStyleById(id: string): SuitStyleItem | undefined {
    return this.styles.find((item) => item.id === id);
  }

  public isIdTaken(id: string): boolean {
    return this.styles.some((item) => item.id === id);
  }

  public getFilteredStyles(params: SuitStyleFilterParams = {}): SuitStyleItem[] {
    const {
      category = 'Semua',
      status = 'Semua status',
      searchQuery = '',
      sortBy = 'Terbaru',
    } = params;

    const q = searchQuery.trim().toLowerCase();
    const filtered = this.styles.filter((item) => {
      if (category !== 'Semua' && item.category !== category) return false;
      if (status !== 'Semua status' && item.status !== status) return false;
      if (q !== '') {
        const matchName = item.name.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchTag = (item.tags ?? []).some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchCategory && !matchTag) return false;
      }
      return true;
    });

    if (sortBy === 'Terpopuler') {
      return [...filtered].sort(
        (a, b) =>
          Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular)) ||
          (b.count || 0) - (a.count || 0)
      );
    }
    if (sortBy === 'Nama A-Z') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }

  public getCategoryTabs(): SuitCategoryTab[] {
    const allCount = this.styles.length;
    const tabs: SuitCategoryTab[] = [
      { label: `Semua gaya (${allCount})`, category: 'Semua', count: allCount },
    ];
    for (const cat of SUIT_CATEGORIES) {
      const count = this.styles.filter((s) => s.category === cat).length;
      tabs.push({ label: `${cat} (${count})`, category: cat, count });
    }
    return tabs;
  }

  public getSummary(): SuitCatalogSummary {
    const total = this.styles.length;
    const published = this.styles.filter((s) => s.status === 'Tayang').length;
    const draft = this.styles.filter((s) => s.status === 'Draf').length;
    return { total, published, draft, lastUpdated: this.lastUpdated };
  }

  public createStyle(payload: CreateSuitStylePayload): SuitStyleItem {
    const status: SuitStatus = payload.status || 'Draf';
    const category: SuitCategory = payload.category || 'Bisnis';

    const baseId = slugifyStyleId(payload.id || payload.name) || `gaya-${Date.now()}`;
    let id = baseId;
    let suffix = 2;
    while (this.isIdTaken(id)) {
      id = `${baseId}-${suffix++}`;
    }

    const newItem: SuitStyleItem = {
      id,
      name: payload.name.trim(),
      category,
      status,
      stats: buildStats(status, 0),
      count: 0,
      image: payload.image || DEFAULT_IMAGE,
      description:
        payload.description?.trim() ||
        'Potret jas profesional AI dengan pencahayaan studio seimbang.',
      prompt: payload.prompt?.trim() || '',
      aspectRatio: payload.aspectRatio || (category === 'Wanita' ? '9:16' : '3:4'),
      isPopular: Boolean(payload.isPopular),
      isNew: Boolean(payload.isNew),
      tags: (payload.tags ?? []).map((t) => t.trim()).filter(Boolean),
      updatedAt: formatNow(),
    };

    this.touch();
    this.styles = [newItem, ...this.styles];
    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Katalog',
      activity: `Menambahkan gaya baru · ${newItem.name}`,
      result: 'Berhasil',
      targetId: newItem.id,
    });
    return newItem;
  }

  public updateStyle(id: string, payload: UpdateSuitStylePayload): SuitStyleItem | null {
    let updatedItem: SuitStyleItem | null = null;
    let previousItem: SuitStyleItem | null = null;

    const nextList = this.styles.map((item) => {
      if (item.id !== id) return item;
      previousItem = item;

      const nextStatus: SuitStatus = payload.status ?? item.status;
      updatedItem = {
        ...item,
        name: payload.name !== undefined ? payload.name.trim() || item.name : item.name,
        category: payload.category ?? item.category,
        description: payload.description ?? item.description,
        prompt: payload.prompt !== undefined ? payload.prompt.trim() : item.prompt,
        aspectRatio: payload.aspectRatio ?? item.aspectRatio,
        isPopular: payload.isPopular ?? item.isPopular,
        isNew: payload.isNew ?? item.isNew,
        tags:
          payload.tags !== undefined
            ? payload.tags.map((t) => t.trim()).filter(Boolean)
            : item.tags,
        status: nextStatus,
        stats: buildStats(nextStatus, item.count),
        image: payload.image ?? item.image,
        updatedAt: formatNow(),
      };
      return updatedItem;
    });

    if (updatedItem) {
      this.touch();
      this.styles = nextList;
      const saved = updatedItem as SuitStyleItem;
      const before = previousItem as SuitStyleItem | null;
      mockDb.appendActivityLog({
        source: 'Admin Utama',
        category: 'Katalog',
        activity: `Memperbarui gaya · ${saved.name}`,
        result: 'Berhasil',
        targetId: saved.id,
        beforeData: before
          ? { name: before.name, category: before.category, status: before.status }
          : undefined,
        afterData: { name: saved.name, category: saved.category, status: saved.status },
      });
    }
    return updatedItem;
  }

  public toggleStyleStatus(id: string): SuitStyleItem | null {
    const target = this.getStyleById(id);
    if (!target) return null;
    const nextStatus: SuitStatus = target.status === 'Tayang' ? 'Draf' : 'Tayang';
    return this.updateStyle(id, { status: nextStatus });
  }

  public deleteStyle(id: string): boolean {
    const initialLen = this.styles.length;
    const next = this.styles.filter((item) => item.id !== id);
    const deleted = next.length < initialLen;
    if (deleted) {
      this.touch();
      this.styles = next;
    }
    return deleted;
  }

  public resetStyles(): SuitStyleItem[] {
    this.lastUpdated = 'Data bawaan aplikasi';
    this.saveLastUpdated();
    this.styles = INITIAL_SUIT_STYLES.map((s) => ({ ...s, tags: [...(s.tags ?? [])] }));
    return this.getAllStyles();
  }

  public getStatusBadgeStyle(status: SuitStatus | string): string {
    return getStatusBadgeClasses(status);
  }
}

export const styleController = new StyleController();
export default styleController;
