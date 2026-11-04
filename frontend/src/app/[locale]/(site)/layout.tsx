import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { fetchSettings } from "@/lib/api/server";
import { contactMessage, whatsAppUrl, type MessageLocale } from "@/lib/whatsapp";

/**
 * Public pages are rendered per request so inventory and contact changes made in the admin
 * dashboard are visible immediately (pages catch backend errors, which would otherwise hide
 * the no-store fetches from Next.js and let it prerender stale pages at build time).
 */
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, settings] = await Promise.all([getTranslations("nav"), fetchSettings()]);
  const contactHref = whatsAppUrl(settings?.whatsappNumber, contactMessage(locale as MessageLocale));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand-400 px-4 py-2 font-semibold text-ink-900 focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t("skip")}
      </a>
      <Header whatsappHref={contactHref} />
      <main id="main" tabIndex={-1} className="min-h-[60vh] focus:outline-none">
        {children}
      </main>
      <Footer settings={settings} whatsappHref={contactHref} />
      <FloatingWhatsApp href={contactHref} />
    </>
  );
}
