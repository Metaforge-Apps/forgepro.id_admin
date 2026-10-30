import { INITIAL_SUIT_STYLES } from '../controllers/style-controller/style.seed';
import { INITIAL_ORDERS } from '../controllers/order-controller/order.seed';
import { INITIAL_PACKAGES } from '../controllers/package-controller/package.seed';
import type { OrderItem as ControllerOrderItem } from '../controllers/order-controller/order.types';
import type { SuitStyleItem as ControllerSuitStyleItem } from '../controllers/style-controller/style.types';
import type { PricingPackageItem as ControllerPackageItem } from '../controllers/package-controller/package.types';
import type {
  VoucherItem as ControllerVoucherItem,
  VoucherPackageTarget,
} from '../controllers/voucher-controller/voucher.types';
import type {
  ActivityLogItem,
  AdminMember,
  AdminNotificationItem,
  AdminRoleDefinition,
  AdminSessionDevice,
  AiQueueJob,
  BlockedPromptLog,
  ComplaintTicket,
  CustomerConsentLog,
  LegalDocumentItem,
  MessageTemplateItem,
  PrivacyDeletionJob,
  PrivacyManualDeletionRequest,
  SentMessageLog,
  WebhookItem,
  PrintPayment,
} from '../types';
import { BUSINESS_CONFIG } from '../config/business';

/**
 * Satu Sumber Kebenaran Basis Data Mock Terpusat (Fase 0: 0.3 & 0.10)
 * Seluruh halaman & controller membaca/menulis ke store ini agar angka di seluruh panel konsisten.
 */

const DB_STORAGE_KEY = 'forgepro_central_mock_db_v2';

export interface MockDatabaseState {
  orders: ControllerOrderItem[];
  printPayments: PrintPayment[];
  packages: ControllerPackageItem[];
  styles: ControllerSuitStyleItem[];
  vouchers: ControllerVoucherItem[];
  admins: AdminMember[];
  adminSessions: AdminSessionDevice[];
  roleDefinitions: AdminRoleDefinition[];
  activityLogs: ActivityLogItem[];
  webhooks: WebhookItem[];
  complaints: ComplaintTicket[];
  aiJobs: AiQueueJob[];
  blockedPrompts: BlockedPromptLog[];
  bannedKeywords: string[];
  messageTemplates: MessageTemplateItem[];
  sentMessages: SentMessageLog[];
  legalDocuments: LegalDocumentItem[];
  consentLogs: CustomerConsentLog[];
  privacyDeletionJobs: PrivacyDeletionJob[];
  privacyManualRequests: PrivacyManualDeletionRequest[];
  notifications: AdminNotificationItem[];
}

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

export const SEED_VOUCHERS: ControllerVoucherItem[] = [
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

export const SEED_ADMINS: AdminMember[] = [
  {
    id: 'adm-1',
    name: 'Andi Prasetyo',
    email: 'andi@forgepro.id',
    role: 'Admin Utama',
    access: 'Seluruh menu',
    status: 'Aktif',
    lastActive: '19 Okt, 16:20 WIB',
    actionLabel: 'Kelola',
    phone: '+62 812-3456-7890',
    twoFactorEnabled: true,
  },
  {
    id: 'adm-2',
    name: 'Maya Lestari',
    email: 'maya@forgepro.id',
    role: 'Operasional',
    access: 'Pesanan, cetak & kirim',
    status: 'Aktif',
    lastActive: '19 Okt, 16:05 WIB',
    actionLabel: 'Kelola',
    phone: '+62 813-8811-2233',
    twoFactorEnabled: true,
  },
  {
    id: 'adm-3',
    name: 'Dimas Putra',
    email: 'dimas@forgepro.id',
    role: 'Produk',
    access: 'Katalog, paket & promo',
    status: 'Aktif',
    lastActive: '19 Okt, 15:42 WIB',
    actionLabel: 'Kelola',
    phone: '+62 811-4455-6677',
    twoFactorEnabled: true,
  },
  {
    id: 'adm-4',
    name: 'Sinta Dewi',
    email: 'sinta@forgepro.id',
    role: 'Keuangan',
    access: 'Transaksi & ekspor',
    status: 'Aktif',
    lastActive: '19 Okt, 14:58 WIB',
    actionLabel: 'Kelola',
    phone: '+62 815-9900-1122',
    twoFactorEnabled: true,
  },
  {
    id: 'adm-5',
    name: 'Raka Wijaya',
    email: 'raka@forgepro.id',
    role: 'Operasional',
    access: 'Pesanan, cetak & kirim',
    status: 'Diundang',
    lastActive: 'Belum pernah masuk',
    actionLabel: 'Kirim ulang',
    invitedAtWib: '19 Okt 2026, 13:40 WIB',
    inviteExpiresAtWib: '22 Okt 2026, 13:40 WIB',
    inviteToken: 'inv_forgepro_raka_99281a',
    twoFactorEnabled: false,
  },
  {
    id: 'adm-6',
    name: 'Laras Putri',
    email: 'laras@forgepro.id',
    role: 'Produk',
    access: 'Tidak ada akses',
    status: 'Nonaktif',
    lastActive: '12 Okt, 10:15 WIB',
    actionLabel: 'Kelola',
    twoFactorEnabled: false,
  },
];

export const SEED_ADMIN_SESSIONS: AdminSessionDevice[] = [
  {
    id: 'sess-1',
    adminEmail: 'andi@forgepro.id',
    deviceLabel: 'Chrome • macOS (Jakarta)',
    browser: 'Chrome 130.0',
    os: 'macOS Sequoia',
    ipAddress: '103.144.12.88',
    location: 'Jakarta Selatan, ID',
    lastActiveWib: '19 Okt 2026, 16:20 WIB',
    isCurrent: true,
  },
  {
    id: 'sess-2',
    adminEmail: 'maya@forgepro.id',
    deviceLabel: 'Edge • Windows 11 (Jakarta)',
    browser: 'Edge 130.0',
    os: 'Windows 11 Pro',
    ipAddress: '114.122.40.19',
    location: 'Jakarta Pusat, ID',
    lastActiveWib: '19 Okt 2026, 16:05 WIB',
    isCurrent: false,
  },
];

export const SEED_ROLE_DEFINITIONS: AdminRoleDefinition[] = [
  {
    role: 'Admin Utama',
    description:
      'Akses penuh ke seluruh operasional, katalog, keuangan, keamanan, dan manajemen tim.',
    summaryAccess: 'Seluruh menu',
    permissions: [
      {
        moduleId: 'operasional',
        moduleName: 'Operasional (Pesanan, Cetak, Komplain, AI)',
        actions: { lihat: true, buat: true, ubah: true, hapus: true, ekspor: true, refund: true },
      },
      {
        moduleId: 'katalog',
        moduleName: 'Katalog & Produk (Jas, Paket, Voucher)',
        actions: { lihat: true, buat: true, ubah: true, hapus: true, ekspor: true, refund: false },
      },
      {
        moduleId: 'keuangan',
        moduleName: 'Keuangan & Analitik',
        actions: { lihat: true, buat: true, ubah: true, hapus: false, ekspor: true, refund: true },
      },
      {
        moduleId: 'sistem',
        moduleName: 'Sistem, Admin & Pengaturan',
        actions: { lihat: true, buat: true, ubah: true, hapus: true, ekspor: true, refund: false },
      },
    ],
  },
  {
    role: 'Operasional',
    description:
      'Menangani pesanan harian, antrean AI, komplain pelanggan, serta produksi cetak & pengiriman.',
    summaryAccess: 'Pesanan, cetak & kirim',
    permissions: [
      {
        moduleId: 'operasional',
        moduleName: 'Operasional (Pesanan, Cetak, Komplain, AI)',
        actions: { lihat: true, buat: true, ubah: true, hapus: false, ekspor: true, refund: false },
      },
      {
        moduleId: 'katalog',
        moduleName: 'Katalog & Produk (Jas, Paket, Voucher)',
        actions: { lihat: true, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
      {
        moduleId: 'keuangan',
        moduleName: 'Keuangan & Analitik',
        actions: { lihat: false, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
      {
        moduleId: 'sistem',
        moduleName: 'Sistem, Admin & Pengaturan',
        actions: { lihat: false, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
    ],
  },
  {
    role: 'Produk',
    description:
      'Mengelola katalog gaya jas, prompt FLUX, paket harga referensi, dan kampanye voucher promo.',
    summaryAccess: 'Katalog, paket & promo',
    permissions: [
      {
        moduleId: 'operasional',
        moduleName: 'Operasional (Pesanan, Cetak, Komplain, AI)',
        actions: { lihat: true, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
      {
        moduleId: 'katalog',
        moduleName: 'Katalog & Produk (Jas, Paket, Voucher)',
        actions: { lihat: true, buat: true, ubah: true, hapus: false, ekspor: true, refund: false },
      },
      {
        moduleId: 'keuangan',
        moduleName: 'Keuangan & Analitik',
        actions: { lihat: true, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
      {
        moduleId: 'sistem',
        moduleName: 'Sistem, Admin & Pengaturan',
        actions: { lihat: false, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
    ],
  },
  {
    role: 'Keuangan',
    description:
      'Rekonsiliasi transaksi Google Play Billing, pembayaran cetak fisik, refund, dan ekspor laporan pajak.',
    summaryAccess: 'Transaksi & ekspor',
    permissions: [
      {
        moduleId: 'operasional',
        moduleName: 'Operasional (Pesanan, Cetak, Komplain, AI)',
        actions: { lihat: true, buat: false, ubah: false, hapus: false, ekspor: true, refund: true },
      },
      {
        moduleId: 'katalog',
        moduleName: 'Katalog & Produk (Jas, Paket, Voucher)',
        actions: { lihat: true, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
      {
        moduleId: 'keuangan',
        moduleName: 'Keuangan & Analitik',
        actions: { lihat: true, buat: true, ubah: true, hapus: false, ekspor: true, refund: true },
      },
      {
        moduleId: 'sistem',
        moduleName: 'Sistem, Admin & Pengaturan',
        actions: { lihat: false, buat: false, ubah: false, hapus: false, ekspor: false, refund: false },
      },
    ],
  },
];

export const SEED_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act-1',
    time: '19 Okt, 16:12:08',
    source: 'Sistem',
    adminEmail: 'system@forgepro.id',
    category: 'Pesanan',
    activity: 'Pembayaran dikonfirmasi · PRO-20261019-001',
    result: 'Berhasil',
    ipAddress: '35.190.24.11',
    userAgent: 'Google-Play-RTDN/1.0',
    requestId: 'req_99102a8f',
    targetId: 'PRO-20261019-001',
    beforeData: { paymentStatus: 'Menunggu' },
    afterData: { paymentStatus: 'Dibayar' },
  },
  {
    id: 'act-2',
    time: '19 Okt, 15:28:41',
    source: 'Maya Lestari',
    adminEmail: 'maya@forgepro.id',
    category: 'Pesanan',
    activity: 'Memulai proses foto · PRO-20261019-003',
    result: 'Berhasil',
    ipAddress: '114.122.40.19',
    userAgent: 'Edge 130.0 • Windows 11',
    requestId: 'req_88219c3d',
    targetId: 'PRO-20261019-003',
    beforeData: { photoStatus: 'Belum mulai' },
    afterData: { photoStatus: 'Diproses', model: 'fal-ai/flux-pro/v1.1' },
  },
  {
    id: 'act-3',
    time: '19 Okt, 14:20:15',
    source: 'Dimas Putra',
    adminEmail: 'dimas@forgepro.id',
    category: 'Katalog',
    activity: 'Memperbarui gaya · Navy Eksekutif',
    result: 'Berhasil',
    ipAddress: '103.28.14.90',
    userAgent: 'Chrome 130.0 • macOS',
    requestId: 'req_77401b2e',
    targetId: 'navy-eksekutif',
    beforeData: { isPopular: false },
    afterData: { isPopular: true, status: 'Tayang' },
  },
  {
    id: 'act-4',
    time: '19 Okt, 13:40:02',
    source: 'Andi Prasetyo',
    adminEmail: 'andi@forgepro.id',
    category: 'Admin',
    activity: 'Mengundang admin · raka@forgepro.id',
    result: 'Berhasil',
    ipAddress: '103.144.12.88',
    userAgent: 'Chrome 130.0 • macOS',
    requestId: 'req_66190f1a',
    targetId: 'raka@forgepro.id',
    beforeData: {},
    afterData: { email: 'raka@forgepro.id', role: 'Operasional', status: 'Diundang' },
  },
];

export const SEED_WEBHOOKS: WebhookItem[] = [
  {
    id: 'wh-1',
    time: '19 Okt, 16:12:09',
    eventName: 'purchase.verified',
    eventTitle: 'Pembayaran berhasil',
    eventSub: 'purchase.verified · PRO-20261019-001',
    orderNumber: 'PRO-20261019-001',
    targetUrl: 'https://ops.forgepro.example/webhooks/forgepro',
    statusBadge: '200 · Berhasil',
    statusType: 'success',
    httpStatus: 200,
    latency: '248 ms',
    attempts: `1 dari ${BUSINESS_CONFIG.webhookPolicy.maxRetries}`,
    attemptCount: 1,
    maxAttempts: BUSINESS_CONFIG.webhookPolicy.maxRetries,
    actionLabel: 'Detail',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-ForgePro-Event': 'purchase.verified',
      'X-ForgePro-Signature': 't=1760865129,v1=9f86d081884c7d659a2feaa0c55ad015',
    },
    requestPayload: {
      event: 'purchase.verified',
      orderNumber: 'PRO-20261019-001',
      packageSku: 'forgepro_profesional',
      amountRp: 99000,
    },
    responseBody: '{"received":true,"status":"ok"}',
  },
  {
    id: 'wh-2',
    time: '19 Okt, 15:20:04',
    eventName: 'ai.processing',
    eventTitle: 'Antrean render foto dimulai',
    eventSub: 'ai.processing · PRO-20261019-003',
    orderNumber: 'PRO-20261019-003',
    targetUrl: 'https://ops.forgepro.example/webhooks/forgepro',
    statusBadge: '504 · Gagal',
    statusType: 'error',
    httpStatus: 504,
    latency: 'Batas waktu habis',
    attempts: `2 dari ${BUSINESS_CONFIG.webhookPolicy.maxRetries}`,
    attemptCount: 2,
    maxAttempts: BUSINESS_CONFIG.webhookPolicy.maxRetries,
    actionLabel: 'Coba ulang',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-ForgePro-Event': 'ai.processing',
    },
    requestPayload: {
      event: 'ai.processing',
      orderNumber: 'PRO-20261019-003',
      styleId: 'tuxedo-hitam',
    },
    responseBody: '{"error":"Gateway Timeout after 10000ms"}',
  },
  {
    id: 'wh-3',
    time: '19 Okt, 14:55:18',
    eventName: 'ai.completed',
    eventTitle: 'Foto selesai digenerate',
    eventSub: 'ai.completed · PRO-20261019-004',
    orderNumber: 'PRO-20261019-004',
    targetUrl: 'https://ops.forgepro.example/webhooks/forgepro',
    statusBadge: '200 · Berhasil',
    statusType: 'success',
    httpStatus: 200,
    latency: '182 ms',
    attempts: `1 dari ${BUSINESS_CONFIG.webhookPolicy.maxRetries}`,
    attemptCount: 1,
    maxAttempts: BUSINESS_CONFIG.webhookPolicy.maxRetries,
    actionLabel: 'Detail',
    requestPayload: {
      event: 'ai.completed',
      orderNumber: 'PRO-20261019-004',
      photoCount: 24,
      downloadExpiresInDays: 14,
    },
    responseBody: '{"received":true,"emailQueued":true}',
  },
];

export const SEED_PRINT_PAYMENTS: PrintPayment[] = [
  {
    id: 'pay-pr-003',
    orderNumber: 'PRO-20261019-003',
    provider: 'midtrans',
    channelLabel: 'QRIS Dinamis',
    externalRefId: 'MID-PR-20261019003',
    paymentUrl: 'https://pay.forgepro.id/invoice/MID-PR-20261019003',
    printCostRp: 35000,
    shippingCostRp: 15000,
    gatewayFeeRp: 750,
    totalAmountRp: 50750,
    status: 'menunggu',
    expiresAt: '2026-10-20T17:30:00.000Z',
  },
  {
    id: 'pay-pr-007',
    orderNumber: 'PRO-20261018-007',
    provider: 'xendit',
    channelLabel: 'BCA Virtual Account',
    externalRefId: 'XEN-PR-20261018007',
    paymentUrl: 'https://pay.forgepro.id/invoice/XEN-PR-20261018007',
    printCostRp: 25000,
    shippingCostRp: 15000,
    gatewayFeeRp: 2000,
    totalAmountRp: 42000,
    status: 'dibayar',
    paidAt: '2026-10-18T19:55:10.000Z',
    expiresAt: '2026-10-19T19:30:00.000Z',
  },
  {
    id: 'pay-pr-008',
    orderNumber: 'PRO-20261017-008',
    provider: 'midtrans',
    channelLabel: 'GoPay / QRIS',
    externalRefId: 'MID-PR-20261017008',
    paymentUrl: 'https://pay.forgepro.id/invoice/MID-PR-20261017008',
    printCostRp: 25000,
    shippingCostRp: 12000,
    gatewayFeeRp: 740,
    totalAmountRp: 37740,
    status: 'dibayar',
    paidAt: '2026-10-17T11:28:44.000Z',
    expiresAt: '2026-10-18T11:20:00.000Z',
  },
  {
    id: 'pay-pr-009',
    orderNumber: 'PRO-20261017-009',
    provider: 'xendit',
    channelLabel: 'Mandiri Virtual Account',
    externalRefId: 'XEN-PR-20261017009',
    paymentUrl: 'https://pay.forgepro.id/invoice/XEN-PR-20261017009',
    printCostRp: 35000,
    shippingCostRp: 18000,
    gatewayFeeRp: 2000,
    totalAmountRp: 55000,
    status: 'dibayar',
    paidAt: '2026-10-17T09:22:15.000Z',
    expiresAt: '2026-10-18T09:15:00.000Z',
  },
  {
    id: 'pay-pr-010',
    orderNumber: 'PRO-20261017-010',
    provider: 'midtrans',
    channelLabel: 'ShopeePay',
    externalRefId: 'MID-PR-20261017010',
    paymentUrl: 'https://pay.forgepro.id/invoice/MID-PR-20261017010',
    printCostRp: 25000,
    shippingCostRp: 10000,
    gatewayFeeRp: 700,
    totalAmountRp: 35700,
    status: 'dibayar',
    paidAt: '2026-10-17T08:14:02.000Z',
    expiresAt: '2026-10-18T08:05:00.000Z',
  },
  {
    id: 'pay-pr-012',
    orderNumber: 'PRO-20261016-012',
    provider: 'midtrans',
    channelLabel: 'QRIS',
    externalRefId: 'MID-PR-20261016012',
    paymentUrl: 'https://pay.forgepro.id/invoice/MID-PR-20261016012',
    printCostRp: 25000,
    shippingCostRp: 15000,
    gatewayFeeRp: 800,
    totalAmountRp: 40800,
    status: 'kedaluwarsa',
    expiresAt: '2026-10-17T14:10:00.000Z',
  },
];

export const SEED_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'cmp-1',
    ticketNumber: 'TIK-20261019-001',
    orderNumber: 'PRO-20261018-005',
    customerEmail: 'bayu@mail.com',
    customerWhatsapp: '+62 812-9988-7766',
    category: 'pembayaran_ganda',
    categoryLabel: 'Pembayaran / Token Play',
    subject: 'Saldo terpotong tetapi status pesanan masih Gagal',
    description:
      'Pelanggan melampirkan bukti potong saldo Google Play Rp59.000, namun koneksi terputus saat aplikasi mengirim purchaseToken.',
    status: 'Baru',
    priority: 'Tinggi',
    createdAtWib: '19 Okt 2026, 13:50 WIB',
    updatedAtWib: '19 Okt 2026, 13:50 WIB',
    assignedTo: 'Maya Lestari',
    replies: [
      {
        id: 'rep-1',
        sender: 'customer',
        senderName: 'Bayu Santoso',
        message:
          'Halo tim admin ForgePro, saldo Google Play saya sudah terpotong Rp59.000 dengan Order ID GPA.3312-4982-1192-38195, tetapi di aplikasi statusnya Gagal karena WiFi terputus. Mohon bantuannya verifikasi.',
        timestampWib: '19 Okt 2026, 13:50 WIB',
      },
    ],
  },
  {
    id: 'cmp-2',
    ticketNumber: 'TIK-20261019-002',
    orderNumber: 'PRO-20261019-003',
    customerEmail: 'rizky@mail.com',
    customerWhatsapp: '+62 813-9876-5432',
    category: 'wajah_kurang_mirip',
    categoryLabel: 'Hasil AI kurang mirip',
    subject: 'Meminta regenerasi 5 foto karena kacamata tidak ikut ter-render',
    description:
      'Pelanggan memakai kacamata tipis pada selfie awal namun di beberapa hasil jas eksekutif kacamata hilang.',
    status: 'Ditinjau',
    priority: 'Normal',
    createdAtWib: '19 Okt 2026, 15:40 WIB',
    updatedAtWib: '19 Okt 2026, 15:55 WIB',
    assignedTo: 'Maya Lestari',
    resolutionType: 'regenerasi_gratis',
    resolutionNote: 'Dijadwalkan regenerasi ulang dengan tambahan prompt kacamata.',
    replies: [
      {
        id: 'rep-2',
        sender: 'customer',
        senderName: 'Rizky Pratama',
        message:
          'Kacamata di selfie saya tidak terlihat di beberapa hasil jas eksekutif. Mohon bantu render ulang 5 foto.',
        timestampWib: '19 Okt 2026, 15:40 WIB',
      },
      {
        id: 'rep-3',
        sender: 'admin',
        senderName: 'Maya Lestari',
        message:
          'Halo Kak Rizky, kami sudah memeriksa dan menambahkan penekanan atribut kacamata pada antrean render AI. Mohon ditunggu dalam beberapa menit.',
        timestampWib: '19 Okt 2026, 15:55 WIB',
      },
    ],
  },
  {
    id: 'cmp-3',
    ticketNumber: 'TIK-20261018-003',
    orderNumber: 'PRO-20261018-007',
    customerEmail: 'fajar@mail.com',
    customerWhatsapp: '+62 878-1234-5678',
    category: 'cetak_rusak_terlambat',
    categoryLabel: 'Cetak fisik & pengiriman',
    subject: 'Perubahan ukuran cetak ke 4x6 cm sebelum dikirim',
    description: 'Pelanggan meminta penyesuaian ukuran cetak untuk keperluan pemberkasan perusahaan.',
    status: 'Selesai',
    priority: 'Normal',
    createdAtWib: '18 Okt 2026, 16:30 WIB',
    updatedAtWib: '18 Okt 2026, 17:10 WIB',
    assignedTo: 'Maya Lestari',
    resolutionType: 'cetak_ulang',
    resolutionNote: 'Ukuran cetak telah disesuaikan menjadi 4x6 cm (4 lembar).',
    replies: [
      {
        id: 'rep-4',
        sender: 'customer',
        senderName: 'Fajar Nugroho',
        message:
          'Tolong ubah ukuran cetak fisik dari 3x4 ke 4x6 cm sebelum dikirim, untuk keperluan berkas BUMN.',
        timestampWib: '18 Okt 2026, 16:30 WIB',
      },
      {
        id: 'rep-5',
        sender: 'admin',
        senderName: 'Maya Lestari',
        message:
          'Baik Kak Fajar, ukuran cetak sudah berhasil disesuaikan menjadi 4x6 cm (4 lembar) pada mesin cetak kami.',
        timestampWib: '18 Okt 2026, 17:10 WIB',
      },
    ],
  },
  {
    id: 'cmp-4',
    ticketNumber: 'TIK-20261017-004',
    orderNumber: 'PRO-20261016-011',
    customerEmail: 'doni.pratama99@gmail.com',
    customerWhatsapp: '+62 856-4433-2211',
    category: 'wajah_kurang_mirip',
    categoryLabel: 'Moderasi Prompt AI',
    subject: 'Prompt ditahan oleh filter keselamatan AI',
    description: 'Prompt mengandung kata kunci tokoh publik/seragam militer sehingga memerlukan persetujuan manual.',
    status: 'Ditinjau',
    priority: 'Tinggi',
    createdAtWib: '17 Okt 2026, 16:40 WIB',
    updatedAtWib: '17 Okt 2026, 17:05 WIB',
    assignedTo: 'Maya Lestari',
    replies: [
      {
        id: 'rep-6',
        sender: 'customer',
        senderName: 'Doni Pratama',
        message:
          'Kenapa pesanan saya PRO-20261016-011 belum selesai di-generate padahal sudah bayar?',
        timestampWib: '17 Okt 2026, 16:40 WIB',
      },
      {
        id: 'rep-7',
        sender: 'admin',
        senderName: 'Maya Lestari',
        message:
          'Prompt Anda mengandung istilah spesifik seragam institusi negara yang otomatis memerlukan review kepatuhan Google Play. Tim kami sedang meninjau visualnya.',
        timestampWib: '17 Okt 2026, 17:05 WIB',
      },
    ],
  },
  {
    id: 'cmp-5',
    ticketNumber: 'TIK-20261018-005',
    orderNumber: 'PRO-20261017-010',
    customerEmail: 'kevin.sanjaya@startup.id',
    customerWhatsapp: '+62 812-7788-9911',
    category: 'gagal_unduh',
    categoryLabel: 'Tautan unduh kedaluwarsa / gagal',
    subject: 'Email tautan unduhan masuk ke folder spam',
    description: 'Pelanggan belum menerima email galeri hasil foto AI.',
    status: 'Selesai',
    priority: 'Rendah',
    createdAtWib: '18 Okt 2026, 14:00 WIB',
    updatedAtWib: '18 Okt 2026, 14:15 WIB',
    assignedTo: 'Maya Lestari',
    resolutionNote: 'Tautan unduh telah dikirim ulang via Email dan WhatsApp.',
    replies: [
      {
        id: 'rep-8',
        sender: 'customer',
        senderName: 'Kevin Sanjaya',
        message: 'Saya belum terima email tautan download hasil foto.',
        timestampWib: '18 Okt 2026, 14:00 WIB',
      },
      {
        id: 'rep-9',
        sender: 'admin',
        senderName: 'Maya Lestari',
        message:
          'Tautan telah kami kirimkan ulang ke WhatsApp dan email terdaftar. Sudah terkonfirmasi dapat diakses.',
        timestampWib: '18 Okt 2026, 14:15 WIB',
      },
    ],
  },
];

export const SEED_AI_JOBS: AiQueueJob[] = [
  {
    id: 'job-01',
    jobCode: 'FLUX-261019-001',
    orderNumber: 'PRO-20261019-001',
    customerEmail: 'aditya@mail.com',
    packageName: 'Profesional',
    styleId: 'navy-eksekutif',
    styleName: 'Navy Eksekutif',
    modelName: 'fal-ai/flux-pro/v1.1',
    photoTargetCount: 24,
    photosGenerated: 24,
    durationSeconds: 38,
    estimatedCostRp: 24 * BUSINESS_CONFIG.costAssumptions.falAiCostPerPhotoRp,
    status: 'Selesai',
    customPrompt: 'Pencahayaan Rembrandt studio foto profesional',
    workerNode: 'fal-sg-gpu-01',
    createdAtWib: '19 Okt, 16:12 WIB',
    completedAtWib: '19 Okt, 16:13 WIB',
  },
  {
    id: 'job-02',
    jobCode: 'FLUX-261019-003',
    orderNumber: 'PRO-20261019-003',
    customerEmail: 'rizky@mail.com',
    packageName: 'Eksklusif',
    styleId: 'tuxedo-hitam',
    styleName: 'Tuxedo Hitam & Charcoal Klasik',
    modelName: 'fal-ai/flux-pro/v1.1-ultra',
    photoTargetCount: 48,
    photosGenerated: 24,
    durationSeconds: null,
    estimatedCostRp: 48 * BUSINESS_CONFIG.costAssumptions.falAiCostPerPhotoRp,
    status: 'Diproses',
    customPrompt: 'Potret eksekutif C-Level untuk majalah bisnis',
    workerNode: 'fal-sg-gpu-03',
    createdAtWib: '19 Okt, 15:20 WIB',
  },
  {
    id: 'job-03',
    jobCode: 'FLUX-261019-004',
    orderNumber: 'PRO-20261019-004',
    customerEmail: 'dewi.a@mail.com',
    packageName: 'Profesional',
    styleId: 'charcoal-pinstripe-wanita',
    styleName: 'Charcoal Pinstripe Advokat',
    modelName: 'fal-ai/flux-pro/v1.1',
    photoTargetCount: 24,
    photosGenerated: 24,
    durationSeconds: 41,
    estimatedCostRp: 24 * BUSINESS_CONFIG.costAssumptions.falAiCostPerPhotoRp,
    status: 'Selesai',
    customPrompt: 'Pasfoto formal untuk sertifikasi advokat dan ijazah',
    workerNode: 'fal-sg-gpu-01',
    createdAtWib: '19 Okt, 14:55 WIB',
    completedAtWib: '19 Okt, 14:56 WIB',
  },
  {
    id: 'job-04',
    jobCode: 'FLUX-261016-011',
    orderNumber: 'PRO-20261016-011',
    customerEmail: 'doni.pratama99@gmail.com',
    packageName: 'Profesional',
    styleId: 'double-breasted-navy',
    styleName: 'Double Breasted Navy',
    modelName: 'fal-ai/flux-pro/v1.1',
    photoTargetCount: 24,
    photosGenerated: 0,
    durationSeconds: null,
    estimatedCostRp: 24 * BUSINESS_CONFIG.costAssumptions.falAiCostPerPhotoRp,
    status: 'Perlu ditinjau',
    customPrompt: 'Mirip tokoh politik terkenal dengan seragam militer resmi',
    flaggedKeywords: ['tokoh politik', 'seragam militer'],
    workerNode: 'moderation-gate',
    createdAtWib: '16 Okt, 15:30 WIB',
  },
];

export const SEED_BLOCKED_PROMPTS: BlockedPromptLog[] = [
  {
    id: 'blk-1',
    orderNumber: 'PRO-20261016-011',
    customerEmail: 'doni.pratama99@gmail.com',
    rawPrompt: 'Mirip tokoh politik terkenal dengan seragam militer resmi',
    matchedWords: ['tokoh politik', 'seragam militer'],
    actionTaken: 'Ditahan untuk tinjauan',
    timeWib: '16 Okt 2026, 15:30 WIB',
  },
];

export const SEED_BANNED_KEYWORDS: string[] = [
  'nsfw',
  'nude',
  'telanjang',
  'kekerasan',
  'darah',
  'senjata',
  'seragam militer',
  'seragam polisi',
  'tokoh politik',
  'presiden',
  'deepfake selebriti',
];

export const SEED_MESSAGE_TEMPLATES: MessageTemplateItem[] = [
  {
    id: 'tpl-1',
    slug: 'order_confirmed',
    name: 'Konfirmasi Pesanan & Pembayaran',
    channel: 'Email',
    triggerEvent: 'purchase.verified',
    subject: 'Pesanan {{nomor_pesanan}} Diterima — Foto AI Anda Sedang Diproses',
    bodyTemplate:
      'Halo {{nama_pelanggan}},\n\nTerima kasih telah memilih ForgePro.id. Pembayaran paket {{nama_paket}} untuk nomor pesanan {{nomor_pesanan}} telah kami terima.\n\nFoto profesional AI Anda sedang diproses dan tautan unduhan akan aktif selama {{masa_unduh}}.',
    variables: ['{{nama_pelanggan}}', '{{nomor_pesanan}}', '{{nama_paket}}', '{{masa_unduh}}'],
    status: 'Aktif',
    lastUpdatedWib: '15 Okt 2026, 10:00 WIB',
  },
  {
    id: 'tpl-2',
    slug: 'ai_completed_ready',
    name: 'Hasil Foto AI Siap Diunduh',
    channel: 'Email',
    triggerEvent: 'ai.completed',
    subject: 'Foto Profesional AI Anda Siap Diunduh ({{nomor_pesanan}})',
    bodyTemplate:
      'Halo {{nama_pelanggan}},\n\nSeluruh foto paket {{nama_paket}} Anda telah selesai diproses! Silakan unduh melalui tautan berikut:\n{{link_unduh}}\n\nTautan berlaku selama {{masa_unduh}}. Sesuai UU PDP No. 27/2022, foto selfie awal Anda akan dihapus otomatis dalam 24 jam.',
    variables: [
      '{{nama_pelanggan}}',
      '{{nomor_pesanan}}',
      '{{nama_paket}}',
      '{{link_unduh}}',
      '{{masa_unduh}}',
    ],
    status: 'Aktif',
    lastUpdatedWib: '16 Okt 2026, 14:20 WIB',
  },
];

export const SEED_SENT_MESSAGES: SentMessageLog[] = [
  {
    id: 'msg-1',
    timeWib: '19 Okt 2026, 16:13 WIB',
    orderNumber: 'PRO-20261019-001',
    recipient: 'aditya@mail.com',
    channel: 'Email',
    templateName: 'Hasil Foto AI Siap Diunduh',
    status: 'Terkirim',
  },
];

export const SEED_LEGAL_DOCUMENTS: LegalDocumentItem[] = [
  {
    id: 'leg-1',
    slug: 'privacy',
    title: 'Kebijakan Privasi & Pelindungan Data Pribadi (UU PDP)',
    version: 'v2.1',
    effectiveDateWib: '1 Oktober 2026',
    updatedBy: 'Andi Prasetyo',
    status: 'Tayang',
    summary:
      'Mengatur pemrosesan data biometrik wajah, penghapusan otomatis foto selfie dalam 24 jam, dan masa simpan hasil AI.',
    contentMarkdown:
      '# Kebijakan Privasi ForgePro.id\n\nSesuai **UU Pelindungan Data Pribadi No. 27 Tahun 2022**, foto selfie asli dihapus otomatis maksimal 24 jam setelah diunggah.',
  },
];

export const SEED_CONSENT_LOGS: CustomerConsentLog[] = [
  {
    id: 'cns-1',
    orderNumber: 'PRO-20261019-001',
    customerEmail: 'aditya@mail.com',
    termsVersion: 'v2.0',
    privacyVersion: 'v2.1',
    consentedAtWib: '19 Okt 2026, 16:11 WIB',
    ipMasked: '103.144.***.***',
    deviceInfo: 'Flutter Android • Samsung S24',
  },
];

export const SEED_PRIVACY_DELETION_JOBS: PrivacyDeletionJob[] = [
  {
    id: 'del-1',
    batchCode: 'PDP-AUTO-20261019-01',
    executedAtWib: '19 Okt 2026, 16:00 WIB',
    targetType: 'Selfie pelanggan (> 24 jam)',
    deletedCount: 18,
    status: 'Berhasil',
    notes: 'Penghapusan otomatis bucket s3://forgepro-selfie-temp untuk pesanan 18 Okt 2026.',
  },
];

export const SEED_PRIVACY_MANUAL_REQUESTS: PrivacyManualDeletionRequest[] = [
  {
    id: 'pdp-req-1',
    requestNumber: 'PDP-REQ-20261019-01',
    customerEmail: 'bima.saputra@mail.com',
    orderNumber: 'PRO-20261017-009',
    reason: 'Sudah mengunduh seluruh foto dan meminta penghapusan lebih awal dari server.',
    requestedAtWib: '19 Okt 2026, 14:30 WIB',
    status: 'Menunggu',
  },
];

export const SEED_NOTIFICATIONS: AdminNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Prompt pelanggan perlu ditinjau',
    description: 'PRO-20261016-011 mengandung kata kunci sensitif ("tokoh politik").',
    category: 'ai',
    severity: 'warning',
    timeWib: '10 menit lalu',
    read: false,
    targetPath: '/pesanan',
    referenceId: 'PRO-20261016-011',
  },
  {
    id: 'notif-2',
    title: 'Webhook gagal terkirim (504)',
    description: 'Event ai.processing untuk PRO-20261019-003 gagal pada percobaan ke-2.',
    category: 'webhook',
    severity: 'error',
    timeWib: '25 menit lalu',
    read: false,
    targetPath: '/log-aktivitas',
    referenceId: 'wh-2',
  },
];

function computeDerivedState(
  orders: ControllerOrderItem[],
  styles: ControllerSuitStyleItem[],
  vouchers: ControllerVoucherItem[]
): { styles: ControllerSuitStyleItem[]; vouchers: ControllerVoucherItem[] } {
  const stylePhotoMap = new Map<string, number>();
  const voucherUseMap = new Map<string, number>();

  for (const ord of orders) {
    if (ord.paymentStatus === 'Dibayar') {
      const tplList =
        Array.isArray(ord.templateIds) && ord.templateIds.length > 0
          ? ord.templateIds
          : [];
      const perStylePhotos =
        tplList.length > 0
          ? Math.max(1, Math.round((ord.photoCount || 12) / tplList.length))
          : 0;
      for (const tplId of tplList) {
        stylePhotoMap.set(tplId, (stylePhotoMap.get(tplId) ?? 0) + perStylePhotos);
      }
    }
    if (ord.voucherCode && ord.paymentStatus !== 'Gagal') {
      const code = ord.voucherCode.toUpperCase();
      voucherUseMap.set(code, (voucherUseMap.get(code) ?? 0) + 1);
    }
  }

  return {
    styles: styles.map((style) => {
      const count = stylePhotoMap.get(style.id) ?? 0;
      return {
        ...style,
        count,
        stats:
          style.status === 'Tayang' ? `${count} foto dibuat` : 'Belum dipublikasikan',
      };
    }),
    vouchers: vouchers.map((v) => ({
      ...v,
      used: voucherUseMap.get(v.code.toUpperCase()) ?? 0,
    })),
  };
}

function buildInitialState(): MockDatabaseState {
  const orders = INITIAL_ORDERS.map((o) => ({
    ...o,
    templateIds: [...o.templateIds],
    results: o.results.map((r) => ({ ...r })),
  }));
  const derived = computeDerivedState(orders, INITIAL_SUIT_STYLES, SEED_VOUCHERS);

  return {
    orders,
    printPayments: SEED_PRINT_PAYMENTS.map((p) => ({ ...p })),
    packages: INITIAL_PACKAGES.map((p) => ({ ...p, features: [...p.features] })),
    styles: derived.styles,
    vouchers: derived.vouchers,
    admins: SEED_ADMINS.map((a) => ({ ...a })),
    adminSessions: SEED_ADMIN_SESSIONS.map((s) => ({ ...s })),
    roleDefinitions: SEED_ROLE_DEFINITIONS.map((r) => ({ ...r })),
    activityLogs: SEED_ACTIVITY_LOGS.map((l) => ({ ...l })),
    webhooks: SEED_WEBHOOKS.map((w) => ({ ...w })),
    complaints: SEED_COMPLAINTS.map((c) => ({ ...c })),
    aiJobs: SEED_AI_JOBS.map((j) => ({ ...j })),
    blockedPrompts: SEED_BLOCKED_PROMPTS.map((b) => ({ ...b })),
    bannedKeywords: [...SEED_BANNED_KEYWORDS],
    messageTemplates: SEED_MESSAGE_TEMPLATES.map((m) => ({ ...m })),
    sentMessages: SEED_SENT_MESSAGES.map((m) => ({ ...m })),
    legalDocuments: SEED_LEGAL_DOCUMENTS.map((d) => ({ ...d })),
    consentLogs: SEED_CONSENT_LOGS.map((c) => ({ ...c })),
    privacyDeletionJobs: SEED_PRIVACY_DELETION_JOBS.map((p) => ({ ...p })),
    privacyManualRequests: SEED_PRIVACY_MANUAL_REQUESTS.map((r) => ({ ...r })),
    notifications: SEED_NOTIFICATIONS.map((n) => ({ ...n })),
  };
}

class CentralMockDatabase {
  private state: MockDatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): MockDatabaseState {
    const initial = buildInitialState();
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(DB_STORAGE_KEY);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as Partial<MockDatabaseState>;
      const orders =
        Array.isArray(parsed.orders) && parsed.orders.length > 0
          ? parsed.orders
          : initial.orders;
      const printPayments =
        Array.isArray(parsed.printPayments) && parsed.printPayments.length > 0
          ? parsed.printPayments
          : initial.printPayments;
      const styles =
        Array.isArray(parsed.styles) && parsed.styles.length > 0
          ? parsed.styles
          : initial.styles;
      const vouchers =
        Array.isArray(parsed.vouchers) && parsed.vouchers.length > 0
          ? parsed.vouchers
          : initial.vouchers;
      const complaints =
        Array.isArray(parsed.complaints) && parsed.complaints.length > 0
          ? parsed.complaints
          : initial.complaints;
      const derived = computeDerivedState(orders, styles, vouchers);
      return {
        ...initial,
        ...parsed,
        orders,
        printPayments,
        complaints,
        packages:
          Array.isArray(parsed.packages) && parsed.packages.length > 0
            ? parsed.packages
            : initial.packages,
        styles: derived.styles,
        vouchers: derived.vouchers,
      };
    } catch {
      return initial;
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Abaikan jika kuota penuh
    }
  }

  public getState(): MockDatabaseState {
    return this.state;
  }

  public updateState(
    updater: (prev: MockDatabaseState) => MockDatabaseState,
    options: { recalculateDerived?: boolean } = { recalculateDerived: true }
  ): MockDatabaseState {
    const next = updater(this.state);
    if (options.recalculateDerived !== false) {
      const derived = computeDerivedState(next.orders, next.styles, next.vouchers);
      this.state = {
        ...next,
        styles: derived.styles,
        vouchers: derived.vouchers,
      };
    } else {
      this.state = next;
    }
    this.saveToStorage();
    this.emitChange();
    return this.state;
  }

  public appendActivityLog(
    entry: Omit<ActivityLogItem, 'id' | 'time'> & { time?: string }
  ): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      time: entry.time || `19 Okt, ${hours}:${mins}:${secs}`,
      ...entry,
    };
    this.state = {
      ...this.state,
      activityLogs: [newLog, ...this.state.activityLogs],
    };
    this.saveToStorage();
    this.emitChange();
  }

  public updatePrintPayment(
    orderNumber: string,
    update: Partial<PrintPayment>
  ): PrintPayment | null {
    let updated: PrintPayment | null = null;
    this.updateState((prev) => {
      const exists = prev.printPayments.find((p) => p.orderNumber === orderNumber);
      if (!exists) return prev;
      updated = { ...exists, ...update };
      return {
        ...prev,
        printPayments: prev.printPayments.map((p) =>
          p.orderNumber === orderNumber ? updated! : p
        ),
      };
    });
    return updated;
  }

  public updateComplaintTicket(
    idOrNumber: string,
    update: Partial<ComplaintTicket>
  ): ComplaintTicket | null {
    let updated: ComplaintTicket | null = null;
    this.updateState((prev) => {
      const exists = prev.complaints.find(
        (c) => c.id === idOrNumber || c.ticketNumber === idOrNumber
      );
      if (!exists) return prev;
      updated = {
        ...exists,
        ...update,
        updatedAtWib: `19 Okt 2026, ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} WIB`,
      };
      return {
        ...prev,
        complaints: prev.complaints.map((c) =>
          c.id === exists.id ? updated! : c
        ),
      };
    });
    return updated;
  }

  public addComplaintReply(
    idOrNumber: string,
    reply: {
      sender: 'admin' | 'customer' | 'system';
      senderName: string;
      message: string;
    }
  ): ComplaintTicket | null {
    let updated: ComplaintTicket | null = null;
    const nowWib = `19 Okt 2026, ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} WIB`;
    const newReplyItem = {
      id: `rep-${Date.now()}`,
      ...reply,
      timestampWib: nowWib,
    };
    this.updateState((prev) => {
      const exists = prev.complaints.find(
        (c) => c.id === idOrNumber || c.ticketNumber === idOrNumber
      );
      if (!exists) return prev;
      const currentReplies = exists.replies || [];
      updated = {
        ...exists,
        updatedAtWib: nowWib,
        replies: [...currentReplies, newReplyItem],
      };
      return {
        ...prev,
        complaints: prev.complaints.map((c) =>
          c.id === exists.id ? updated! : c
        ),
      };
    });
    return updated;
  }

  public addInternalOrderNote(
    orderNumber: string,
    note: string,
    author: string = 'Admin Utama'
  ): ControllerOrderItem | null {
    let updatedOrder: ControllerOrderItem | null = null;
    const nowWib = `19 Okt 2026, ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} WIB`;
    this.updateState((prev) => {
      const target = prev.orders.find(
        (o) => o.orderNumber === orderNumber || o.id === orderNumber
      );
      if (!target) return prev;
      const notes = target.internalNotes || [];
      const newNote = {
        id: `note-${Date.now()}`,
        author,
        note: note.trim(),
        timestamp: nowWib,
      };
      updatedOrder = {
        ...target,
        internalNotes: [newNote, ...notes],
      };
      return {
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === target.id ? updatedOrder! : o
        ),
      };
    });
    return updatedOrder;
  }

  public resetToSeed(): MockDatabaseState {
    this.state = buildInitialState();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DB_STORAGE_KEY);
      window.localStorage.removeItem('forgepro_orders_v3');
      window.localStorage.removeItem('forgepro_pricing_packages_v2');
      window.localStorage.removeItem('forgepro_suit_styles_v2');
      window.localStorage.removeItem('forgepro_vouchers_v1');
    }
    this.saveToStorage();
    this.emitChange();
    return this.state;
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emitChange(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const mockDb = new CentralMockDatabase();
