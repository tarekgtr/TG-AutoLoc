/** Locale-aware display helpers. Prices are shown in Algerian dinars (DZD). */

export function formatPrice(amount: number, locale: string): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-DZ", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
  return locale === "ar" ? `${formatted} دج` : `${formatted} DA`;
}

/** Displays international digits (e.g. 213552123456) as "+213 552 12 34 56". */
export function formatPhone(digits: string): string {
  if (digits.startsWith("213") && digits.length === 12) {
    const n = digits.slice(3);
    return `+213 ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7, 9)}`;
  }
  return `+${digits}`;
}

export function telHref(digits: string): string {
  return `tel:+${digits}`;
}

export function carName(car: { brand: string; model: string }): string {
  return `${car.brand} ${car.model}`;
}

export function localized<T extends object>(obj: T, base: string, locale: string): string | null {
  const record = obj as Record<string, unknown>;
  const key = `${base}${locale === "ar" ? "Ar" : "Fr"}`;
  const fallback = `${base}${locale === "ar" ? "Fr" : "Ar"}`;
  return (record[key] as string | null) || (record[fallback] as string | null) || null;
}
