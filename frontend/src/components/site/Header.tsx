"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WhatsAppButton } from "./WhatsAppButton";

const NAV = [
  { href: "/", key: "home" },
  { href: "/cars", key: "cars" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Header({ whatsappHref }: { whatsappHref: string | null }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation and with Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/95 text-white backdrop-blur supports-[backdrop-filter]:bg-ink-900/85">
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label={t("nav.homeLink")} className="flex items-center gap-3 rounded-full">
          <Logo size={52} priority />
          <span className="hidden font-display text-lg font-extrabold leading-none sm:block" dir="ltr">
            TG <span className="text-brand-400">AutoLoc</span>
          </span>
        </Link>

        <nav aria-label={t("nav.main")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={clsx(
                    "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive(href) ? "text-brand-400" : "text-white/80 hover:text-white",
                  )}
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <div className="hidden md:block">
            <WhatsAppButton href={whatsappHref} label="WhatsApp" className="btn-whatsapp btn-sm" />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.closeMenu") : t("nav.menu")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-white/10 bg-ink-900 lg:hidden"
      >
        <nav aria-label={t("nav.main")} className="container py-4">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={clsx(
                    "block rounded-xl px-4 py-3 text-base font-medium",
                    isActive(href) ? "bg-white/5 text-brand-400" : "text-white/85 hover:bg-white/5",
                  )}
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <LanguageSwitcher />
            <WhatsAppButton href={whatsappHref} label={t("whatsapp.chat")} className="btn-whatsapp btn-sm" />
          </div>
        </nav>
      </div>
    </header>
  );
}
