const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'klear:token';

// ─── TOKEN STORAGE ────────────────────────────────────────────────

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  set: (token: string): void =>
    localStorage.setItem(TOKEN_KEY, token),
  clear: (): void =>
    localStorage.removeItem(TOKEN_KEY),
};

// ─── ERROR ────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string | string[], status: number, data?: unknown) {
    super(Array.isArray(message) ? message.join(' · ') : message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  get isUnauthorized() { return this.status === 401; }
  get isNotFound()     { return this.status === 404; }
  get isConflict()     { return this.status === 409; }
  get isValidation()   { return this.status === 400; }
}

// ─── CORE ─────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: object;
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: extraHeaders, ...init } = options;

  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string>),
  };

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // 204 No Content
  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      tokenStorage.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const message = (data as { message?: string | string[] })?.message ?? 'Une erreur est survenue';
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

// ─── HTTP METHODS ─────────────────────────────────────────────────

export const fetcher = {
  get:    <T>(path: string, params?: object)         => request<T>(path, { method: 'GET', params }),
  post:   <T>(path: string, body?: unknown)          => request<T>(path, { method: 'POST', body }),
  patch:  <T>(path: string, body?: unknown)          => request<T>(path, { method: 'PATCH', body }),
  put:    <T>(path: string, body?: unknown)          => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string)                          => request<T>(path, { method: 'DELETE' }),
};
