import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, MapPinned, Phone } from "lucide-react";
import { ContactDetails } from "@/components/site/ContactDetails";
import { PageHero } from "@/components/site/PageHero";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { fetchSettings } from "@/lib/api/server";
import { localized, telHref } from "@/lib/format";
import { alternates } from "@/lib/site";
import { contactMessage, whatsAppUrl, type MessageLocale } from "@/lib/whatsapp";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
    alternates: alternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, settings] = await Promise.all([getTranslations("contact"), fetchSettings()]);
  const whatsappHref = whatsAppUrl(settings?.whatsappNumber, contactMessage(locale as MessageLocale));
  const location = settings ? localized(settings, "location", locale) : null;

  return (
    <>
      <PageHero eyebrow="TG AutoLoc" title={t("title")} subtitle={t("subtitle")}>
        <div className="mt-8 flex flex-wrap gap-3">
          <WhatsAppButton href={whatsappHref} label={t("writeUs")} />
          {settings?.phoneNumber && (
            <a href={telHref(settings.phoneNumber)} className="btn-outline-light">
              <Phone className="h-5 w-5" aria-hidden="true" />
              {t("callUs")}
            </a>
          )}
        </div>
      </PageHero>

      <div className="container grid gap-6 py-14 lg:grid-cols-2">
        <section className="card p-6 sm:p-8" aria-labelledby="info-title">
          <h2 id="info-title" className="text-xl font-bold text-ink-900">
            {t("infoTitle")}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {t("business")} : <span className="font-semibold text-ink-900">TG AutoLoc</span>
          </p>
          <div className="mt-6">
            <ContactDetails settings={settings} whatsappHref={whatsappHref} />
          </div>
        </section>

        <section className="card flex flex-col overflow-hidden" aria-labelledby="map-title">
          <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950 px-6 py-14 text-center text-white">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-400 text-ink-900">
              <MapPinned className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 id="map-title" className="mt-5 text-xl font-bold">
              {t("map")}
            </h2>
            {location && <p className="mt-2 text-white/75">{location}</p>}
            {settings?.mapsUrl ? (
              <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6">
                {t("openMap")}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-4 max-w-sm text-sm text-white/55">{t("mapNotConfigured")}</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
