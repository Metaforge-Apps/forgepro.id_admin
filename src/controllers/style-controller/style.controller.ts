import {
  SuitStyleItem,
  SuitCategory,
  SuitCategoryFilter,
  SuitStatus,
  SuitCategoryTab,
  SuitStyleFilterParams,
  SuitCatalogSummary,
  CreateSuitStylePayload,
  UpdateSuitStylePayload,
} from './style.types';

const STORAGE_KEY = 'forgepro_suit_styles_v1';

export const INITIAL_SUIT_STYLES: SuitStyleItem[] = [
  {
    id: 'suit-1',
    name: 'Jas Navy Klasik',
    category: 'Bisnis',
    status: 'Tayang',
    stats: '428 foto dibuat',
    count: 428,
    image: '/images/suits/suit-navy-klasik.jpg',
    description:
      'Jas navy berpotongan klasik dengan kemeja putih dan dasi netral. Pencahayaan lembut serta latar studio hangat untuk kesan profesional.',
    updatedAt: '19 Okt 2026, 14:20 WIB',
  },
  {
    id: 'suit-2',
    name: 'Jas Hitam Formal',
    category: 'Formal',
    status: 'Tayang',
    stats: '312 foto dibuat',
    count: 312,
    image: '/images/suits/suit-hitam-formal.jpg',
    description:
      'Potongan jas hitam formal berstruktur tegas dengan kontras kemeja putih bersih untuk dokumen resmi dan profil eksekutif.',
    updatedAt: '19 Okt 2026, 13:45 WIB',
  },
  {
    id: 'suit-3',
    name: 'Blazer Krem Modern',
    category: 'Bisnis',
    status: 'Tayang',
    stats: '286 foto dibuat',
    count: 286,
    image: '/images/suits/suit-blazer-krem.jpg',
    description:
      'Blazer krem bertekstur ringan dengan pencahayaan natural hangat untuk tampilan profesional modern.',
    updatedAt: '18 Okt 2026, 19:10 WIB',
  },
  {
    id: 'suit-4',
    name: 'Jas Abu Profesional',
    category: 'Bisnis',
    status: 'Tayang',
    stats: '194 foto dibuat',
    count: 194,
    image: '/images/suits/suit-abu-profesional.jpg',
    description:
      'Jas abu-abu charcoal dengan kerah klasik dan pencahayaan studio seimbang untuk profil korporat.',
    updatedAt: '18 Okt 2026, 16:30 WIB',
  },
  {
    id: 'suit-5',
    name: 'Tuksedo Malam',
    category: 'Seremonial',
    status: 'Tayang',
    stats: '128 foto dibuat',
    count: 128,
    image: '/images/suits/suit-tuksedo-malam.jpg',
    description:
      'Tuksedo malam dengan lapel satin dan dasi kupu-kupu untuk acara gala maupun potret seremonial.',
    updatedAt: '17 Okt 2026, 11:20 WIB',
  },
  {
    id: 'suit-6',
    name: 'Blazer Navy Elegan',
    category: 'Formal',
    status: 'Draf',
    stats: 'Belum dipublikasikan',
    count: 0,
    image: '/images/suits/suit-blazer-hijab.jpg',
    description:
      'Blazer navy elegan dengan paduan hijab profesional yang rapi dan pencahayaan lembut.',
    updatedAt: '17 Okt 2026, 09:15 WIB',
  },
];

type StyleListener = () => void;

/**
 * StyleController — Mengelola seluruh data & operasi Katalog Gaya Jas di ForgePro.id
 */
export class StyleController {
  private styles: SuitStyleItem[];
  private listeners: Set<StyleListener> = new Set();

  constructor() {
    this.styles = this.loadFromStorage();
  }

  private loadFromStorage(): SuitStyleItem[] {
    if (typeof window === 'undefined') {
      return [...INITIAL_SUIT_STYLES];
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SuitStyleItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial data
    }
    return [...INITIAL_SUIT_STYLES];
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.styles));
    } catch {
      // Ignore storage quota errors
    }
  }

  private notify(): void {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: StyleListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAllStyles(): SuitStyleItem[] {
    return [...this.styles];
  }

  public getStyleById(id: string): SuitStyleItem | undefined {
    return this.styles.find((item) => item.id === id);
  }

  public getFilteredStyles(params: SuitStyleFilterParams = {}): SuitStyleItem[] {
    const {
      category = 'Semua',
      status = 'Semua status',
      searchQuery = '',
      sortBy = 'Terbaru',
    } = params;

    const filtered = this.styles.filter((item) => {
      if (category !== 'Semua' && item.category !== category) {
        return false;
      }
      if (status !== 'Semua status' && item.status !== status) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchName && !matchCategory) return false;
      }
      return true;
    });

    if (sortBy === 'Terpopuler') {
      return [...filtered].sort((a, b) => (b.count || 0) - (a.count || 0));
    }
    if (sortBy === 'Nama A-Z') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }

  public getCategoryTabs(): SuitCategoryTab[] {
    const allCount = this.styles.length;
    const bisnisCount = this.styles.filter((s) => s.category === 'Bisnis').length;
    const formalCount = this.styles.filter((s) => s.category === 'Formal').length;
    const seremonialCount = this.styles.filter((s) => s.category === 'Seremonial').length;

    return [
      { label: `Semua gaya (${allCount})`, category: 'Semua', count: allCount },
      { label: `Bisnis (${bisnisCount})`, category: 'Bisnis', count: bisnisCount },
      { label: `Formal (${formalCount})`, category: 'Formal', count: formalCount },
      { label: `Seremonial (${seremonialCount})`, category: 'Seremonial', count: seremonialCount },
    ];
  }

  public getSummary(): SuitCatalogSummary {
    const total = this.styles.length;
    const published = this.styles.filter((s) => s.status === 'Tayang').length;
    const draft = this.styles.filter((s) => s.status === 'Draf').length;

    return {
      total,
      published,
      draft,
      lastUpdated: '19 Okt 2026, 14:20 WIB',
    };
  }

  public createStyle(payload: CreateSuitStylePayload): SuitStyleItem {
    const status: SuitStatus = payload.status || 'Draf';
    const category: SuitCategory = payload.category || 'Bisnis';
    const newItem: SuitStyleItem = {
      id: `suit-${Date.now()}`,
      name: payload.name.trim(),
      category,
      status,
      stats: status === 'Tayang' ? '0 foto dibuat' : 'Belum dipublikasikan',
      count: 0,
      image: payload.image || '/images/suits/suit-navy-klasik.jpg',
      description:
        payload.description?.trim() ||
        'Gaya jas profesional ForgePro.id dengan pencahayaan studio seimbang.',
      updatedAt: 'Baru saja',
    };

    this.styles = [newItem, ...this.styles];
    this.notify();
    return newItem;
  }

  public updateStyle(id: string, payload: UpdateSuitStylePayload): SuitStyleItem | null {
    let updatedItem: SuitStyleItem | null = null;

    this.styles = this.styles.map((item) => {
      if (item.id !== id) return item;

      const nextStatus: SuitStatus = payload.status ?? item.status;
      const nextStats =
        nextStatus === 'Tayang'
          ? item.count > 0
            ? `${item.count} foto dibuat`
            : '0 foto dibuat'
          : 'Belum dipublikasikan';

      updatedItem = {
        ...item,
        name: payload.name !== undefined ? payload.name.trim() || item.name : item.name,
        category: payload.category ?? item.category,
        description: payload.description ?? item.description,
        status: nextStatus,
        stats: nextStats,
        image: payload.image ?? item.image,
        updatedAt: 'Baru saja',
      };
      return updatedItem;
    });

    if (updatedItem) {
      this.notify();
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
    this.styles = this.styles.filter((item) => item.id !== id);
    const deleted = this.styles.length < initialLen;
    if (deleted) {
      this.notify();
    }
    return deleted;
  }

  public resetStyles(): SuitStyleItem[] {
    this.styles = [...INITIAL_SUIT_STYLES];
    this.notify();
    return this.getAllStyles();
  }

  public getStatusBadgeStyle(status: SuitStatus | string): string {
    if (status === 'Tayang') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
}

export const styleController = new StyleController();
export default styleController;
