import {
  VoucherItem,
  VoucherInput,
  VoucherStatus,
  VoucherSummary,
  VoucherPackageTarget,
} from './voucher.types';
import { mockDb, SEED_VOUCHERS } from '../../mocks/db';
import { getStatusBadgeClasses } from '../../config/statusColors';

export const INITIAL_VOUCHERS: VoucherItem[] = SEED_VOUCHERS;

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

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
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

export const formatPeriod = (
  v: Pick<VoucherItem, 'startDate' | 'endDate'>
): string => `${formatDateShort(v.startDate)} – ${formatDateShort(v.endDate)}`;

/** Kelompok periode berdasarkan bulan mulai, mis. "Oktober 2026". */
export const getPeriodGroup = (v: Pick<VoucherItem, 'startDate'>): string => {
  const p = parseIso(v.startDate);
  return p ? `${MONTHS_LONG[p.m]} ${p.y}` : '-';
};

const rupiah = (n: number): string =>
  `Rp${Math.round(n).toLocaleString('id-ID')}`;

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
 * VoucherController — Mengelola data voucher & promo ForgePro.id melalui mockDb terpusat.
 */
export class VoucherController {
  public subscribe(listener: VoucherListener): () => void {
    return mockDb.subscribe(listener);
  }

  public getAllVouchers(): VoucherItem[] {
    return [...mockDb.getState().vouchers];
  }

  public getVoucherById(id: string): VoucherItem | undefined {
    return mockDb.getState().vouchers.find((v) => v.id === id);
  }

  public isCodeTaken(code: string, exceptId?: string): boolean {
    const normalized = code.trim().toUpperCase();
    return mockDb
      .getState()
      .vouchers.some((v) => v.code === normalized && v.id !== exceptId);
  }

  public validate(input: VoucherInput, exceptId?: string): string | null {
    const code = input.code.trim().toUpperCase();
    if (!code) return 'Kode voucher wajib diisi.';
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return 'Kode hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.';
    }
    if (this.isCodeTaken(code, exceptId))
      return `Kode ${code} sudah dipakai voucher lain.`;
    if (!input.title.trim()) return 'Judul voucher wajib diisi.';
    if (
      input.discountType === 'percent' &&
      (input.percentOff < 1 || input.percentOff > 100)
    ) {
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
    mockDb.updateState((prev) => ({
      ...prev,
      vouchers: [created, ...prev.vouchers],
    }));
    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Katalog',
      activity: `Membuat voucher baru · ${created.code}`,
      result: 'Berhasil',
      targetId: created.id,
    });
    return created;
  }

  public updateVoucher(id: string, input: VoucherInput): VoucherItem | null {
    const current = this.getVoucherById(id);
    if (!current) return null;
    const updated: VoucherItem = {
      ...this.normalize(input),
      id: current.id,
      used: current.used,
    };
    mockDb.updateState(
      (prev) => ({
        ...prev,
        vouchers: prev.vouchers.map((v) => (v.id === id ? updated : v)),
      }),
      { recalculateDerived: false }
    );
    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Katalog',
      activity: `Memperbarui voucher · ${updated.code}`,
      result: 'Berhasil',
      targetId: updated.id,
    });
    return updated;
  }

  public toggleActive(id: string): VoucherItem | null {
    const target = this.getVoucherById(id);
    if (!target) return null;
    return this.updateVoucher(id, { ...target, isActive: !target.isActive });
  }

  public deleteVoucher(id: string): boolean {
    const target = this.getVoucherById(id);
    if (!target) return false;
    if (target.used > 0) {
      console.warn(`[VoucherController] Deletion blocked: voucher ${target.code} has ${target.used} usages.`);
      return false;
    }
    mockDb.updateState((prev) => ({
      ...prev,
      vouchers: prev.vouchers.filter((v) => v.id !== id),
    }));
    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Katalog',
      activity: `Menghapus kode promo · ${target.code}`,
      result: 'Berhasil',
      targetId: target.id,
    });
    return true;
  }

  public getSummary(): VoucherSummary {
    const vouchers = mockDb.getState().vouchers;
    let active = 0;
    let scheduled = 0;
    let totalUsed = 0;
    let remainingQuota = 0;
    let nextStart: string | null = null;
    for (const v of vouchers) {
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
      total: vouchers.length,
      active,
      scheduled,
      totalUsed,
      remainingQuota,
      nextStart,
    };
  }

  public getStatusBadgeStyle(status: VoucherStatus): string {
    return getStatusBadgeClasses(status);
  }
}

export const voucherController = new VoucherController();
export default voucherController;
