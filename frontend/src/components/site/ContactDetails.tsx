import { useLocale, useTranslations } from "next-intl";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { clsx } from "clsx";
import type { BusinessSettings } from "@/lib/types";
import { formatPhone, localized, telHref } from "@/lib/format";
import { FacebookIcon, WhatsAppIcon } from "@/components/icons";

/**
 * Contact facts from the admin-managed settings. Only configured values are shown;
 * nothing is invented when a value is missing.
 */
export function ContactDetails({
  settings,
  whatsappHref,
  tone = "light",
}: {
  settings: BusinessSettings | null;
  whatsappHref: string | null;
  tone?: "light" | "dark";
}) {
  const t = useTranslations("contactSection");
  const locale = useLocale();
  const s = settings;
  const location = s ? localized(s, "location", locale) : null;
  const hours = s ? localized(s, "openingHours", locale) : null;

  const muted = tone === "dark" ? "text-white/60" : "text-ink-500";
  const strong = tone === "dark" ? "text-white" : "text-ink-900";
  const iconBox = clsx(
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
    tone === "dark" ? "bg-white/5 text-brand-400" : "bg-brand-50 text-brand-700",
  );
  const link = "underline-offset-4 hover:underline";

  const phones = [s?.phoneNumber, s?.secondaryPhone].filter((p): p is string => !!p);

  const items = [
    { icon: <MapPin className="h-5 w-5" />, label: t("location"), value: location ?? t("notConfigured") },
    {
      icon: <Phone className="h-5 w-5" />,
      label: t("phone"),
      value: phones.length ? (
        <span className="flex flex-col">
          {phones.map((p) => (
            <a key={p} href={telHref(p)} className={link} dir="ltr">
              {formatPhone(p)}
            </a>
          ))}
        </span>
      ) : (
        t("notConfigured")
      ),
    },
    {
      icon: <WhatsAppIcon className="h-5 w-5" />,
      label: t("whatsapp"),
      value:
        s?.whatsappNumber && whatsappHref ? (
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={link} dir="ltr">
            {formatPhone(s.whatsappNumber)}
          </a>
        ) : (
          t("notConfigured")
        ),
    },
    { icon: <Clock className="h-5 w-5" />, label: t("hours"), value: hours ?? t("notConfigured") },
    ...(s?.email
      ? [{
          icon: <Mail className="h-5 w-5" />,
          label: t("email"),
          value: (
            <a href={`mailto:${s.email}`} className={link} dir="ltr">
              {s.email}
            </a>
          ),
        }]
      : []),
    ...(s?.facebookUrl
      ? [{
          icon: <FacebookIcon className="h-5 w-5" />,
          label: t("facebook"),
          value: (
            <a href={s.facebookUrl} target="_blank" rel="noopener noreferrer" className={link}>
              {t("facebookLink")}
            </a>
          ),
        }]
      : []),
  ];

  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-4">
          <span className={iconBox}>{item.icon}</span>
          <div className="min-w-0">
            <p className={clsx("text-sm", muted)}>{item.label}</p>
            <div className={clsx("mt-0.5 break-words font-medium", strong)}>{item.value}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
