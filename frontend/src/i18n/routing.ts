import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "ar"] as const;
export type Locale = (typeof locales)[number];

/**
 * French is the default and lives at the root (/cars/seat-ibiza-12); Arabic is prefixed (/ar/cars/seat-ibiza-12).
 * The chosen language is remembered in the NEXT_LOCALE cookie for one year.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localePrefix: "as-needed",
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});

export function directionOf(locale: string): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
