/**
 * TypeScript Definitions for Voucher Controller (Voucher & Promo — ForgePro.id)
 *
 * Disesuaikan dengan `VoucherOffer` / `VoucherApplication` di aplikasi Flutter
 * (forgepro_apps/lib/features/generation/data/voucher_repository.dart).
 */
import type { PackageTier } from '../package-controller/package.types';

/** Jenis potongan harga. `none` = hanya bonus foto. */
export type VoucherDiscountType = 'percent' | 'amount' | 'none';

/** `all` = semua paket, selain itu mengikuti tier paket aplikasi. */
export type VoucherPackageTarget = 'all' | PackageTier;

export type VoucherStatus = 'Aktif' | 'Terjadwal' | 'Berakhir' | 'Nonaktif';

export interface VoucherItem {
  id: string;
  /** Kode yang diketik pelanggan (`code`). */
  code: string;
  /** Judul di sheet "Pilih Kupon" (`title`). */
  title: string;
  /** Penjelasan kupon (`description`). */
  description: string;
  /** Label kecil pada kartu kupon (`badge`), mis. "PALING HEMAT". */
  badge: string;
  discountType: VoucherDiscountType;
  /** Diskon persen 1-100 (`percent_off`). */
  percentOff: number;
  /** Potongan nominal rupiah (`amount_off`). */
  amountOff: number;
  /** Bonus foto tambahan (`bonus_photos`). */
  bonusPhotos: number;
  /** Batas maksimum potongan untuk diskon persen (rupiah, 0 = tanpa batas). */
  maxDiscount: number;
  /** Minimum nilai paket agar voucher berlaku (rupiah, 0 = tanpa minimum). */
  minPurchase: number;
  /** SKU promo di Play Console (`promo_product_id`), opsional. */
  promoProductId: string;
  /** Batas pemakaian per email pelanggan. */
  perEmailLimit: number;
  packageTarget: VoucherPackageTarget;
  /** Tanggal mulai, format `YYYY-MM-DD`. */
  startDate: string;
  /** Tanggal berakhir, format `YYYY-MM-DD`. */
  endDate: string;
  quota: number;
  used: number;
  /** Saklar manual aktif / nonaktif. */
  isActive: boolean;
}

export type VoucherInput = Omit<VoucherItem, 'id' | 'used'>;

export interface VoucherSummary {
  total: number;
  active: number;
  scheduled: number;
  totalUsed: number;
  remainingQuota: number;
  nextStart: string | null;
}
