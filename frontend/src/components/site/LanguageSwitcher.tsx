"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { clsx } from "clsx";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

/** "FR | العربية" switcher. Keeps the current page and query string; next-intl persists the choice in a cookie. */
export function LanguageSwitcher({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const t = useTranslations("language");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === current) return;
    startTransition(() => {
      router.replace(`${pathname}${window.location.search}`, { locale, scroll: false });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={clsx(
        "inline-flex items-center rounded-full border p-0.5 text-sm",
        tone === "dark" ? "border-white/15" : "border-ink-200",
        pending && "opacity-60",
      )}
    >
      {locales.map((locale, i) => {
        const active = locale === current;
        return (
          <span key={locale} className="flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className={tone === "dark" ? "text-white/25" : "text-ink-300"}>
                |
              </span>
            )}
            <button
              type="button"
              lang={locale}
              onClick={() => switchTo(locale)}
              aria-pressed={active}
              aria-label={t("switchTo", { language: t(locale) })}
              className={clsx(
                "rounded-full px-3 py-1 font-semibold transition",
                locale === "ar" && "font-[family-name:var(--font-cairo)]",
                active
                  ? "bg-brand-400 text-ink-900"
                  : tone === "dark"
                    ? "text-white/80 hover:text-white"
                    : "text-ink-600 hover:text-ink-900",
              )}
            >
              {t(locale)}
            </button>
          </span>
        );
      })}
    </div>
  );
}
