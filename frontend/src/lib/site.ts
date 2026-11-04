export const SITE_NAME = "TG AutoLoc";

/** Public site URL for canonical links, Open Graph and the sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Absolute URL of a path in the given locale (French has no prefix). */
export function localeUrl(locale: string, path = "/"): string {
  const prefix = locale === "fr" ? "" : `/${locale}`;
  const clean = path === "/" ? "" : path;
  return `${SITE_URL}${prefix}${clean}` || SITE_URL;
}

/** hreflang alternates for a path, for page metadata. */
export function alternates(locale: string, path = "/") {
  return {
    canonical: localeUrl(locale, path),
    languages: { fr: localeUrl("fr", path), ar: localeUrl("ar", path), "x-default": localeUrl("fr", path) },
  };
}
