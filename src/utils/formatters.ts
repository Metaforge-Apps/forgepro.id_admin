/**
 * Centralized Formatters for ForgePro.id (Fase 0: 0.4)
 * Format Bahasa Indonesia, Rupiah (Rp96.800), Zona Waktu WIB, dan Masking Data Pribadi (UU PDP).
 */

const INDONESIAN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Format angka menjadi Rupiah standar Indonesia tanpa spasi: Rp96.800
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Rp0';
  }
  const sign = amount < 0 ? '-' : '';
  const rounded = Math.round(Math.abs(amount));
  return `${sign}Rp${rounded.toLocaleString('id-ID')}`;
}

/**
 * Format angka menjadi Rupiah ringkas untuk kartu metrik: Rp96,8 jt / Rp824 rb
 */
export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(1).replace('.', ',');
    return `${sign}Rp${val.replace(/,0$/, '')} M`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(1).replace('.', ',');
    return `${sign}Rp${val.replace(/,0$/, '')} jt`;
  }
  if (abs >= 100_000) {
    const val = Math.round(abs / 1_000).toLocaleString('id-ID');
    return `${sign}Rp${val} rb`;
  }
  return formatRupiah(amount);
}

/**
 * Format tanggal/ISO string ke tampilan Waktu Indonesia Barat (WIB)
 * Contoh: "19 Okt 2026, 16:12 WIB" atau "19 Okt, 16:12 WIB"
 */
export function formatTanggalWIB(
  input: string | Date,
  options?: { includeYear?: boolean; includeSeconds?: boolean; includeWibSuffix?: boolean }
): string {
  const {
    includeYear = false,
    includeSeconds = false,
    includeWibSuffix = true,
  } = options ?? {};

  if (typeof input === 'string') {
    // Jika sudah berupa string terformat seperti "19 Okt, 16:12", tambahkan WIB bila diminta
    if (/^\d{1,2}\s+[A-Za-z]{3}/.test(input)) {
      if (includeWibSuffix && !input.toUpperCase().includes('WIB')) {
        return `${input} WIB`;
      }
      return input;
    }
  }

  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return typeof input === 'string' ? input : '-';
  }

  // Konversi ke UTC+7 (WIB)
  const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const day = wibTime.getUTCDate();
  const month = INDONESIAN_MONTHS_SHORT[wibTime.getUTCMonth()];
  const year = wibTime.getUTCFullYear();
  const hours = String(wibTime.getUTCHours()).padStart(2, '0');
  const minutes = String(wibTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(wibTime.getUTCSeconds()).padStart(2, '0');

  const datePart = includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
  const timePart = includeSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  const suffix = includeWibSuffix ? ' WIB' : '';

  return `${datePart}, ${timePart}${suffix}`;
}

/**
 * Menormalkan atau membuat nomor pesanan dengan format tunggal: PRO-YYYYMMDD-NNN
 */
export function formatNomorPesanan(
  sequenceOrRaw: number | string,
  date: Date = new Date()
): string {
  if (typeof sequenceOrRaw === 'string') {
    const trimmed = sequenceOrRaw.trim().toUpperCase();
    // Konversi kode lama PS-YYMMDD-NNN menjadi PRO-20YYMMDD-NNN
    const legacyMatch = trimmed.match(/^PS-(\d{6})-(\d{3,})$/);
    if (legacyMatch) {
      return `PRO-20${legacyMatch[1]}-${legacyMatch[2]}`;
    }
    if (/^PRO-\d{8}-\d{3,}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const seq =
    typeof sequenceOrRaw === 'number'
      ? sequenceOrRaw
      : parseInt(String(sequenceOrRaw).replace(/\D/g, ''), 10) || 1;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const seqPadded = String(seq).padStart(3, '0');

  return `PRO-${year}${month}${day}-${seqPadded}`;
}

/**
 * Masking email untuk kepatuhan privasi (UU PDP): "rizky.pratama@gmail.com" -> "ri***a@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '-';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0] ?? '*'}***@${domain}`;
  }
  const firstTwo = localPart.slice(0, 2);
  const lastChar = localPart.slice(-1);
  return `${firstTwo}***${lastChar}@${domain}`;
}

/**
 * Masking nomor telepon / WhatsApp: "+62 812-3456-7890" -> "+62 812-****-7890"
 */
export function maskPhone(phone: string): string {
  if (!phone) return '-';
  const cleaned = phone.trim();
  if (cleaned.length <= 6) return '****';
  const prefix = cleaned.slice(0, Math.min(7, cleaned.length - 4));
  const suffix = cleaned.slice(-4);
  return `${prefix}-****-${suffix}`;
}
