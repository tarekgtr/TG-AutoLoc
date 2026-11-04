import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import type { BusinessSettings } from "@/lib/types";
import { ContactDetails } from "./ContactDetails";
import { FacebookIcon } from "@/components/icons";

export function Footer({ settings, whatsappHref }: { settings: BusinessSettings | null; whatsappHref: string | null }) {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-white">
      <div className="container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.4fr]">
        <div>
          <Link href="/" aria-label={t("nav.homeLink")} className="inline-block rounded-full">
            <Logo size={96} />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">{t("footer.tagline")}</p>
          {settings?.facebookUrl && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{t("footer.follow")}</p>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook – TG AutoLoc"
                className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/80 transition hover:bg-brand-400 hover:text-ink-900"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            </div>
          )}
        </div>

        <nav aria-label={t("footer.navigation")}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-400">{t("footer.navigation")}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {(["home", "cars", "about", "contact"] as const).map((key) => (
              <li key={key}>
                <Link
                  href={key === "home" ? "/" : `/${key}`}
                  className="text-white/70 transition hover:text-white"
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-400">{t("footer.contact")}</h2>
          <div className="mt-5 text-sm">
            <ContactDetails settings={settings} whatsappHref={whatsappHref} tone="dark" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>{t("footer.rights", { year })}</p>
          <Link href="/admin" className="transition hover:text-white/80" rel="nofollow">
            {t("footer.admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
