import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { CarSummary } from "@/lib/types";
import { carName } from "@/lib/format";
import { rentalMessage, whatsAppUrl, type MessageLocale } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { CarPhoto } from "./CarPhoto";
import { CarSpecs } from "./CarSpecs";
import { Price } from "./Price";

export const CAR_CARD_SIZES = "(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw";

export function CarCard({
  car,
  whatsappNumber,
  priority = false,
}: {
  car: CarSummary;
  whatsappNumber: string | null;
  priority?: boolean;
}) {
  const t = useTranslations("car");
  const locale = useLocale() as MessageLocale;
  const name = carName(car);
  const href = `/cars/${car.slug}`;
  const rentHref = whatsAppUrl(whatsappNumber, rentalMessage(locale, `${name} (${car.year})`, car.available));

  return (
    <article className="card group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
        <CarPhoto
          src={car.mainImage?.url}
          alt={t("mainPhotoAlt", { name, year: car.year })}
          sizes={CAR_CARD_SIZES}
          priority={priority}
          className="transition duration-500 group-hover:scale-[1.03]"
        />
        <AvailabilityBadge available={car.available} className="absolute start-3 top-3 shadow-sm" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{car.brand}</p>
            <h3 className="mt-0.5 truncate text-lg font-bold text-ink-900">
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                <span className="sr-only">{car.brand} </span>
                {car.model}
              </Link>
            </h3>
          </div>
          <span className="shrink-0 rounded-lg bg-ink-50 px-2 py-1 text-xs font-semibold text-ink-600">{car.year}</span>
        </div>

        <div className="mt-4">
          <CarSpecs car={car} />
        </div>

        <div className="mt-5 border-t border-ink-100 pt-4">
          <Price amount={car.dailyPrice} />
        </div>

        {/* Buttons sit above the card-wide link overlay */}
        <div className="relative z-10 mt-4 flex flex-wrap gap-2 [&>*]:flex-[1_1_auto]">
          <Link href={href} className="btn-outline btn-sm">
            {t("viewDetails")}
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
          <WhatsAppButton
            href={rentHref}
            label={car.available ? t("rent") : t("askAvailability")}
            className="btn-whatsapp btn-sm"
          />
        </div>
      </div>
    </article>
  );
}
