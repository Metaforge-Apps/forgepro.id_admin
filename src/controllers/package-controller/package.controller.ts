import {
  PricingPackageItem,
  PackageStatus,
  PackageRuleItem,
  CreatePackagePayload,
  UpdatePackagePayload,
} from './package.types';

const STORAGE_KEY = 'forgepro_packages_v1';

export const INITIAL_PACKAGES: PricingPackageItem[] = [
  {
    id: 'pkg-esensial',
    name: 'Esensial',
    tag: 'Paket aktif',
    status: 'Tayang',
    price: 'Rp59.000',
    priceRaw: '59.000',
    sku: 'forgepro_esensial',
    photoCount: '4',
    suitChoices: '2 gaya jas',
    priceSub: 'referensi · sekali beli',
    description: 'Untuk kebutuhan foto yang praktis.',
    features: [
      '4 hasil foto AI resolusi tinggi',
      'Pilihan 2 gaya jas',
      'Latar polos profesional',
      'Unduhan digital tanpa watermark',
    ],
    extraBenefits: 'Latar polos profesional\nUnduhan digital tanpa watermark',
    accessDuration: '30 hari',
    displayOrder: '1',
    salesShare: '28%',
    isFeatured: false,
  },
  {
    id: 'pkg-profesional',
    name: 'Profesional',
    tag: 'Paling diminati',
    status: 'Tayang',
    price: 'Rp99.000',
    priceRaw: '99.000',
    sku: 'forgepro_profesional',
    photoCount: '12',
    suitChoices: '4 gaya jas',
    priceSub: 'referensi · sekali beli',
    description: 'Pilihan lengkap untuk karier Anda.',
    features: [
      '12 hasil foto AI resolusi tinggi',
      'Pilihan 4 gaya jas',
      'Variasi latar profesional',
      'Unduhan digital tanpa watermark',
    ],
    extraBenefits: 'Variasi latar profesional\nUnduhan digital tanpa watermark',
    accessDuration: '30 hari',
    displayOrder: '2',
    salesShare: '54%',
    isFeatured: true,
  },
  {
    id: 'pkg-eksklusif',
    name: 'Eksklusif',
    tag: 'Paket aktif',
    status: 'Tayang',
    price: 'Rp169.000',
    priceRaw: '169.000',
    sku: 'forgepro_eksklusif',
    photoCount: '24',
    suitChoices: 'Seluruh gaya jas',
    priceSub: 'referensi · sekali beli',
    description: 'Lebih banyak gaya, lebih fleksibel.',
    features: [
      '24 hasil foto AI resolusi tinggi',
      'Seluruh gaya jas yang tayang',
      'Variasi latar profesional',
      'Prioritas pemrosesan foto',
    ],
    extraBenefits: 'Variasi latar profesional\nPrioritas pemrosesan foto',
    accessDuration: '30 hari',
    displayOrder: '3',
    salesShare: '18%',
    isFeatured: false,
  },
];

export const INITIAL_PACKAGE_RULES: PackageRuleItem[] = [
  {
    title: 'Masa akses unduhan',
    setting: '30 hari sejak foto selesai diproses',
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

type PackageListener = () => void;

/**
 * PackageController — Mengelola seluruh data & operasi Paket & Harga di ForgePro.id
 */
export class PackageController {
  private packages: PricingPackageItem[];
  private rules: PackageRuleItem[];
  private listeners: Set<PackageListener> = new Set();

  constructor() {
    this.packages = this.loadFromStorage();
    this.rules = [...INITIAL_PACKAGE_RULES];
  }

  private loadFromStorage(): PricingPackageItem[] {
    if (typeof window === 'undefined') {
      return [...INITIAL_PACKAGES];
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PricingPackageItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial packages
    }
    return [...INITIAL_PACKAGES];
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.packages));
    } catch {
      // Ignore storage quota errors
    }
  }

  private notify(): void {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: PackageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private buildFeaturesList(
    photoCount: string,
    suitChoices: string,
    extraBenefits?: string
  ): string[] {
    const suitLabel =
      suitChoices === 'Seluruh gaya jas'
        ? 'Seluruh gaya jas yang tayang'
        : `Pilihan ${suitChoices}`;
    const baseFeatures = [
      `${photoCount || '12'} hasil foto AI resolusi tinggi`,
      suitLabel,
    ];
    const extras = (extraBenefits || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return [...baseFeatures, ...extras];
  }

  public getAllPackages(): PricingPackageItem[] {
    return [...this.packages];
  }

  public getPackageById(id: string): PricingPackageItem | undefined {
    return this.packages.find((pkg) => pkg.id === id);
  }

  public getRules(): PackageRuleItem[] {
    return [...this.rules];
  }

  public createPackage(payload: CreatePackagePayload): PricingPackageItem {
    const cleanPriceRaw = payload.priceRaw.replace(/^Rp/i, '').trim() || '129.000';
    const status: PackageStatus = payload.status || 'Draf';
    const newPkg: PricingPackageItem = {
      id: `pkg-${Date.now()}`,
      name: payload.name.trim() || 'Paket Baru',
      tag: status === 'Tayang' ? 'Paket aktif' : 'Draf',
      status,
      price: `Rp${cleanPriceRaw}`,
      priceRaw: cleanPriceRaw,
      sku:
        payload.sku.trim() ||
        `forgepro_${(payload.name || 'paket').toLowerCase().replace(/\s+/g, '_')}`,
      photoCount: payload.photoCount || '16',
      suitChoices: payload.suitChoices || '5 gaya jas',
      priceSub: 'referensi · sekali beli',
      description:
        payload.description.trim() ||
        'Pilihan foto lebih beragam untuk memperbarui profil karier.',
      features: this.buildFeaturesList(
        payload.photoCount,
        payload.suitChoices,
        payload.extraBenefits
      ),
      extraBenefits: payload.extraBenefits,
      accessDuration: payload.accessDuration || '30 hari',
      displayOrder: payload.displayOrder || String(this.packages.length + 1),
      salesShare: '0%',
      isFeatured: false,
    };

    this.packages = [...this.packages, newPkg];
    this.notify();
    return newPkg;
  }

  public updatePackage(
    id: string,
    payload: UpdatePackagePayload
  ): PricingPackageItem | null {
    let updatedItem: PricingPackageItem | null = null;

    this.packages = this.packages.map((pkg) => {
      if (pkg.id !== id) return pkg;

      const nextName =
        payload.name !== undefined ? payload.name.trim() || pkg.name : pkg.name;
      const nextPriceRaw =
        payload.priceRaw !== undefined
          ? payload.priceRaw.replace(/^Rp/i, '').trim() || pkg.priceRaw
          : pkg.priceRaw;
      const nextPhotoCount = payload.photoCount ?? pkg.photoCount;
      const nextSuitChoices = payload.suitChoices ?? pkg.suitChoices;
      const nextExtraBenefits = payload.extraBenefits ?? pkg.extraBenefits;
      const nextStatus: PackageStatus = payload.status ?? pkg.status;

      updatedItem = {
        ...pkg,
        name: nextName,
        description: payload.description ?? pkg.description,
        photoCount: nextPhotoCount,
        suitChoices: nextSuitChoices,
        extraBenefits: nextExtraBenefits,
        features: this.buildFeaturesList(
          nextPhotoCount,
          nextSuitChoices,
          nextExtraBenefits
        ),
        accessDuration: payload.accessDuration ?? pkg.accessDuration,
        displayOrder: payload.displayOrder ?? pkg.displayOrder,
        status: nextStatus,
        tag:
          nextStatus === 'Draf'
            ? 'Nonaktif'
            : pkg.isFeatured
            ? 'Paling diminati'
            : 'Paket aktif',
        sku: payload.sku ?? pkg.sku,
        priceRaw: nextPriceRaw,
        price: `Rp${nextPriceRaw}`,
      };
      return updatedItem;
    });

    if (updatedItem) {
      this.notify();
    }
    return updatedItem;
  }

  public deactivatePackage(id: string): PricingPackageItem | null {
    return this.updatePackage(id, { status: 'Draf' });
  }

  public togglePackageStatus(id: string): PricingPackageItem | null {
    const target = this.getPackageById(id);
    if (!target) return null;
    const nextStatus: PackageStatus = target.status === 'Tayang' ? 'Draf' : 'Tayang';
    return this.updatePackage(id, { status: nextStatus });
  }

  public resetPackages(): PricingPackageItem[] {
    this.packages = [...INITIAL_PACKAGES];
    this.notify();
    return this.getAllPackages();
  }

  public getStatusBadgeStyle(status: PackageStatus | string): string {
    if (status === 'Tayang') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
}

export const packageController = new PackageController();
export default packageController;
