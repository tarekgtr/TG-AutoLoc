import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { clsx } from "clsx";
import { directionOf, routing } from "@/i18n/routing";
import { alternates, SITE_NAME, SITE_URL } from "@/lib/site";

// Self-hosted variable fonts (SIL OFL, see src/fonts/LICENSE-*.txt): no third-party requests, offline builds.
const inter = localFont({
  src: "../../fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});
const montserrat = localFont({
  src: "../../fonts/montserrat-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-montserrat",
  display: "swap",
});
const cairo = localFont({
  src: "../../fonts/cairo-arabic-wght-normal.woff2",
  weight: "200 1000",
  variable: "--font-cairo",
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("homeTitle"), template: `%s | ${SITE_NAME}` },
    description: t("siteDescription"),
    applicationName: SITE_NAME,
    alternates: alternates(locale),
    icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "ar" ? "ar_DZ" : "fr_DZ",
      alternateLocale: locale === "ar" ? ["fr_DZ"] : ["ar_DZ"],
      images: [{ url: "/images/hero.jpg", width: 1226, height: 465, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A101C",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={clsx(
        inter.variable,
        montserrat.variable,
        cairo.variable,
        locale === "ar" ? "fonts-arabic" : "fonts-latin",
      )}
    >
      <body className="min-h-dvh">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
