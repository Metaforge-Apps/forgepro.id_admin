/**
 * TypeScript Definitions for Order Controller (Pesanan & Pengiriman — ForgePro.id)
 *
 * Disesuaikan dengan model `Order` pada aplikasi Flutter
 * (forgepro_apps/lib/features/generation/domain/models.dart).
 */
import type { PackageTier } from '../package-controller/package.types';

export type PaymentStatus = 'Dibayar' | 'Menunggu' | 'Gagal';

export type PhotoGenerationStatus =
  | 'Selesai'
  | 'Diproses'
  | 'Belum mulai'
  | 'Dibatalkan';

export type ShippingStatus =
  | 'Antre cetak'
  | 'Dicetak'
  | 'Siap dikirim'
  | 'Dikirim'
  | 'Diterima';

export interface GeneratedPhotoItem {
  templateId: string;
  variant: number;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface OrderItem {
  /** ID unik pesanan di backend / database (mis. `ord_88f9104b2`). */
  id: string;
  /** Nomor referensi pesanan yang dilihat pelanggan (mis. `PRO-20261019-001`). */
  orderNumber: string;
  createdAt: string;
  timeDisplay: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  packageTier: PackageTier;
  packageName: string;
  /** Total pembayaran akhir dalam rupiah (setelah diskon). */
  amount: number;
  /** Potongan voucher dalam rupiah. */
  discount: number;
  voucherCode?: string;
  /** Metode pembayaran resmi (Google Play Billing). */
  paymentMethod: string;
  photoCount: number;
  /** Daftar ID template jas yang dipilih. */
  templateIds: string[];
  suitType: string;
  results: GeneratedPhotoItem[];
  customPrompt?: string;
  bundleCount: number;
  creditsRemaining: number;
  totalCredits: number;
  paymentStatus: PaymentStatus;
  photoStatus: PhotoGenerationStatus;
  // Cetak Fisik & Pengiriman
  hasPhysicalPrint: boolean;
  printSpec?: string;
  recipientName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCourier?: string;
  shippingTrackingNumber?: string;
  shippingStatus?: ShippingStatus;
  downloadUrl?: string | null;
}

export interface UpdateOrderStatusPayload {
  paymentStatus?: PaymentStatus;
  photoStatus?: PhotoGenerationStatus;
  creditsRemaining?: number;
}

export interface UpdateShippingPayload {
  shippingStatus?: ShippingStatus;
  shippingTrackingNumber?: string;
  shippingCourier?: string;
}
