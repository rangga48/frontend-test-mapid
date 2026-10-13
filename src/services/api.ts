/**
 * Lightweight Axios-compatible HTTP Client
 * Built on native Fetch API for maximum performance, zero dependencies,
 * and seamless TypeScript integration.
 */

export interface AxiosRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

export interface AxiosResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  data: unknown;

  constructor(message: string, status: number = 500, statusText: string = 'Internal Server Error', data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:3000/api';
};

const buildUrl = (endpoint: string, params?: Record<string, string | number | boolean | undefined>): string => {
  const baseUrl = getBaseUrl();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If baseUrl already ends with /api and cleanEndpoint also begins with /api/, deduplicate it
  if (baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }

  const fullUrl = new URL(`${baseUrl}${cleanEndpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  return fullUrl.toString();
};

const request = async <T = unknown>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const url = buildUrl(endpoint, config?.params);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(config?.headers || {}),
  };

  const options: RequestInit = {
    method,
    headers,
    signal: config?.signal,
  };

  if (body !== undefined && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);

    let data: unknown;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const errorMsg =
        (typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message: unknown }).message === 'string'
          ? (data as { message: string }).message
          : null) ||
        (typeof data === 'object' && data !== null && 'error' in data && typeof (data as { error: unknown }).error === 'string'
          ? (data as { error: string }).error
          : null) ||
        `Request failed with status ${res.status}: ${res.statusText}`;

      throw new ApiError(errorMsg, res.status, res.statusText, data);
    }

    return {
      data: data as T,
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Network error occurred';
    throw new ApiError(message, 0, 'Network Error', err);
  }
};

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<T>('GET', url, undefined, config),

  post: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>('POST', url, body, config),

  patch: <T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>('PATCH', url, body, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request<T>('DELETE', url, undefined, config),
};

export default api;
