import {
  PricingPackageItem,
  PackageStatus,
  PackageTier,
  PackageRuleItem,
  CreatePackagePayload,
  UpdatePackagePayload,
  PACKAGE_TIERS,
} from './package.types';
import { activityController } from '../activity-controller/activity.controller';

const STORAGE_KEY = 'forgepro_packages_v3';

/** Format rupiah untuk tampilan, mis. 59000 -> "Rp59.000". */
export const formatRupiah = (value: number): string =>
  `Rp${Math.round(value).toLocaleString('id-ID')}`;

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
    title: 'Format output digital',
    setting: 'Resolusi Ultra-HD 300 DPI siap unduh & cetak mandiri',
    badge: 'Aktif',
  },
  {
    title: 'Penerapan perubahan',
    setting: 'Hanya untuk pesanan baru setelah disimpan',
    badge: 'Aktif',
  },
];

type PackageListener = () => void;

/**
 * PackageController — Mengelola seluruh data & operasi Paket & Harga di ForgePro.id.
 * Bentuk data mengikuti `SuitPackage` pada aplikasi Flutter.
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PricingPackageItem[];
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((p) => PACKAGE_TIERS.includes(p.tier))
        ) {
          return parsed;
        }
      }
    } catch {
      // Fallback ke data awal
    }
    return [...INITIAL_PACKAGES];
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.packages));
    } catch {
      // Abaikan error kuota penyimpanan
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
    photoCount: number,
    creditAmount: number,
    maxTemplates: number,
    extraBenefits?: string
  ): string[] {
    const baseFeatures = [
      `${photoCount} hasil foto AI resolusi tinggi`,
      `${creditAmount} kredit AI`,
      `Pilihan ${maxTemplates} template jas`,
    ];
    const extras = (extraBenefits || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return [...baseFeatures, ...extras];
  }

  private buildTag(status: PackageStatus, isFeatured: boolean): string {
    if (status === 'Draf') return 'Nonaktif';
    return isFeatured ? 'Paling diminati' : 'Paket aktif';
  }

  /** Hanya satu paket yang boleh direkomendasikan (`is_recommended`). */
  private clearFeaturedExcept(id: string): void {
    this.packages = this.packages.map((pkg) =>
      pkg.id !== id && pkg.isFeatured
        ? {
            ...pkg,
            isFeatured: false,
            tag: this.buildTag(pkg.status, false),
          }
        : pkg
    );
  }

  public getAllPackages(): PricingPackageItem[] {
    return [...this.packages].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getPackageById(id: string): PricingPackageItem | undefined {
    return this.packages.find((pkg) => pkg.id === id);
  }

  /** Tier yang belum punya paket. Aplikasi hanya mengenali tier ini. */
  public getAvailableTiers(): PackageTier[] {
    const used = new Set(this.packages.map((p) => p.tier));
    return PACKAGE_TIERS.filter((t) => !used.has(t));
  }

  public getRules(): PackageRuleItem[] {
    return [...this.rules];
  }

  public createPackage(payload: CreatePackagePayload): PricingPackageItem | null {
    if (this.packages.some((p) => p.tier === payload.tier)) return null;

    const status: PackageStatus = payload.status || 'Draf';
    const isFeatured = Boolean(payload.isFeatured);
    const newPkg: PricingPackageItem = {
      id: `pkg-${payload.tier}`,
      tier: payload.tier,
      name: payload.name.trim() || 'Paket Baru',
      tag: this.buildTag(status, isFeatured),
      status,
      priceValue: payload.priceValue,
      price: formatRupiah(payload.priceValue),
      sku: payload.sku.trim(),
      photoCount: payload.photoCount,
      creditAmount: payload.creditAmount,
      maxTemplates: payload.maxTemplates,
      priceSub: 'referensi · sekali beli',
      description: payload.description.trim(),
      features: this.buildFeaturesList(
        payload.photoCount,
        payload.creditAmount,
        payload.maxTemplates,
        payload.extraBenefits
      ),
      extraBenefits: payload.extraBenefits,
      accessDuration: payload.accessDuration.trim() || '14 hari',
      displayOrder: payload.displayOrder,
      salesShare: '0%',
      isFeatured,
    };

    this.packages = [...this.packages, newPkg];
    if (isFeatured) this.clearFeaturedExcept(newPkg.id);
    this.notify();
    activityController.logActivity({
      source: 'Admin Produk',
      category: 'Paket',
      activity: `Membuat paket harga baru · ${newPkg.name} (${newPkg.price})`,
      result: 'Berhasil',
    });
    return newPkg;
  }

  public updatePackage(id: string, payload: UpdatePackagePayload): PricingPackageItem | null {
    let updatedItem: PricingPackageItem | null = null;

    this.packages = this.packages.map((pkg) => {
      if (pkg.id !== id) return pkg;

      const nextPhotoCount = payload.photoCount ?? pkg.photoCount;
      const nextCredit = payload.creditAmount ?? pkg.creditAmount;
      const nextMaxTemplates = payload.maxTemplates ?? pkg.maxTemplates;
      const nextExtraBenefits = payload.extraBenefits ?? pkg.extraBenefits;
      const nextStatus: PackageStatus = payload.status ?? pkg.status;
      const nextFeatured = payload.isFeatured ?? pkg.isFeatured;
      const nextPrice = payload.priceValue ?? pkg.priceValue;

      updatedItem = {
        ...pkg,
        name: payload.name !== undefined ? payload.name.trim() || pkg.name : pkg.name,
        description: payload.description ?? pkg.description,
        photoCount: nextPhotoCount,
        creditAmount: nextCredit,
        maxTemplates: nextMaxTemplates,
        extraBenefits: nextExtraBenefits,
        features: this.buildFeaturesList(
          nextPhotoCount,
          nextCredit,
          nextMaxTemplates,
          nextExtraBenefits
        ),
        accessDuration: payload.accessDuration ?? pkg.accessDuration,
        displayOrder: payload.displayOrder ?? pkg.displayOrder,
        status: nextStatus,
        isFeatured: nextFeatured,
        tag: this.buildTag(nextStatus, nextFeatured),
        sku: payload.sku !== undefined ? payload.sku.trim() : pkg.sku,
        priceValue: nextPrice,
        price: formatRupiah(nextPrice),
      };
      return updatedItem;
    });

    if (updatedItem) {
      const saved = updatedItem as PricingPackageItem;
      if (saved.isFeatured) this.clearFeaturedExcept(saved.id);
      this.notify();
      activityController.logActivity({
        source: 'Admin Produk',
        category: 'Paket',
        activity: `Memperbarui paket harga · ${saved.name} (Status: ${saved.status}, Harga: ${saved.price})`,
        result: 'Berhasil',
      });
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
