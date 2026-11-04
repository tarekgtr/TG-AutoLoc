import type { ApiErrorBody } from "@/lib/types";

/**
 * Browser-side API client. Calls go to /api on the same origin (proxied to Spring Boot),
 * so the HttpOnly session cookie is sent automatically. State-changing requests carry the
 * XSRF-TOKEN cookie value in the X-XSRF-TOKEN header (double-submit CSRF protection).
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(code);
    this.name = "ApiError";
  }
}

const CSRF_COOKIE = "XSRF-TOKEN";
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

async function csrfToken(): Promise<string> {
  let token = readCookie(CSRF_COOKIE);
  if (!token) {
    await fetch("/api/auth/csrf", { credentials: "same-origin" });
    token = readCookie(CSRF_COOKIE);
  }
  if (!token) throw new ApiError(0, "csrf_unavailable");
  return token;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (MUTATING.has(method)) headers.set("X-XSRF-TOKEN", await csrfToken());

  let res: Response;
  try {
    res = await fetch(path, { ...init, method, headers, credentials: "same-origin", cache: "no-store" });
  } catch {
    throw new ApiError(0, "network_error");
  }

  if (!res.ok) {
    let body: Partial<ApiErrorBody> = {};
    try {
      body = await res.json();
    } catch {
      // non-JSON error (e.g. proxy failure)
    }
    const code = body.code ?? (res.status >= 500 ? "server_error" : "request_failed");
    throw new ApiError(res.status, code, body.fieldErrors ?? {});
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
