import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { config } from '@/shared/config/env';

// ─── Types ─────────────────────────────────────────────────────────────────

export type AuthTokenGetter = () => string | null;

/** Розширення конфігу axios: опційний токен для запиту */
type ApiRequestConfig = AxiosRequestConfig & {
  token?: string | null;
};

/** Помилка від API з кодом статусу та опційним кодом помилки з тіла */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body?: string;

  constructor(message: string, status: number, code?: string, body?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** Помилка мережі або бекенд недоступний (503). */
  get isServerUnavailable(): boolean {
    return this.status === 0 || this.status === 503;
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────

let authGetter: AuthTokenGetter | null = null;

/** Встановити джерело токена для авторизованих запитів (при ініціалізації застосунку). */
export function setAuthGetter(fn: AuthTokenGetter): void {
  authGetter = fn;
}

// ─── Axios instance ────────────────────────────────────────────────────────

const http = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

/** Request interceptor: підставляє Bearer токен з опції запиту або з authGetter */
http.interceptors.request.use((cfg: InternalAxiosRequestConfig & ApiRequestConfig) => {
  const token =
    cfg.token !== undefined && cfg.token !== null ? cfg.token : (authGetter?.() ?? null);
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

/** Response interceptor: перетворює помилки axios на ApiError */
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      throw error;
    }
    const err = error as AxiosError<unknown>;
    const status = err.response?.status ?? (err.code === 'ERR_NETWORK' ? 503 : 0);
    const data = err.response?.data;
    const body = typeof data === 'string' ? data : JSON.stringify(data ?? '');
    let message = body;
    let code: string | undefined;
    if (data && typeof data === 'object') {
      const obj = data as { message?: string; error?: string; code?: string };
      message = obj.message ?? obj.error ?? body;
      code = obj.code;
    }
    throw new ApiError(message || (err as Error).message || `HTTP ${status}`, status, code, body);
  },
);

// ─── Core request ───────────────────────────────────────────────────────────

async function request<T>(path: string, options: ApiRequestConfig = {}): Promise<T> {
  const { token, ...rest } = options;
  const requestConfig: ApiRequestConfig = { ...rest, url: path, token };
  const res = await http.request<T>(requestConfig as AxiosRequestConfig);
  if (res.status === 204 || res.data === undefined) {
    return undefined as T;
  }
  return res.data as T;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', data: body, token }),

  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PUT', data: body, token }),

  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', data: body, token }),

  delete: <T>(path: string, token?: string | null) => request<T>(path, { method: 'DELETE', token }),

  /** POST з withCredentials: true (cookie-based auth). */
  postWithCredentials: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', data: body, withCredentials: true }),
};
