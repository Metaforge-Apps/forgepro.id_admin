import {
  VoucherItem,
  VoucherInput,
  VoucherStatus,
  VoucherSummary,
  VoucherPackageTarget,
} from './voucher.types';

const STORAGE_KEY = 'forgepro_vouchers_v1';

const baseVoucher = {
  maxDiscount: 0,
  minPurchase: 0,
  promoProductId: '',
  perEmailLimit: 1,
  packageTarget: 'all' as VoucherPackageTarget,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  quota: 500,
  used: 0,
  isActive: true,
};

/**
 * Data awal voucher. Disalin dari `LocalVoucherRepository.defaultOffers` di aplikasi Flutter.
 */
export const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    ...baseVoucher,
    id: 'v-forgepro2026',
    code: 'FORGEPRO2026',
    title: 'Diskon 15% Spesial Rilis 2026',
    description: 'Potongan 15% langsung untuk seluruh pilihan paket jas AI.',
    badge: 'PALING HEMAT',
    discountType: 'percent',
    percentOff: 15,
    amountOff: 0,
    bonusPhotos: 0,
  },
  {
    ...baseVoucher,
    id: 'v-karirhemat',
    code: 'KARIRHEMAT',
    title: 'Kupon Pasfoto & CV Karir',
    description:
      'Potongan instan Rp15.000 untuk kebutuhan pasfoto kerja, CV, dan dokumen formal.',
    badge: 'POPULER KARIR',
    discountType: 'amount',
    percentOff: 0,
    amountOff: 15000,
    bonusPhotos: 0,
  },
  {
    ...baseVoucher,
    id: 'v-eksekutif',
    code: 'EKSEKUTIF',
    title: 'Kupon Portofolio Eksekutif VIP',
    description:
      'Potongan Rp20.000 untuk sesi foto eksekutif dan LinkedIn multi-gaya.',
    badge: 'VIP PRO',
    discountType: 'amount',
    percentOff: 0,
    amountOff: 20000,
    bonusPhotos: 0,
  },
  {
    ...baseVoucher,
    id: 'v-playpromo50',
    code: 'PLAYPROMO50',
    title: 'Promo Spesial Rilis Google Play',
    description: 'Potongan Rp25.000 untuk transaksi paket foto AI pertama Anda.',
    badge: 'PLAY PROMO',
    discountType: 'amount',
    percentOff: 0,
    amountOff: 25000,
    bonusPhotos: 0,
  },
];

export const PACKAGE_TARGET_LABEL: Record<VoucherPackageTarget, string> = {
  all: 'Semua paket',
  esensial: 'Esensial',
  profesional: 'Profesional',
  eksklusif: 'Eksklusif',
};

/** Tanggal hari ini (zona waktu perangkat) dalam format `YYYY-MM-DD`. */
export const todayIso = (): string => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

/** Status voucher dihitung dari saklar manual, tanggal, dan sisa kuota. */
export const getVoucherStatus = (v: VoucherItem): VoucherStatus => {
  if (!v.isActive) return 'Nonaktif';
  const today = todayIso();
  if (today < v.startDate) return 'Terjadwal';
  if (today > v.endDate || (v.quota > 0 && v.used >= v.quota)) return 'Berakhir';
  return 'Aktif';
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const parseIso = (iso: string): { y: number; m: number; d: number } | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) };
};

export const formatDateShort = (iso: string): string => {
  const p = parseIso(iso);
  return p ? `${p.d} ${MONTHS_SHORT[p.m]} ${p.y}` : iso;
};

export const formatPeriod = (v: Pick<VoucherItem, 'startDate' | 'endDate'>): string =>
  `${formatDateShort(v.startDate)} – ${formatDateShort(v.endDate)}`;

/** Kelompok periode berdasarkan bulan mulai, mis. "Oktober 2026". */
export const getPeriodGroup = (v: Pick<VoucherItem, 'startDate'>): string => {
  const p = parseIso(v.startDate);
  return p ? `${MONTHS_LONG[p.m]} ${p.y}` : '-';
};

const rupiah = (n: number): string => `Rp${Math.round(n).toLocaleString('id-ID')}`;

/** Ringkasan potongan untuk kolom "Diskon": [utama, keterangan]. */
export const describeDiscount = (v: VoucherItem): [string, string] => {
  const subs: string[] = [];
  let main = '';
  if (v.discountType === 'percent') {
    main = `${v.percentOff}%`;
    if (v.maxDiscount > 0) subs.push(`Maks. ${rupiah(v.maxDiscount)}`);
  } else if (v.discountType === 'amount') {
    main = rupiah(v.amountOff);
  }
  if (v.bonusPhotos > 0) {
    if (main) subs.push(`+${v.bonusPhotos} foto`);
    else main = `+${v.bonusPhotos} foto`;
  }
  if (v.minPurchase > 0) subs.push(`Min. ${rupiah(v.minPurchase)}`);
  return [main || '-', subs.join(' · ') || 'Tanpa batas'];
};

type VoucherListener = () => void;

/**
 * VoucherController — Mengelola data voucher & promo ForgePro.id.
 * Bentuk data mengikuti `VoucherOffer` pada aplikasi Flutter.
 */
export class VoucherController {
  private vouchers: VoucherItem[];
  private listeners: Set<VoucherListener> = new Set();

  constructor() {
    this.vouchers = this.loadFromStorage();
  }

  private loadFromStorage(): VoucherItem[] {
    if (typeof window === 'undefined') return INITIAL_VOUCHERS.map((v) => ({ ...v }));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VoucherItem[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback ke data awal
    }
    return INITIAL_VOUCHERS.map((v) => ({ ...v }));
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.vouchers));
    } catch {
      // Abaikan error kuota penyimpanan
    }
  }

  private notify(): void {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: VoucherListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAllVouchers(): VoucherItem[] {
    return [...this.vouchers];
  }

  public getVoucherById(id: string): VoucherItem | undefined {
    return this.vouchers.find((v) => v.id === id);
  }

  public isCodeTaken(code: string, exceptId?: string): boolean {
    const normalized = code.trim().toUpperCase();
    return this.vouchers.some((v) => v.code === normalized && v.id !== exceptId);
  }

  /**
   * Validasi input voucher. Mengembalikan pesan galat atau `null` bila valid.
   */
  public validate(input: VoucherInput, exceptId?: string): string | null {
    const code = input.code.trim().toUpperCase();
    if (!code) return 'Kode voucher wajib diisi.';
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return 'Kode hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.';
    }
    if (this.isCodeTaken(code, exceptId)) return `Kode ${code} sudah dipakai voucher lain.`;
    if (!input.title.trim()) return 'Judul voucher wajib diisi.';
    if (input.discountType === 'percent' && (input.percentOff < 1 || input.percentOff > 100)) {
      return 'Diskon persen harus antara 1 dan 100.';
    }
    if (input.discountType === 'amount' && input.amountOff < 1) {
      return 'Potongan nominal harus lebih dari 0.';
    }
    if (input.discountType === 'none' && input.bonusPhotos < 1) {
      return 'Isi diskon atau bonus foto minimal salah satu.';
    }
    if (!parseIso(input.startDate) || !parseIso(input.endDate)) {
      return 'Tanggal mulai dan berakhir wajib diisi.';
    }
    if (input.endDate < input.startDate) {
      return 'Tanggal berakhir tidak boleh sebelum tanggal mulai.';
    }
    if (input.quota < 1) return 'Kuota harus lebih dari 0.';
    if (input.perEmailLimit < 1) return 'Batas per email minimal 1.';
    return null;
  }

  private normalize(input: VoucherInput): VoucherInput {
    return {
      ...input,
      code: input.code.trim().toUpperCase(),
      title: input.title.trim(),
      description: input.description.trim(),
      badge: input.badge.trim().toUpperCase() || 'PROMO',
      promoProductId: input.promoProductId.trim(),
      percentOff: input.discountType === 'percent' ? input.percentOff : 0,
      amountOff: input.discountType === 'amount' ? input.amountOff : 0,
      maxDiscount: input.discountType === 'percent' ? input.maxDiscount : 0,
    };
  }

  public createVoucher(input: VoucherInput): VoucherItem {
    const created: VoucherItem = {
      ...this.normalize(input),
      id: `v-${Date.now()}`,
      used: 0,
    };
    this.vouchers = [created, ...this.vouchers];
    this.notify();
    return created;
  }

  public updateVoucher(id: string, input: VoucherInput): VoucherItem | null {
    let updated: VoucherItem | null = null;
    this.vouchers = this.vouchers.map((v) => {
      if (v.id !== id) return v;
      updated = { ...this.normalize(input), id: v.id, used: v.used };
      return updated;
    });
    if (updated) this.notify();
    return updated;
  }

  public toggleActive(id: string): VoucherItem | null {
    const target = this.getVoucherById(id);
    if (!target) return null;
    return this.updateVoucher(id, { ...target, isActive: !target.isActive });
  }

  public deleteVoucher(id: string): boolean {
    const before = this.vouchers.length;
    this.vouchers = this.vouchers.filter((v) => v.id !== id);
    const deleted = this.vouchers.length < before;
    if (deleted) this.notify();
    return deleted;
  }

  public getSummary(): VoucherSummary {
    let active = 0;
    let scheduled = 0;
    let totalUsed = 0;
    let remainingQuota = 0;
    let nextStart: string | null = null;
    for (const v of this.vouchers) {
      const status = getVoucherStatus(v);
      totalUsed += v.used;
      if (status === 'Aktif') {
        active++;
        remainingQuota += Math.max(0, v.quota - v.used);
      }
      if (status === 'Terjadwal') {
        scheduled++;
        if (!nextStart || v.startDate < nextStart) nextStart = v.startDate;
      }
    }
    return {
      total: this.vouchers.length,
      active,
      scheduled,
      totalUsed,
      remainingQuota,
      nextStart,
    };
  }

  public getStatusBadgeStyle(status: VoucherStatus): string {
    if (status === 'Aktif') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    if (status === 'Terjadwal') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
}

export const voucherController = new VoucherController();
export default voucherController;
