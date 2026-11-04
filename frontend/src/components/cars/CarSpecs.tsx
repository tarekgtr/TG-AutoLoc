import { useTranslations } from "next-intl";
import { CalendarDays, Cog, Fuel, Users } from "lucide-react";
import { clsx } from "clsx";
import type { FuelType, Transmission } from "@/lib/types";

interface Specs {
  year: number;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
}

/** Compact (card) or detailed (details page) list of vehicle specifications. */
export function CarSpecs({ car, variant = "compact" }: { car: Specs; variant?: "compact" | "detailed" }) {
  const t = useTranslations("car");
  const items = [
    { icon: CalendarDays, label: t("year"), value: String(car.year) },
    { icon: Cog, label: t("transmission"), value: t(`transmissionValues.${car.transmission}`) },
    { icon: Fuel, label: t("fuel"), value: t(`fuelValues.${car.fuelType}`) },
    { icon: Users, label: t("seatsLabel"), value: t("seats", { count: car.seats }) },
  ];

  if (variant === "detailed") {
    return (
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <Icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
            <dt className="mt-3 text-xs text-ink-500">{label}</dt>
            <dd className="mt-0.5 font-semibold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-ink-600">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className={clsx("flex min-w-0 items-center gap-2")}>
          <Icon className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          <dt className="sr-only">{label}</dt>
          <dd className="truncate">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
