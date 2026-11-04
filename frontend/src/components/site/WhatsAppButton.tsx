import { useTranslations } from "next-intl";
import { clsx } from "clsx";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Opens a wa.me click-to-chat link in a new tab (or the WhatsApp app on mobile).
 * When no business number is configured, renders a disabled button explaining why.
 */
export function WhatsAppButton({
  href,
  label,
  className = "btn-whatsapp",
  iconOnly = false,
}: {
  href: string | null;
  label: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const t = useTranslations("whatsapp");
  const content = (
    <>
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span className={clsx(iconOnly && "sr-only")}>{label}</span>
    </>
  );

  if (!href) {
    return (
      <span
        role="button"
        aria-disabled="true"
        title={t("notConfigured")}
        className={clsx(className, "cursor-not-allowed opacity-60")}
      >
        {content}
        <span className="sr-only">{t("notConfigured")}</span>
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
      <span className="sr-only">{t("opensNewTab")}</span>
    </a>
  );
}
