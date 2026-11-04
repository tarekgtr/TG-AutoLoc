import "server-only";
import { cache } from "react";
import type { BusinessSettings, CarDetail, CarSummary, Page } from "@/lib/types";

/**
 * Server-side access to the Spring Boot API (Server Components, sitemap).
 * Responses are not cached so that inventory edits are visible immediately.
 */
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

export class BackendUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Backend unavailable", { cause });
    this.name = "BackendUnavailableError";
  }
}

async function getJson<T>(path: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    console.error(`[api] ${path} unreachable:`, err instanceof Error ? err.message : err);
    throw new BackendUnavailableError(err);
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`[api] ${path} responded ${res.status}`);
    throw new BackendUnavailableError(new Error(`HTTP ${res.status}`));
  }
  return (await res.json()) as T;
}

export interface CarQuery {
  q?: string;
  brand?: string;
  transmission?: string;
  fuelType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export async function fetchCars(query: CarQuery): Promise<Page<CarSummary>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") params.set(key, String(value));
  }
  return (await getJson<Page<CarSummary>>(`/api/public/cars?${params}`))!;
}

export async function fetchFeaturedCars(limit = 6): Promise<CarSummary[]> {
  return (await getJson<CarSummary[]>(`/api/public/cars/featured?limit=${limit}`)) ?? [];
}

export async function fetchBrands(): Promise<string[]> {
  return (await getJson<string[]>("/api/public/cars/brands")) ?? [];
}

/** Deduplicated per request (used by both generateMetadata and the page). */
export const fetchCar = cache(async (slug: string): Promise<CarDetail | null> =>
  getJson<CarDetail>(`/api/public/cars/${encodeURIComponent(slug)}`),
);

export async function fetchSitemapEntries(): Promise<{ slug: string; updatedAt: string }[]> {
  return (await getJson<{ slug: string; updatedAt: string }[]>("/api/public/cars/sitemap")) ?? [];
}

/**
 * Settings are needed by every page (header, footer, WhatsApp); never let them break rendering.
 * Deduplicated per request so the layout and the page share one call.
 */
export const fetchSettings = cache(async (): Promise<BusinessSettings | null> => {
  try {
    return await getJson<BusinessSettings>("/api/public/settings");
  } catch {
    return null;
  }
});
