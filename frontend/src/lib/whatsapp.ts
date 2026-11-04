/**
 * WhatsApp click-to-chat links (https://wa.me/<number>?text=<message>).
 * The number comes from the business settings managed in the admin dashboard; it is stored as
 * international digits without "+" (e.g. 213XXXXXXXXX). Messages are only prefilled: the customer
 * reviews and sends them.
 */

export type MessageLocale = "fr" | "ar";

const BUSINESS = "TG AutoLoc";

/** Keeps digits only and validates the length expected by wa.me (8-15 digits, E.164 without "+"). */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && !digits.startsWith("0") ? digits : null;
}

export function rentalMessage(locale: MessageLocale, carName: string, available = true): string {
  if (locale === "ar") {
    return available
      ? `السلام عليكم ${BUSINESS}، أريد كراء هذه السيارة: ${carName}. هل يمكنكم إعلامي بالتوفر وشروط الكراء؟`
      : `السلام عليكم ${BUSINESS}، أنا مهتم بهذه السيارة: ${carName}. متى ستكون متوفرة للكراء؟`;
  }
  return available
    ? `Bonjour ${BUSINESS}, je souhaite louer cette voiture : ${carName}. Pouvez-vous me communiquer les disponibilités et les conditions de location ?`
    : `Bonjour ${BUSINESS}, je suis intéressé(e) par cette voiture : ${carName}. Quand sera-t-elle de nouveau disponible à la location ?`;
}

export function contactMessage(locale: MessageLocale): string {
  return locale === "ar"
    ? `السلام عليكم ${BUSINESS}، أريد الاستفسار عن كراء سيارة.`
    : `Bonjour ${BUSINESS}, je souhaite avoir des informations sur la location de voitures.`;
}

/** @returns the wa.me URL, or null when no valid business number is configured. */
export function whatsAppUrl(number: string | null | undefined, message: string): string | null {
  const phone = normalizeWhatsAppNumber(number);
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
