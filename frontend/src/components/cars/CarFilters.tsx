"use client";

import { useState, useTransition, type FormEvent, type SelectHTMLAttributes } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "@/i18n/navigation";
import { FILTER_KEYS, type FilterValues } from "@/lib/carFilters";
import { FUEL_TYPES, PUBLIC_SORTS, TRANSMISSIONS } from "@/lib/types";

/** Filters are reflected in the URL (bookmarkable, shareable). The form also works as a plain GET form. */
export function CarFilters({ values, brands }: { values: FilterValues; brands: string[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function navigate(form: HTMLFormElement) {
    const data = new FormData(form);
    const query: Record<string, string> = {};
    for (const key of FILTER_KEYS) {
      const v = String(data.get(key) ?? "").trim();
      if (v && !(key === "sort" && v === "NEWEST")) query[key] = v;
    }
    startTransition(() => router.push({ pathname: "/cars", query }, { scroll: false }));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate(e.currentTarget);
  }

  const action = locale === "fr" ? "/cars" : `/${locale}/cars`;
  const hasFilters = FILTER_KEYS.some((k) => values[k] && !(k === "sort" && values[k] === "NEWEST"));

  return (
    <div className="card p-4 sm:p-5">
      <form action={action} method="get" onSubmit={onSubmit} role="search" aria-busy={pending}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="filter-q" className="sr-only">
              {t("cars.search")}
            </label>
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              id="filter-q"
              name="q"
              type="search"
              defaultValue={values.q}
              placeholder={t("cars.searchPlaceholder")}
              className="input ps-10"
              maxLength={80}
            />
          </div>
          <button type="submit" className="btn-dark btn-sm hidden sm:inline-flex" disabled={pending}>
            {t("cars.search")}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="filter-panel"
            className="btn-outline btn-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{open ? t("cars.hideFilters") : t("cars.filters")}</span>
          </button>
        </div>

        <div
          id="filter-panel"
          className={clsx("mt-4 grid-cols-2 gap-3 md:grid-cols-3 lg:grid lg:grid-cols-6", open ? "grid" : "hidden")}
        >
          <Select id="filter-brand" name="brand" label={t("cars.brand")} defaultValue={values.brand}>
            <option value="">{t("cars.allBrands")}</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select id="filter-transmission" name="transmission" label={t("cars.transmission")} defaultValue={values.transmission}>
            <option value="">{t("cars.all")}</option>
            {TRANSMISSIONS.map((v) => (
              <option key={v} value={v}>
                {t(`car.transmissionValues.${v}`)}
              </option>
            ))}
          </Select>
          <Select id="filter-fuel" name="fuelType" label={t("cars.fuel")} defaultValue={values.fuelType}>
            <option value="">{t("cars.all")}</option>
            {FUEL_TYPES.map((v) => (
              <option key={v} value={v}>
                {t(`car.fuelValues.${v}`)}
              </option>
            ))}
          </Select>
          <div>
            <label htmlFor="filter-min" className="label text-xs">
              {t("cars.minPrice")}
            </label>
            <input id="filter-min" name="minPrice" type="number" min={0} step={100} inputMode="numeric" defaultValue={values.minPrice} className="input" />
          </div>
          <div>
            <label htmlFor="filter-max" className="label text-xs">
              {t("cars.maxPrice")}
            </label>
            <input id="filter-max" name="maxPrice" type="number" min={0} step={100} inputMode="numeric" defaultValue={values.maxPrice} className="input" />
          </div>
          <Select
            id="filter-sort"
            name="sort"
            label={t("cars.sort")}
            defaultValue={values.sort || "NEWEST"}
            onChange={(e) => e.currentTarget.form && navigate(e.currentTarget.form)}
          >
            {PUBLIC_SORTS.map((v) => (
              <option key={v} value={v}>
                {t(`cars.sortValues.${v}`)}
              </option>
            ))}
          </Select>

          <div className="col-span-full flex flex-wrap justify-end gap-2 pt-1">
            {hasFilters && (
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => startTransition(() => router.push("/cars", { scroll: false }))}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t("cars.reset")}
              </button>
            )}
            <button type="submit" className="btn-primary btn-sm" disabled={pending}>
              {t("cars.apply")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Select({
  id,
  label,
  children,
  ...props
}: { id: string; label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={id} className="label text-xs">
        {label}
      </label>
      <select id={id} className="input pe-8" {...props}>
        {children}
      </select>
    </div>
  );
}
