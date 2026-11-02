/**
 * ForgePro.id — Central REST API Client
 * Mengelola komunikasi HTTP ke backend server (VITE_API_URL).
 * Mendukung mode MOCK (VITE_USE_MOCK=true) dan LIVE (VITE_USE_MOCK=false).
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const isMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK !== 'false';
};

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('forgepro_token') || 'demo_token_admin';
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errData: any = {};
      try {
        errData = await res.json();
      } catch {
        // Fallback
      }
      throw new ApiError(
        errData.message || `Request failed with status ${res.status}`,
        res.status,
        errData
      );
    }

    const data = await res.json();
    return {
      success: true,
      data,
      statusCode: res.status,
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
