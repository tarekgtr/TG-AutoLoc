import { useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/icons";

/** Floating contact button, shown only when a WhatsApp number is configured. */
export function FloatingWhatsApp({ href }: { href: string | null }) {
  const t = useTranslations("whatsapp");
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t("floating")} ${t("opensNewTab")}`}
      title={t("floating")}
      className="fixed bottom-5 end-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-black/25 transition hover:scale-105 hover:bg-whatsapp-dark focus-visible:ring-offset-ink-50"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
