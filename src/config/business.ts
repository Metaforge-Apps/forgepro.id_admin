/**
 * Centralized Business Rules, Constants & State Machines for ForgePro.id
 * Fase 0 (0.6 & 0.7): Satu sumber kebenaran aturan bisnis dan transisi status.
 */

export type CanonicalPaymentStatus =
  | 'menunggu'
  | 'dibayar'
  | 'gagal'
  | 'refund'
  | 'dibatalkan';

export type OrderPaymentStatusLabel =
  | 'Menunggu'
  | 'Dibayar'
  | 'Gagal'
  | 'Refund'
  | 'Dibatalkan';

export type CanonicalAiStatus =
  | 'belum_mulai'
  | 'antri'
  | 'diproses'
  | 'selesai'
  | 'gagal'
  | 'perlu_ditinjau'
  | 'dibatalkan';

export type OrderAiStatusLabel =
  | 'Belum mulai'
  | 'Antre'
  | 'Diproses'
  | 'Selesai'
  | 'Gagal'
  | 'Perlu ditinjau'
  | 'Dibatalkan';

export type ShippingWorkflowStatus =
  | 'Antre cetak'
  | 'Dicetak'
  | 'Siap dikirim'
  | 'Dikirim'
  | 'Diterima';

export type PrintPaymentStatus =
  | 'belum_dibayar'
  | 'menunggu'
  | 'dibayar'
  | 'kedaluwarsa'
  | 'refund';

export type PrintSizeOption =
  | '4x6 cm'
  | '3x4 cm'
  | '2x3 cm'
  | '4R (10 × 15 cm)';

export interface PrintSizeSpec {
  id: string;
  label: PrintSizeOption;
  dimensionsMm: string;
  sheetsPerPack: number;
  basePriceRp: number;
  productionCostRp: number;
}

export type WebhookEventName =
  | 'order.created'
  | 'purchase.verified'
  | 'purchase.refunded'
  | 'ai.processing'
  | 'ai.completed'
  | 'ai.failed'
  | 'print.paid'
  | 'print.completed'
  | 'shipment.updated'
  | 'shipment.failed';

export interface WebhookEventDefinition {
  event: WebhookEventName;
  title: string;
  category: 'digital' | 'ai' | 'print_shipping';
  description: string;
}

export const PRINT_SIZE_SPECS: PrintSizeSpec[] = [
  {
    id: 'size-4x6',
    label: '4x6 cm',
    dimensionsMm: '38 × 56 mm',
    sheetsPerPack: 6,
    basePriceRp: 25000,
    productionCostRp: 10000,
  },
  {
    id: 'size-3x4',
    label: '3x4 cm',
    dimensionsMm: '28 × 38 mm',
    sheetsPerPack: 8,
    basePriceRp: 25000,
    productionCostRp: 10000,
  },
  {
    id: 'size-2x3',
    label: '2x3 cm',
    dimensionsMm: '22 × 28 mm',
    sheetsPerPack: 10,
    basePriceRp: 25000,
    productionCostRp: 10000,
  },
  {
    id: 'size-4r',
    label: '4R (10 × 15 cm)',
    dimensionsMm: '102 × 152 mm',
    sheetsPerPack: 2,
    basePriceRp: 35000,
    productionCostRp: 12000,
  },
];

export const WEBHOOK_EVENT_CATALOG: WebhookEventDefinition[] = [
  {
    event: 'order.created',
    title: 'Pesanan baru dibuat',
    category: 'digital',
    description: 'Dipicu saat sesi guest checkout membuat nomor pesanan baru.',
  },
  {
    event: 'purchase.verified',
    title: 'Pembayaran Google Play terverifikasi',
    category: 'digital',
    description: 'Dipicu setelah purchaseToken valid diverifikasi ke Google Play Developer API.',
  },
  {
    event: 'purchase.refunded',
    title: 'Pengembalian dana (Refund) Google Play',
    category: 'digital',
    description: 'Dipicu saat RTDN Google Play melaporkan voided/refunded purchase.',
  },
  {
    event: 'ai.processing',
    title: 'Proses foto AI dimulai',
    category: 'ai',
    description: 'Dipicu saat job FLUX dikirim ke antrean worker Fal.ai.',
  },
  {
    event: 'ai.completed',
    title: 'Foto AI selesai diproses',
    category: 'ai',
    description: 'Dipicu saat seluruh foto AI selesai dirender dan siap diunduh pelanggan.',
  },
  {
    event: 'ai.failed',
    title: 'Proses foto AI gagal',
    category: 'ai',
    description: 'Dipicu saat worker Fal.ai gagal merender foto setelah batas percobaan.',
  },
  {
    event: 'print.paid',
    title: 'Pembayaran cetak fisik & ongkir lunas',
    category: 'print_shipping',
    description: 'Dipicu saat payment gateway mengonfirmasi pelunasan cetak fisik.',
  },
  {
    event: 'print.completed',
    title: 'Cetak fisik selesai & lolos QC',
    category: 'print_shipping',
    description: 'Dipicu saat tim produksi menyelesaikan cetak dan pemeriksaan kualitas.',
  },
  {
    event: 'shipment.updated',
    title: 'Status pengiriman diperbarui',
    category: 'print_shipping',
    description: 'Dipicu saat resi kurir dibuat atau status pengiriman bergerak.',
  },
  {
    event: 'shipment.failed',
    title: 'Kendala pengiriman kurir',
    category: 'print_shipping',
    description: 'Dipicu saat paket gagal dikirim, alamat tidak ditemukan, atau retur.',
  },
];

export const BUSINESS_CONFIG = {
  /** Masa akses unduhan default adalah 14 hari (bisa diatur per paket atau global) */
  defaultDownloadDurationDays: 14,
  defaultDownloadDurationLabel: '14 hari',

  /** Retensi foto selfie pelanggan maksimal 24 jam sesuai UU PDP No. 27/2022 */
  selfieRetentionHours: 24,
  selfieRetentionLabel: '24 jam',
  pdpComplianceLaw: 'UU PDP No. 27 Tahun 2022',
  retentionPolicy: {
    selfieRetentionHours: 24,
    aiResultRetentionDays: 14,
  },

  /** Sesi idle admin otomatis keluar setelah 30 menit */
  adminIdleTimeoutMinutes: 30,
  adminMaxSessionHours: 12,
  activityLogRetentionDays: 90,

  /** Kebijakan pengiriman ulang webhook (5x percobaan dengan backoff bertahap) */
  webhookPolicy: {
    maxRetries: 5,
    maxRetriesLabel: '5 kali',
    backoffMinutes: [1, 5, 15, 60] as const,
    backoffDescription: '1m, 5m, 15m, 1j',
    timeoutSeconds: 10,
    timeoutLabel: '10 detik',
  },

  /** Standar ukuran cetak fisik yang tersedia di aplikasi & admin */
  printSizes: PRINT_SIZE_SPECS.map((s) => s.label),
  defaultPrintSize: '4R (10 × 15 cm)' as PrintSizeOption,
  printQualityDpi: '300 dpi',
  printPaperFinish: 'Kertas foto premium • doff',
  printProductionSla: '1–2 hari kerja',
  printCutoffTimeWib: '14.00 WIB',

  /** Format tunggal nomor pesanan: PRO-YYYYMMDD-NNN */
  orderNumberPrefix: 'PRO',
  orderNumberPattern: /^PRO-\d{8}-\d{3,}$/,

  /** Katalog event webhook terpadu */
  webhookEvents: WEBHOOK_EVENT_CATALOG,

  /** Asumsi biaya & komisi untuk laporan keuangan */
  costAssumptions: {
    googlePlayFeeRate: 0.15, // 15% komisi Google Play Billing
    falAiCostPerPhotoRp: 450, // Rp450 per foto hasil render FLUX
    printProductionCostPerOrderRp: 12000, // Rp12.000 biaya kertas & tinta per pesanan cetak
    defaultShippingFeeRp: 18000, // Rp18.000 rata-rata ongkir kurir
    paymentGatewayFeeRp: 4000, // Rp4.000 biaya layanan payment gateway cetak fisik
  },
} as const;

// ============================================================================
// STATE MACHINES (0.7)
// ============================================================================

const PAYMENT_TRANSITIONS: Record<CanonicalPaymentStatus, CanonicalPaymentStatus[]> = {
  menunggu: ['dibayar', 'gagal', 'dibatalkan'],
  dibayar: ['refund'],
  gagal: ['menunggu', 'dibayar'], // rekonsiliasi manual jika token valid menyusul
  refund: [],
  dibatalkan: [],
};

const AI_STATUS_TRANSITIONS: Record<CanonicalAiStatus, CanonicalAiStatus[]> = {
  belum_mulai: ['antri', 'diproses', 'dibatalkan'],
  antri: ['diproses', 'gagal', 'dibatalkan'],
  diproses: ['selesai', 'gagal', 'perlu_ditinjau', 'dibatalkan'],
  perlu_ditinjau: ['selesai', 'gagal', 'antri', 'diproses'],
  gagal: ['antri', 'diproses', 'dibatalkan'],
  selesai: ['diproses'], // regenerasi ulang oleh admin
  dibatalkan: [],
};

const SHIPPING_STATUS_TRANSITIONS: Record<
  ShippingWorkflowStatus,
  ShippingWorkflowStatus[]
> = {
  'Antre cetak': ['Dicetak'],
  Dicetak: ['Siap dikirim'],
  'Siap dikirim': ['Dikirim'],
  Dikirim: ['Diterima'],
  Diterima: [],
};

const PRINT_PAYMENT_TRANSITIONS: Record<PrintPaymentStatus, PrintPaymentStatus[]> = {
  belum_dibayar: ['menunggu', 'dibayar'],
  menunggu: ['dibayar', 'kedaluwarsa'],
  dibayar: ['refund'],
  kedaluwarsa: ['menunggu'],
  refund: [],
};

export function toCanonicalPaymentStatus(
  status: string
): CanonicalPaymentStatus {
  const norm = status.trim().toLowerCase();
  if (norm === 'dibayar' || norm === 'paid') return 'dibayar';
  if (norm === 'gagal' || norm === 'failed') return 'gagal';
  if (norm === 'refund' || norm === 'refunded') return 'refund';
  if (norm === 'dibatalkan' || norm === 'cancelled') return 'dibatalkan';
  return 'menunggu';
}

export function toDisplayPaymentStatus(
  status: CanonicalPaymentStatus | OrderPaymentStatusLabel
): OrderPaymentStatusLabel {
  const canonical = toCanonicalPaymentStatus(status);
  switch (canonical) {
    case 'dibayar':
      return 'Dibayar';
    case 'gagal':
      return 'Gagal';
    case 'refund':
      return 'Refund';
    case 'dibatalkan':
      return 'Dibatalkan';
    default:
      return 'Menunggu';
  }
}

export function toCanonicalAiStatus(status: string): CanonicalAiStatus {
  const norm = status.trim().toLowerCase().replace(/\s+/g, '_');
  if (norm === 'antre' || norm === 'antri' || norm === 'queued') return 'antri';
  if (norm === 'diproses' || norm === 'processing') return 'diproses';
  if (norm === 'selesai' || norm === 'completed') return 'selesai';
  if (norm === 'gagal' || norm === 'failed') return 'gagal';
  if (norm === 'perlu_ditinjau' || norm === 'needs_review') return 'perlu_ditinjau';
  if (norm === 'dibatalkan' || norm === 'cancelled') return 'dibatalkan';
  return 'belum_mulai';
}

export function toDisplayAiStatus(
  status: CanonicalAiStatus | OrderAiStatusLabel
): OrderAiStatusLabel {
  const canonical = toCanonicalAiStatus(status);
  switch (canonical) {
    case 'antri':
      return 'Antre';
    case 'diproses':
      return 'Diproses';
    case 'selesai':
      return 'Selesai';
    case 'gagal':
      return 'Gagal';
    case 'perlu_ditinjau':
      return 'Perlu ditinjau';
    case 'dibatalkan':
      return 'Dibatalkan';
    default:
      return 'Belum mulai';
  }
}

export function canTransitionPaymentStatus(
  from: CanonicalPaymentStatus | OrderPaymentStatusLabel,
  to: CanonicalPaymentStatus | OrderPaymentStatusLabel
): boolean {
  const fromKey = toCanonicalPaymentStatus(from);
  const toKey = toCanonicalPaymentStatus(to);
  if (fromKey === toKey) return true;
  return PAYMENT_TRANSITIONS[fromKey]?.includes(toKey) ?? false;
}

export function canTransitionAiStatus(
  from: CanonicalAiStatus | OrderAiStatusLabel,
  to: CanonicalAiStatus | OrderAiStatusLabel
): boolean {
  const fromKey = toCanonicalAiStatus(from);
  const toKey = toCanonicalAiStatus(to);
  if (fromKey === toKey) return true;
  return AI_STATUS_TRANSITIONS[fromKey]?.includes(toKey) ?? false;
}

export function canTransitionShippingStatus(
  from: ShippingWorkflowStatus,
  to: ShippingWorkflowStatus
): boolean {
  if (from === to) return true;
  return SHIPPING_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionPrintPaymentStatus(
  from: PrintPaymentStatus,
  to: PrintPaymentStatus
): boolean {
  if (from === to) return true;
  return PRINT_PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validasi aturan bisnis lintas status:
 * Pesanan tidak boleh berstatus AI "Diproses" atau "Selesai" jika pembayaran belum "Dibayar" (atau "Refund" pasca-selesai).
 */
export function validateOrderStateCombination(
  paymentStatus: CanonicalPaymentStatus | OrderPaymentStatusLabel,
  aiStatus: CanonicalAiStatus | OrderAiStatusLabel
): { valid: boolean; reason?: string } {
  const pay = toCanonicalPaymentStatus(paymentStatus);
  const ai = toCanonicalAiStatus(aiStatus);

  if (
    (pay === 'menunggu' || pay === 'gagal' || pay === 'dibatalkan') &&
    (ai === 'antri' || ai === 'diproses' || ai === 'selesai' || ai === 'perlu_ditinjau')
  ) {
    return {
      valid: false,
      reason: `Proses AI tidak dapat berstatus "${toDisplayAiStatus(ai)}" selama pembayaran masih "${toDisplayPaymentStatus(pay)}".`,
    };
  }

  return { valid: true };
}

/**
 * URL Pelacakan kurir ekspedisi pihak ketiga
 */
export function getCourierTrackingUrl(courier: string, trackingNumber: string): string {
  const clean = encodeURIComponent(trackingNumber.trim());
  return `https://cekresi.com/?noresi=${clean}`;
}

/**
 * Mengecek apakah aplikasi berjalan dalam mode data contoh (mock)
 */
export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK !== 'false';
}

export {
  formatTanggalWIB,
  maskEmail,
  maskPhone,
  formatRupiah,
  formatNomorPesanan,
} from '../utils/formatters';
