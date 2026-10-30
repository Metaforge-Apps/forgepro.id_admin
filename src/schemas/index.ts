import { z } from 'zod';
import { BUSINESS_CONFIG } from '../config/business';

/**
 * Zod Validation Schemas untuk Form & Domain ForgePro.id (Fase 0: 0.1 & 0.2)
 */

export const suitStyleFormSchema = z
  .object({
    id: z
      .string()
      .min(2, 'ID template minimal 2 karakter.')
      .regex(/^[a-z0-9_]+$/, 'ID template hanya boleh huruf kecil, angka, dan underscore (_).'),
    name: z.string().trim().min(3, 'Nama gaya minimal 3 karakter.'),
    gender: z.enum(['Pria', 'Wanita', 'Unisex']).default('Pria'),
    category: z.string().min(1, 'Kategori gaya wajib dipilih.'),
    description: z.string().trim().optional().default(''),
    prompt: z.string().trim().optional().default(''),
    negativePrompt: z.string().trim().optional().default(''),
    aspectRatio: z.enum(['3:4', '9:16', '1:1']).default('3:4'),
    tags: z.array(z.string()).default([]),
    isPopular: z.boolean().default(false),
    isNew: z.boolean().default(false),
    status: z.enum(['Tayang', 'Draf']),
    image: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'Tayang') {
        return Boolean(data.prompt && data.prompt.trim().length >= 10);
      }
      return true;
    },
    {
      message: 'Prompt AI wajib diisi (minimal 10 karakter) sebelum gaya ditayangkan.',
      path: ['prompt'],
    }
  );

export const pricingPackageFormSchema = z.object({
  tier: z.enum(['esensial', 'profesional', 'eksklusif']),
  name: z.string().trim().min(2, 'Nama paket wajib diisi.'),
  description: z.string().trim().min(5, 'Deskripsi paket wajib diisi.'),
  photoCount: z.number().int().min(1, 'Jumlah hasil foto harus lebih dari 0.'),
  creditAmount: z.number().int().min(1, 'Kredit AI harus lebih dari 0.'),
  maxTemplates: z.number().int().min(1, 'Maks. template jas harus minimal 1.'),
  extraBenefits: z.string().optional().default(''),
  accessDuration: z
    .string()
    .trim()
    .min(1, 'Masa akses unduhan wajib diisi.')
    .default(BUSINESS_CONFIG.defaultDownloadDurationLabel),
  displayOrder: z.number().int().min(1, 'Urutan tampilan minimal 1.'),
  status: z.enum(['Tayang', 'Draf']),
  sku: z
    .string()
    .trim()
    .regex(/^forgepro_[a-z0-9_]+$/, 'Format Product ID harus diawali forgepro_ (mis. forgepro_profesional).'),
  priceValue: z.number().int().min(1000, 'Harga referensi minimal Rp1.000.'),
  isFeatured: z.boolean().default(false),
});

export const voucherFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, 'Kode voucher minimal 3 karakter.')
      .regex(/^[A-Z0-9_-]+$/, 'Kode voucher hanya boleh huruf kapital, angka, strip, atau garis bawah.'),
    title: z.string().trim().min(3, 'Nama promo wajib diisi.'),
    discountType: z.enum(['percent', 'fixed']),
    discountValue: z.number().positive('Nilai diskon harus lebih dari 0.'),
    maxDiscountAmount: z.number().nonnegative().nullable().optional(),
    minPurchaseAmount: z.number().nonnegative('Minimum pembelian tidak boleh negatif.').default(0),
    quota: z.number().int().min(1, 'Kuota penggunaan minimal 1.'),
    perEmailLimit: z.number().int().min(1, 'Batas per email minimal 1.').default(1),
    period: z.string().trim().min(3, 'Periode berlaku wajib diisi.'),
    status: z.enum(['Aktif', 'Terjadwal', 'Berakhir', 'Nonaktif']),
    channelType: z.enum(['internal', 'google_play']).default('internal'),
  })
  .refine(
    (data) => {
      if (data.discountType === 'percent') {
        return data.discountValue >= 1 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: 'Diskon persentase harus berada di antara 1% hingga 100%.',
      path: ['discountValue'],
    }
  );

export const adminInviteFormSchema = z.object({
  name: z.string().trim().min(2, 'Nama lengkap admin wajib diisi.'),
  email: z.string().trim().email('Masukkan alamat email kerja yang valid.'),
  role: z.enum(['Admin Utama', 'Operasional', 'Produk', 'Keuangan']),
});

export const adminProfileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama lengkap wajib diisi.'),
  displayName: z.string().trim().min(2, 'Label tampilan sidebar wajib diisi.'),
  primaryEmail: z.string().trim().email('Format email utama tidak valid.'),
  loginEmail: z.string().trim().email('Format email login tidak valid.'),
  phone: z.string().trim().min(8, 'Nomor telepon wajib diisi.'),
  position: z.string().trim().min(2, 'Jabatan wajib diisi.'),
});

export type SuitStyleFormValues = z.infer<typeof suitStyleFormSchema>;
export type PricingPackageFormValues = z.infer<typeof pricingPackageFormSchema>;
export type VoucherFormValues = z.infer<typeof voucherFormSchema>;
export type AdminInviteFormValues = z.infer<typeof adminInviteFormSchema>;
export type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>;
