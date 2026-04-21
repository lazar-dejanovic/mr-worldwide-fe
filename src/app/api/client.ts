/**
 * Base API client
 * ─────────────────────────────────────────────────────────────
 * Change BASE_URL to point at your Spring Boot server.
 * The JWT token is read from localStorage (key: "mrw_token")
 * and injected automatically into every authenticated request.
 */

export const BASE_URL = 'http://localhost:8080/api'; // ← change to your BE host

function getToken(): string | null {
  return localStorage.getItem('mrw_token');
}

export function saveToken(token: string) {
  localStorage.setItem('mrw_token', token);
}

export function clearToken() {
  localStorage.removeItem('mrw_token');
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  auth?: boolean; // default true
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(
  path: string,
  { method = 'GET', body, params, auth = true }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — return empty
  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json?.message ?? `HTTP ${response.status}`,
      json,
    );
  }

  return json as T;
}
