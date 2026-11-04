/**
 * ForgePro.id — Central REST API Client
 * Mengelola komunikasi HTTP ke backend Google Cloud Run (VITE_API_URL).
 * Mendukung mode LIVE (VITE_USE_MOCK=false) dan MOCK fallback (VITE_USE_MOCK=true).
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://forgepro-625134443444.asia-southeast1.run.app';

export const isMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK === 'true';
};

export interface BackendResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type ApiResponse<T> = BackendResponse<T>;

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<BackendResponse<T>> {
  const token =
    import.meta.env.VITE_API_TOKEN ||
    localStorage.getItem('forgepro_token') ||
    'demo_token_admin';
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const method = (options.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Inject Idempotency-Key untuk request yang memodifikasi data (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    headers['Idempotency-Key'] = generateIdempotencyKey();
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // Body kosong atau text
    }

    if (!res.ok) {
      throw new ApiError(
        json?.message || `Request failed with status ${res.status}`,
        res.status,
        json
      );
    }

    // Backend Cloud Run mengembalikan: { success: boolean, message: string, data: T }
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json as BackendResponse<T>;
    }

    return {
      success: true,
      message: 'Success',
      data: json as T,
    };
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error occurred', 0);
  }
}

export default {
  apiRequest,
  isMockMode,
  ApiError,
};
