import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ListChecks, MapPin, MessagesSquare, MousePointerClick } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CarCard } from "@/components/cars/CarCard";
import { ContactDetails } from "@/components/site/ContactDetails";
import { ErrorState } from "@/components/site/ErrorState";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { fetchFeaturedCars, fetchSettings } from "@/lib/api/server";
import { alternates } from "@/lib/site";
import type { CarSummary } from "@/lib/types";
import { contactMessage, whatsAppUrl, type MessageLocale } from "@/lib/whatsapp";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { absolute: t("homeTitle") },
    description: t("siteDescription"),
    alternates: alternates(locale, "/"),
    openGraph: { title: t("homeTitle"), description: t("siteDescription") },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const settings = await fetchSettings();
  let featured: CarSummary[] | null = null;
  try {
    featured = await fetchFeaturedCars(6);
  } catch {
    featured = null; // rendered as an error state below; the rest of the page stays usable
  }
  const contactHref = whatsAppUrl(settings?.whatsappNumber, contactMessage(locale as MessageLocale));

  return (
    <>
      <Hero contactHref={contactHref} />

      {/* Featured vehicles */}
      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">TG AutoLoc</p>
              <h2 id="featured-title" className="mt-2 text-3xl font-extrabold text-ink-900 sm:text-4xl">
                {t("featured.title")}
              </h2>
              <p className="mt-2 text-ink-600">{t("featured.subtitle")}</p>
            </div>
            <Link href="/cars" className="btn-outline btn-sm self-start sm:self-auto">
              {t("featured.viewAll")}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10">
            {featured === null ? (
              <ErrorState title={t("cars.errorTitle")} text={t("cars.errorText")} />
            ) : featured.length === 0 ? (
              <p className="card px-6 py-10 text-center text-ink-600">{t("featured.empty")}</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {featured.map((car, i) => (
                  <CarCard key={car.id} car={car} whatsappNumber={settings?.whatsappNumber ?? null} priority={i < 2} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <WhyUs />

      {/* Contact */}
      <section className="section pt-0" aria-labelledby="contact-title">
        <div className="container">
          <div className="grid overflow-hidden rounded-3xl bg-ink-900 text-white lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="eyebrow text-brand-400">{t("nav.contact")}</p>
              <h2 id="contact-title" className="mt-2 text-3xl font-extrabold">
                {t("contactSection.title")}
              </h2>
              <p className="mt-3 text-white/70">{t("contactSection.subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <WhatsAppButton href={contactHref} label={t("hero.ctaWhatsapp")} />
                <Link href="/contact" className="btn-outline-light">
                  {t("nav.contact")}
                </Link>
              </div>
            </div>
            <div className="border-t border-white/10 p-8 sm:p-12 lg:border-s lg:border-t-0">
              <ContactDetails settings={settings} whatsappHref={contactHref} tone="dark" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

async function Hero({ contactHref }: { contactHref: string | null }) {
  const t = await getTranslations("hero");
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white">
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[70%_center] opacity-90"
      />
      {/* Darkens the text side; the gradient follows the reading direction. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-ink-950/70 md:bg-transparent md:bg-gradient-to-r md:from-ink-950 md:via-ink-950/85 md:to-ink-950/10 rtl:md:bg-gradient-to-l"
      />
      <div className="container flex min-h-[520px] items-center py-20 lg:min-h-[600px]">
        <div className="max-w-xl animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur">
            <MapPin className="h-3.5 w-3.5 text-brand-400" aria-hidden="true" />
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            {t.rich("title", { hl: (chunks) => <span className="text-brand-400">{chunks}</span> })}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">{t("subtitle")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/cars" className="btn-primary px-6 py-3.5 text-base">
              {t("ctaCars")}
              <ArrowRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />
            </Link>
            <WhatsAppButton href={contactHref} label={t("ctaWhatsapp")} className="btn-whatsapp px-6 py-3.5 text-base" />
          </div>
        </div>
      </div>
    </section>
  );
}

async function WhyUs() {
  const t = await getTranslations("why");
  const items = [
    { icon: MousePointerClick, title: t("simpleTitle"), text: t("simpleText") },
    { icon: ListChecks, title: t("transparentTitle"), text: t("transparentText") },
    { icon: MessagesSquare, title: t("directTitle"), text: t("directText") },
    { icon: MapPin, title: t("localTitle"), text: t("localText") },
  ];
  return (
    <section className="section bg-white" aria-labelledby="why-title">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="why-title" className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-ink-600">{t("subtitle")}</p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-ink-100 bg-ink-50 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-brand-400">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
