"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CarFront, ExternalLink, LayoutDashboard, Loader2, LogOut, Menu, Settings, X } from "lucide-react";
import { clsx } from "clsx";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { api } from "@/lib/api/client";
import { useApiError } from "./useApiError";

const AdminContext = createContext<{ username: string } | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminShell>");
  return ctx;
}

const NAV = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/cars", key: "cars", icon: CarFront },
  { href: "/admin/settings", key: "settings", icon: Settings },
] as const;

/**
 * Verifies the session with the backend before rendering any admin page.
 * This is only a UX gate; every admin API call is authorized server-side.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const toMessage = useApiError();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get<{ username: string }>("/api/auth/me").then(setUser, (err) => toMessage(err));
  }, [toMessage]);

  useEffect(() => setMenuOpen(false), [pathname]);

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      router.replace({ pathname: "/admin/login", query: { loggedOut: "1" } });
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink-50" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" aria-hidden="true" />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    );
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label={t("nav.menu")} className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, key, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={clsx(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
            isActive(href) ? "bg-brand-400 text-ink-900" : "text-white/75 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {t(`nav.${key}`)}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-5 w-5" aria-hidden="true" />
          {t("nav.viewSite")}
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />
          {t("nav.logout")}
        </button>
        <div className="px-3.5 pt-3">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );

  return (
    <AdminContext.Provider value={user}>
      <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col bg-ink-900 p-5 lg:flex">
          <Link href="/admin" className="mb-8 flex items-center gap-3">
            <Logo size={48} />
            <div className="leading-tight">
              <p className="font-display font-extrabold text-white" dir="ltr">
                TG <span className="text-brand-400">AutoLoc</span>
              </p>
              <p className="text-xs text-white/50">{t("title")}</p>
            </div>
          </Link>
          {nav}
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-ink-900 px-4 py-3 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size={40} />
            <span className="text-sm font-semibold text-white">{t("title")}</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-nav"
            aria-label={t("nav.menu")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        <div id="admin-mobile-nav" hidden={!menuOpen} className="sticky top-16 z-20 flex flex-col bg-ink-900 px-4 pb-5 lg:hidden">
          {nav}
        </div>

        <main id="main" className="min-w-0 p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </AdminContext.Provider>
  );
}
