import {
  PricingPackageItem,
  PackageStatus,
  PackageTier,
  PackageRuleItem,
  CreatePackagePayload,
  UpdatePackagePayload,
  PACKAGE_TIERS,
} from './package.types';
import { INITIAL_PACKAGES, INITIAL_PACKAGE_RULES } from './package.seed';
import { mockDb } from '../../mocks/db';
import { getStatusBadgeClasses } from '../../config/statusColors';
import { formatRupiah as formatRupiahCentral } from '../../utils/formatters';

export { INITIAL_PACKAGES, INITIAL_PACKAGE_RULES };

/** Format rupiah untuk tampilan, mis. 59000 -> "Rp59.000". */
export const formatRupiah = (value: number): string => formatRupiahCentral(value);

type PackageListener = () => void;

/**
 * PackageController — Mengelola seluruh data & operasi Paket & Harga di ForgePro.id.
 * Bentuk data mengikuti `SuitPackage` pada aplikasi Flutter.
 * Seluruh data dibaca/ditulis lewat basis data mock terpusat (src/mocks/db.ts).
 */
export class PackageController {
  private rules: PackageRuleItem[];

  constructor() {
    this.rules = [...INITIAL_PACKAGE_RULES];
  }

  /** Daftar paket selalu dibaca dari basis data terpusat. */
  private get packages(): PricingPackageItem[] {
    return mockDb.getState().packages;
  }

  private set packages(next: PricingPackageItem[]) {
    mockDb.updateState((prev) => ({ ...prev, packages: next }), {
      recalculateDerived: false,
    });
  }

  public subscribe(listener: PackageListener): () => void {
    return mockDb.subscribe(listener);
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

  public getPackageByTier(tier: PackageTier): PricingPackageItem | undefined {
    return this.packages.find((pkg) => pkg.tier === tier);
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
    const photoCount = payload.photoCount;
    const creditAmount = payload.creditAmount;
    const maxTemplates = payload.maxTemplates;
    const creditPerPhoto = payload.creditPerPhoto || 5;
    const canEditPrompt = Boolean(payload.canEditPrompt ?? (payload.tier !== 'esensial'));
    const downloadDurationDays = payload.downloadDurationDays || 14;

    const newPkg: PricingPackageItem = {
      id: `pkg-${payload.tier}`,
      tier: payload.tier,
      name: payload.name.trim() || 'Paket Baru',
      tag: this.buildTag(status, isFeatured),
      status,
      priceValue: payload.priceValue,
      price: formatRupiah(payload.priceValue),
      sku: payload.sku.trim(),
      photoCount,
      creditAmount,
      maxTemplates,
      creditPerPhoto,
      canEditPrompt,
      downloadDurationDays,
      priceSub: 'referensi · sekali beli',
      description: (payload.description || '').trim() || `${photoCount} foto (${creditAmount} kredit)`,
      features: this.buildFeaturesList(
        photoCount,
        creditAmount,
        maxTemplates,
        payload.extraBenefits
      ),
      extraBenefits: payload.extraBenefits,
      accessDuration: (payload.accessDuration || `${downloadDurationDays} hari`).trim(),
      displayOrder: payload.displayOrder,
      salesShare: '0%',
      isFeatured,
    };

    this.packages = [...this.packages, newPkg];
    if (isFeatured) this.clearFeaturedExcept(newPkg.id);
    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Katalog',
      activity: `Menambahkan paket · ${newPkg.name} (${newPkg.sku})`,
      result: 'Berhasil',
      targetId: newPkg.id,
    });
    return newPkg;
  }

  public updatePackage(id: string, payload: UpdatePackagePayload): PricingPackageItem | null {
    let updatedItem: PricingPackageItem | null = null;
    let previousItem: PricingPackageItem | null = null;

    this.packages = this.packages.map((pkg) => {
      if (pkg.id !== id) return pkg;
      previousItem = pkg;

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
      const before = previousItem as PricingPackageItem | null;
      if (saved.isFeatured) this.clearFeaturedExcept(saved.id);
      mockDb.appendActivityLog({
        source: 'Admin Utama',
        category: 'Katalog',
        activity: `Memperbarui paket · ${saved.name} (${saved.sku})`,
        result: 'Berhasil',
        targetId: saved.id,
        beforeData: before
          ? {
              name: before.name,
              priceValue: before.priceValue,
              status: before.status,
              accessDuration: before.accessDuration,
            }
          : undefined,
        afterData: {
          name: saved.name,
          priceValue: saved.priceValue,
          status: saved.status,
          accessDuration: saved.accessDuration,
        },
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
    this.packages = INITIAL_PACKAGES.map((p) => ({ ...p, features: [...p.features] }));
    return this.getAllPackages();
  }

  public getStatusBadgeStyle(status: PackageStatus | string): string {
    return getStatusBadgeClasses(status);
  }
}

export const packageController = new PackageController();
export default packageController;
