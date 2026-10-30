import { BUSINESS_CONFIG, isMockMode } from '../config/business';
import type {
  PaymentGateway,
  PaymentGatewayLinkPayload,
  PrintPayment,
} from '../types';

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  idempotencyKey?: string;
}

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function getCsrfToken(): string {
  if (typeof document === 'undefined') return 'mock-csrf-token';
  const match = document.cookie.match(/(?:^|;\s*)forgepro_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : 'forgepro-csrf-local';
}

export function generateIdempotencyKey(prefix = 'idemp'): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

/**
 * Simulasi jeda jaringan (200-400 ms) saat berjalan di mode mock
 */
export async function simulateNetworkDelay(ms = 220): Promise<void> {
  if (!isMockMode()) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTP Client Terpusat ForgePro.id (Fase 0: 0.1)
 * Mendukung credentials: 'include', header X-CSRF-Token, Idempotency-Key untuk aksi finansial,
 * dan pemetaan error standar (401, 403, 409, 429).
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, idempotencyKey, headers: customHeaders, ...rest } = options;
  const method = (rest.method || 'GET').toUpperCase();

  const headers = new Headers(customHeaders);
  headers.set('Accept', 'application/json');

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers.set('X-CSRF-Token', getCsrfToken());
    headers.set('Idempotency-Key', idempotencyKey || generateIdempotencyKey(method.toLowerCase()));
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${DEFAULT_API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const response = await fetch(url, {
    ...rest,
    method,
    headers,
    credentials: 'include',
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

  if (!response.ok) {
    let errorPayload: Record<string, unknown> = {};
    try {
      errorPayload = (await response.json()) as Record<string, unknown>;
    } catch {
      // Abaikan jika bukan JSON
    }

    const serverMsg =
      typeof errorPayload.message === 'string' ? errorPayload.message : null;

    if (response.status === 401) {
      throw new ApiClientError(
        serverMsg || 'Sesi autentikasi berakhir. Silakan login kembali.',
        401,
        'UNAUTHORIZED',
        errorPayload
      );
    }
    if (response.status === 403) {
      throw new ApiClientError(
        serverMsg || 'Anda tidak memiliki izin peran (RBAC) untuk melakukan tindakan ini.',
        403,
        'FORBIDDEN',
        errorPayload
      );
    }
    if (response.status === 409) {
      throw new ApiClientError(
        serverMsg || 'Konflik data (409): Data telah berubah atau ID sudah digunakan.',
        409,
        'CONFLICT',
        errorPayload
      );
    }
    if (response.status === 429) {
      throw new ApiClientError(
        serverMsg || 'Terlalu banyak permintaan (429). Silakan tunggu beberapa saat.',
        429,
        'RATE_LIMITED',
        errorPayload
      );
    }

    throw new ApiClientError(
      serverMsg || `Permintaan gagal dengan kode status ${response.status}.`,
      response.status,
      'HTTP_ERROR',
      errorPayload
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Abstraksi PaymentGateway untuk Cetak Fisik & Ongkir (di luar Google Play Billing)
 */
export const defaultPrintPaymentGateway: PaymentGateway = {
  provider: 'midtrans',

  async createPaymentLink(payload: PaymentGatewayLinkPayload): Promise<PrintPayment> {
    await simulateNetworkDelay(250);
    const gatewayFeeRp = BUSINESS_CONFIG.costAssumptions.paymentGatewayFeeRp;
    const totalAmountRp = payload.printCostRp + payload.shippingCostRp + gatewayFeeRp;
    const shortOrder = payload.orderNumber.replace(/[^A-Z0-9]/g, '').toLowerCase();

    return {
      id: `pp-${Date.now()}`,
      orderNumber: payload.orderNumber,
      provider: 'midtrans',
      channelLabel: payload.channelLabel || 'QRIS / Virtual Account',
      externalRefId: `PG-MT-${Date.now().toString().slice(-6)}`,
      paymentUrl: `https://pay.forgepro.id/cetak/${shortOrder}`,
      printCostRp: payload.printCostRp,
      shippingCostRp: payload.shippingCostRp,
      gatewayFeeRp,
      totalAmountRp,
      status: 'menunggu',
      expiresAt: '20 Okt 2026, 23:59 WIB',
    };
  },

  async verifyPayment(printPaymentId: string): Promise<PrintPayment> {
    await simulateNetworkDelay(250);
    return {
      id: printPaymentId,
      orderNumber: 'PRO-20261019-001',
      provider: 'midtrans',
      channelLabel: 'QRIS',
      externalRefId: `PG-MT-VERIFIED`,
      paymentUrl: `https://pay.forgepro.id/cetak/${printPaymentId}`,
      printCostRp: 35000,
      shippingCostRp: 18000,
      gatewayFeeRp: BUSINESS_CONFIG.costAssumptions.paymentGatewayFeeRp,
      totalAmountRp: 57000,
      status: 'dibayar',
      paidAt: '19 Okt 2026, 16:40 WIB',
      expiresAt: '20 Okt 2026, 16:12 WIB',
    };
  },

  async refundPayment(printPaymentId: string, _reason: string): Promise<PrintPayment> {
    await simulateNetworkDelay(250);
    return {
      id: printPaymentId,
      orderNumber: 'PRO-20261019-001',
      provider: 'midtrans',
      channelLabel: 'QRIS',
      externalRefId: `PG-MT-REFUND`,
      paymentUrl: `https://pay.forgepro.id/cetak/${printPaymentId}`,
      printCostRp: 35000,
      shippingCostRp: 18000,
      gatewayFeeRp: BUSINESS_CONFIG.costAssumptions.paymentGatewayFeeRp,
      totalAmountRp: 57000,
      status: 'refund',
      expiresAt: '20 Okt 2026, 16:12 WIB',
    };
  },
};
