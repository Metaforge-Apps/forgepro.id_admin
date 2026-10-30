import type {
  PrintPaymentStatus,
  WebhookEventName,
} from '../config/business';

export type ThemeMode = 'dark' | 'light';

export interface AdminUser {
  id?: string;
  name: string;
  fullName?: string;
  email: string;
  primaryEmail?: string;
  role: string;
  avatarInitial: string;
  phone?: string;
  position?: string;
  locationCity?: string;
  timezone?: string;
  twoFactorEnabled?: boolean;
  loggedInAt?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

/** Teks umpan balik terpusat (Fase 0: 0.5, 0.8, 0.9). */
export interface BrandFeedbackTexts {
  savedSuccess: string;
  cancelledReset: string;
  saveErrorPrefix: string;
  retryButton: string;
  dirtyBadge: string;
  unsavedNavigationTitle: string;
  unsavedNavigationMessage: string;
  unsavedStayButton: string;
  unsavedLeaveButton: string;
  demoModeBanner: string;
  demoModeTooltip: string;
  resetDemoData: string;
  resetDemoSuccess: string;
}

/** Teks state kosong, error, dan konfirmasi umum (Fase 0: 0.4). */
export interface BrandCommonStateTexts {
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  errorDescription: string;
  confirmCancelLabel: string;
  confirmProceedLabel: string;
}

export interface BrandConfig {
  appName: string;
  appNamePrefix: string;
  appNameSuffix: string;
  tagline: string;
  description: string;
  version: string;
  logos: {
    horizontal: string;
    badge: string;
    loginHero: string;
  };
  defaultAdmin: AdminUser;
  defaultTheme: ThemeMode;
  dashboard: {
    categoryLabel: string;
    title: string;
    subtitle: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    submitLoading: string;
  };
  feedback: BrandFeedbackTexts;
  commonStates: BrandCommonStateTexts;
}

export interface PrintingItem {
  id: string;
  spec: string;
  recipient: string;
  address: string;
  status: 'Antre cetak' | 'Dicetak' | 'Siap dikirim' | 'Dikirim' | 'Diterima';
  courier: string;
  trackingNumber: string;
  actionText: string;
}

export type AdminRoleName = 'Admin Utama' | 'Operasional' | 'Produk' | 'Keuangan';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: AdminRoleName;
  access: string;
  status: 'Aktif' | 'Diundang' | 'Nonaktif';
  lastActive: string;
  actionLabel: string;
  phone?: string;
  twoFactorEnabled?: boolean;
  invitedAtWib?: string;
  inviteExpiresAtWib?: string;
  inviteToken?: string;
}

export interface AdminSessionDevice {
  id: string;
  adminEmail: string;
  deviceLabel: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActiveWib: string;
  isCurrent: boolean;
}

export type PermissionAction = 'lihat' | 'buat' | 'ubah' | 'hapus' | 'ekspor' | 'refund';

export interface RoleModulePermission {
  moduleId: string;
  moduleName: string;
  actions: Record<PermissionAction, boolean>;
}

export interface AdminRoleDefinition {
  role: AdminRoleName;
  description: string;
  summaryAccess: string;
  permissions: RoleModulePermission[];
}

export interface ActivityLogItem {
  id: string;
  time: string;
  source: string;
  category: 'Pesanan' | 'Katalog' | 'Admin' | 'Pengaturan' | 'Keuangan' | 'Privasi' | 'AI';
  activity: string;
  result: string;
  adminEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  targetId?: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
}

export interface WebhookItem {
  id: string;
  time: string;
  eventTitle: string;
  eventSub: string;
  statusBadge: string;
  statusType: 'success' | 'error';
  latency: string;
  attempts: string;
  actionLabel: string;
  eventName?: WebhookEventName;
  orderNumber?: string;
  targetUrl?: string;
  httpStatus?: number;
  attemptCount?: number;
  maxAttempts?: number;
  requestHeaders?: Record<string, string>;
  requestPayload?: Record<string, unknown>;
  responseBody?: string;
}

// ============================================================================
// Abstraksi pembayaran cetak fisik (di luar Google Play Billing)
// ============================================================================

export type PaymentGatewayProvider = 'midtrans' | 'xendit' | 'doku' | 'manual_qris';

export interface PrintPayment {
  id: string;
  orderNumber: string;
  provider: PaymentGatewayProvider;
  channelLabel: string;
  externalRefId: string;
  paymentUrl: string;
  printCostRp: number;
  shippingCostRp: number;
  gatewayFeeRp: number;
  totalAmountRp: number;
  status: PrintPaymentStatus;
  paidAt?: string;
  expiresAt: string;
}

export interface PaymentGatewayLinkPayload {
  orderNumber: string;
  customerEmail: string;
  recipientName: string;
  printCostRp: number;
  shippingCostRp: number;
  channelLabel?: string;
}

export interface PaymentGateway {
  provider: PaymentGatewayProvider;
  createPaymentLink(payload: PaymentGatewayLinkPayload): Promise<PrintPayment>;
  verifyPayment(printPaymentId: string): Promise<PrintPayment>;
  refundPayment(printPaymentId: string, reason: string): Promise<PrintPayment>;
}

// ============================================================================
// Model domain modul baru (Fase 3-6) — disiapkan di Fase 0 agar mock & API siap
// ============================================================================

export type ComplaintCategory =
  | 'wajah_kurang_mirip'
  | 'gagal_unduh'
  | 'pembayaran_ganda'
  | 'cetak_rusak_terlambat'
  | 'lainnya';

export type ComplaintStatus =
  | 'Baru'
  | 'Ditinjau'
  | 'Menunggu pelanggan'
  | 'Selesai'
  | 'Ditolak';

export type RefundResolutionType =
  | 'regenerasi_gratis'
  | 'voucher_kompensasi'
  | 'cetak_ulang'
  | 'refund_play'
  | 'refund_cetak'
  | 'ditolak';

export interface ComplaintTicket {
  id: string;
  ticketNumber: string;
  orderNumber: string;
  customerEmail: string;
  customerWhatsapp?: string;
  category: ComplaintCategory;
  categoryLabel: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: 'Tinggi' | 'Normal' | 'Rendah';
  createdAtWib: string;
  updatedAtWib: string;
  assignedTo: string;
  resolutionType?: RefundResolutionType;
  resolutionNote?: string;
  refundAmountRp?: number;
  compensationVoucherCode?: string;
}

export type AiJobStatus =
  | 'Antre'
  | 'Diproses'
  | 'Selesai'
  | 'Gagal'
  | 'Perlu ditinjau'
  | 'Dibatalkan';

export interface AiQueueJob {
  id: string;
  jobCode: string;
  orderNumber: string;
  customerEmail: string;
  packageName: string;
  styleId: string;
  styleName: string;
  modelName: string;
  photoTargetCount: number;
  photosGenerated: number;
  durationSeconds: number | null;
  estimatedCostRp: number;
  status: AiJobStatus;
  customPrompt?: string;
  flaggedKeywords?: string[];
  errorMessage?: string;
  workerNode: string;
  createdAtWib: string;
  completedAtWib?: string;
}

export interface BlockedPromptLog {
  id: string;
  orderNumber: string;
  customerEmail: string;
  rawPrompt: string;
  matchedWords: string[];
  actionTaken: 'Ditahan untuk tinjauan' | 'Ditolak otomatis' | 'Disetujui admin';
  timeWib: string;
}

export type MessageChannel = 'Email' | 'WhatsApp';

export interface MessageTemplateItem {
  id: string;
  slug: string;
  name: string;
  channel: MessageChannel;
  triggerEvent: string;
  subject: string;
  bodyTemplate: string;
  variables: string[];
  status: 'Aktif' | 'Draf';
  lastUpdatedWib: string;
}

export interface SentMessageLog {
  id: string;
  timeWib: string;
  orderNumber: string;
  recipient: string;
  channel: MessageChannel;
  templateName: string;
  status: 'Terkirim' | 'Gagal' | 'Menunggu';
  errorDetail?: string;
}

export interface LegalDocumentItem {
  id: string;
  slug: 'terms' | 'privacy' | 'refund_policy' | 'print_terms';
  title: string;
  version: string;
  effectiveDateWib: string;
  updatedBy: string;
  status: 'Tayang' | 'Draf';
  summary: string;
  contentMarkdown: string;
}

export interface CustomerConsentLog {
  id: string;
  orderNumber: string;
  customerEmail: string;
  termsVersion: string;
  privacyVersion: string;
  consentedAtWib: string;
  ipMasked: string;
  deviceInfo: string;
}

export interface PrivacyDeletionJob {
  id: string;
  batchCode: string;
  executedAtWib: string;
  targetType: 'Selfie pelanggan (> 24 jam)' | 'Hasil AI kedaluwarsa' | 'Permintaan manual UU PDP';
  deletedCount: number;
  status: 'Berhasil' | 'Sebagian gagal' | 'Menunggu';
  notes: string;
}

export interface PrivacyManualDeletionRequest {
  id: string;
  requestNumber: string;
  customerEmail: string;
  orderNumber: string;
  reason: string;
  requestedAtWib: string;
  status: 'Menunggu' | 'Diproses' | 'Selesai dihapus';
  completedAtWib?: string;
  processedBy?: string;
}

export interface AdminNotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'pesanan' | 'ai' | 'cetak' | 'webhook' | 'komplain';
  severity: 'info' | 'warning' | 'error' | 'success';
  timeWib: string;
  read: boolean;
  targetPath: string;
  referenceId?: string;
}

export * from '../controllers/style-controller/style.types';
export * from '../controllers/package-controller/package.types';
export * from '../controllers/voucher-controller/voucher.types';
export * from '../controllers/order-controller/order.types';
