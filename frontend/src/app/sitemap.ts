import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/api/server";
import { localeUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

function entry(path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] {
  return {
    url: localeUrl("fr", path),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
    alternates: { languages: { fr: localeUrl("fr", path), ar: localeUrl("ar", path) } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [entry("/", undefined, 1), entry("/cars", undefined, 0.9), entry("/about", undefined, 0.5), entry("/contact", undefined, 0.6)];
  let cars: MetadataRoute.Sitemap = [];
  try {
    cars = (await fetchSitemapEntries()).map((c) => entry(`/cars/${c.slug}`, c.updatedAt, 0.8));
  } catch {
    // Backend down: still serve the static pages.
  }
  return [...staticPages, ...cars];
}
