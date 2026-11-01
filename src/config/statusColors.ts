/**
 * Sistem Warna Umpan Balik & Status Terpusat (Fase 0: 0.4 & 0.5)
 * Aturan Wajib:
 * - Hijau (emerald): berhasil / disimpan / selesai / dibayar / aktif / tayang / diterima / terkirim
 * - Merah (rose): gagal / error / dibatalkan / ditolak / kedaluwarsa / diblokir / refund / nonaktif-bahaya
 * - Kuning/Amber (amber): menunggu / antre / perlu ditinjau / peringatan / diundang
 * - Biru/Abu (blue/slate): diproses / terjadwal / draf / info netral
 */

export type SemanticFeedbackTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'accent';

export const TONE_BADGE_CLASSES: Record<SemanticFeedbackTone, string> = {
  success:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  danger:
    'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
  warning:
    'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  info:
    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  neutral:
    'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30',
  accent:
    'bg-[#D9B06F]/15 text-[#8A6528] dark:text-[#D9B06F] border-[#D9B06F]/40',
};

export const TONE_BANNER_CLASSES: Record<SemanticFeedbackTone, string> = {
  success:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  danger:
    'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/35',
  warning:
    'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/35',
  info:
    'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  neutral:
    'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
  accent:
    'bg-[#D9B06F]/12 text-[#8A6528] dark:text-[#D9B06F] border-[#D9B06F]/40',
};

/**
 * Menentukan tone warna semantik berdasarkan label status apa pun di seluruh panel
 */
export function resolveStatusTone(rawStatus: string): SemanticFeedbackTone {
  const norm = rawStatus.trim().toLowerCase();

  // 1. HIJAU (Success)
  if (
    norm.includes('dibayar') ||
    norm.includes('paid') ||
    norm.includes('berhasil') ||
    norm.includes('selesai') ||
    norm.includes('tayang') ||
    norm === 'aktif' ||
    norm.includes('diterima') ||
    norm.includes('terkirim') ||
    norm.includes('disetujui') ||
    norm.includes('200') ||
    norm === 'success'
  ) {
    return 'success';
  }

  // 2. MERAH (Danger / Error / Cancelled / Blocked / Expired / Refund)
  if (
    norm.includes('gagal') ||
    norm.includes('failed') ||
    norm.includes('error') ||
    norm.includes('dibatalkan') ||
    norm.includes('cancelled') ||
    norm.includes('ditolak') ||
    norm.includes('kedaluwarsa') ||
    norm.includes('berakhir') ||
    norm.includes('expired') ||
    norm.includes('diblokir') ||
    norm.includes('nonaktif') ||
    norm.includes('refund') ||
    norm.includes('504') ||
    norm.includes('500') ||
    norm === 'danger'
  ) {
    return 'danger';
  }

  // 3. KUNING / AMBER (Warning / Waiting / Queue / Review)
  if (
    norm.includes('menunggu') ||
    norm.includes('pending') ||
    norm.includes('antre') ||
    norm.includes('antri') ||
    norm.includes('perlu ditinjau') ||
    norm.includes('perlu_ditinjau') ||
    norm.includes('ditinjau') ||
    norm.includes('diundang') ||
    norm.includes('baru') ||
    norm.includes('peringatan') ||
    norm.includes('belum_dibayar') ||
    norm.includes('belum dibayar') ||
    norm === 'warning'
  ) {
    return 'warning';
  }

  // 4. EMAS (Accent)
  if (norm === 'gold' || norm === 'accent' || norm.includes('rekomendasi')) {
    return 'accent';
  }

  // 5. BIRU (Info / Processing / Shipped / Scheduled)
  if (
    norm.includes('diproses') ||
    norm.includes('process') ||
    norm.includes('dicetak') ||
    norm.includes('siap dikirim') ||
    norm.includes('dikirim') ||
    norm.includes('terjadwal') ||
    norm === 'info'
  ) {
    return 'info';
  }

  // 6. ABU / SLATE (Neutral / Draft / Belum mulai)
  return 'neutral';
}

export function getStatusBadgeClasses(rawStatus: string): string {
  const tone = resolveStatusTone(rawStatus);
  return TONE_BADGE_CLASSES[tone];
}
