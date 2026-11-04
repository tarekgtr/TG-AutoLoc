import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronLeft, Info } from "lucide-react";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { AvailabilityBadge } from "@/components/cars/AvailabilityBadge";
import { CarGallery } from "@/components/cars/CarGallery";
import { CarSpecs } from "@/components/cars/CarSpecs";
import { Price } from "@/components/cars/Price";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { fetchCar, fetchSettings } from "@/lib/api/server";
import { carName, localized } from "@/lib/format";
import { alternates, localeUrl, SITE_URL } from "@/lib/site";
import type { CarDetail } from "@/lib/types";
import { rentalMessage, whatsAppUrl, type MessageLocale } from "@/lib/whatsapp";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const car = await fetchCar(slug);
  const t = await getTranslations({ locale, namespace: "meta" });
  if (!car) return { title: t("carsTitle"), robots: { index: false } };

  const tc = await getTranslations({ locale, namespace: "car" });
  const name = carName(car);
  const title = t("carTitle", { name, year: car.year });
  const description =
    localized(car, "description", locale)?.slice(0, 160) ??
    t("carDescription", {
      name,
      year: car.year,
      transmission: tc(`transmissionValues.${car.transmission}`),
      fuel: tc(`fuelValues.${car.fuelType}`),
      seats: car.seats,
    });
  const image = car.mainImage?.url ?? "/images/hero.jpg";
  return {
    title,
    description,
    alternates: alternates(locale, `/cars/${car.slug}`),
    openGraph: { type: "website", title, description, images: [{ url: image, alt: name }] },
  };
}

function jsonLd(car: CarDetail, locale: string) {
  const name = carName(car);
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${name} ${car.year}`,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    vehicleTransmission: car.transmission === "AUTOMATIC" ? "AutomaticTransmission" : "ManualTransmission",
    fuelType: car.fuelType,
    seatingCapacity: car.seats,
    url: localeUrl(locale, `/cars/${car.slug}`),
    image: car.images.map((i) => `${SITE_URL}${i.url}`),
    ...(car.dailyPrice !== null && {
      offers: {
        "@type": "Offer",
        price: car.dailyPrice,
        priceCurrency: "DZD",
        availability: car.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      },
    }),
  };
}

export default async function CarDetailsPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [car, settings, t] = await Promise.all([fetchCar(slug), fetchSettings(), getTranslations("car")]);
  if (!car) notFound();
  // Old or edited slugs resolve via the trailing id: send visitors and crawlers to the canonical URL.
  if (car.slug !== slug) permanentRedirect({ href: `/cars/${car.slug}`, locale });

  const name = carName(car);
  const description = localized(car, "description", locale);
  const rentHref = whatsAppUrl(
    settings?.whatsappNumber,
    rentalMessage(locale as MessageLocale, `${name} (${car.year})`, car.available),
  );

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot break out of the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(car, locale)).replace(/</g, "\\u003c") }}
      />
      <div className="container py-8 sm:py-10">
        <nav aria-label={t("breadcrumb")} className="text-sm">
          <Link href="/cars" className="inline-flex items-center gap-1 font-medium text-ink-600 hover:text-ink-900">
            <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            {t("backToCars")}
          </Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CarGallery images={car.images} name={name} />
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <AvailabilityBadge available={car.available} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-ink-500">{car.brand}</p>
              <h1 className="mt-1 text-3xl font-extrabold text-ink-900 sm:text-4xl">
                {name} <span className="text-ink-400">{car.year}</span>
              </h1>

              <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50 p-5">
                <p className="text-sm text-ink-500">{t("dailyPrice")}</p>
                <div className="mt-1">
                  <Price amount={car.dailyPrice} size="lg" />
                </div>

                {!car.available && (
                  <p role="status" className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {t("unavailableNotice")}
                  </p>
                )}

                <WhatsAppButton
                  href={rentHref}
                  label={car.available ? t("rent") : t("askAvailability")}
                  className="btn-whatsapp mt-5 w-full py-3.5 text-base"
                />
                <p className="mt-3 text-xs leading-relaxed text-ink-500">{t("rentHint")}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <section className="lg:col-span-7" aria-labelledby="specs-title">
            <h2 id="specs-title" className="text-xl font-bold text-ink-900">
              {t("specs")}
            </h2>
            <div className="mt-4">
              <CarSpecs car={car} variant="detailed" />
            </div>

            {description && (
              <>
                <h2 className="mt-10 text-xl font-bold text-ink-900">{t("description")}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-700">{description}</p>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
