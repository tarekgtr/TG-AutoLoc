import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CarCard } from "@/components/cars/CarCard";
import { CarFilters } from "@/components/cars/CarFilters";
import { FILTER_KEYS, type FilterValues } from "@/lib/carFilters";
import { Pagination } from "@/components/cars/Pagination";
import { ErrorState } from "@/components/site/ErrorState";
import { PageHero } from "@/components/site/PageHero";
import { fetchBrands, fetchCars, fetchSettings } from "@/lib/api/server";
import { alternates } from "@/lib/site";
import { FUEL_TYPES, PUBLIC_SORTS, TRANSMISSIONS, type CarSummary, type Page } from "@/lib/types";

const PAGE_SIZE = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("carsTitle"),
    description: t("carsDescription"),
    alternates: alternates(locale, "/cars"),
    openGraph: { title: t("carsTitle"), description: t("carsDescription") },
  };
}

/** Only whitelisted, well-formed filter values are forwarded to the API. */
function parseFilters(sp: Record<string, string | string[] | undefined>): FilterValues & { page: number } {
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim().slice(0, 80) : "");
  const num = (k: string) => (/^\d{1,9}$/.test(str(k)) ? str(k) : "");
  const oneOf = <T extends string>(k: string, allowed: readonly T[]) => (allowed.includes(str(k) as T) ? str(k) : "");
  const page = Math.max(1, Number.parseInt(str("page"), 10) || 1);
  return {
    q: str("q"),
    brand: str("brand"),
    transmission: oneOf("transmission", TRANSMISSIONS),
    fuelType: oneOf("fuelType", FUEL_TYPES),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    sort: oneOf("sort", PUBLIC_SORTS),
    page,
  };
}

export default async function CarsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("cars");
  const filters = parseFilters(await searchParams);
  const { page, ...values } = filters;

  let result: Page<CarSummary> | null = null;
  let brands: string[] = [];
  try {
    [result, brands] = await Promise.all([
      fetchCars({ ...values, page: page - 1, size: PAGE_SIZE }),
      fetchBrands(),
    ]);
  } catch {
    result = null;
  }
  const settings = await fetchSettings();

  const query = Object.fromEntries(FILTER_KEYS.filter((k) => values[k]).map((k) => [k, values[k]]));

  return (
    <>
      <PageHero eyebrow="TG AutoLoc" title={t("title")} subtitle={t("subtitle")} />
      <div className="container -mt-6 pb-20 sm:-mt-8">
        {/* Remount when the URL changes so uncontrolled inputs show the active filters. */}
        <CarFilters key={JSON.stringify(values)} values={values} brands={brands} />

        <div className="mt-8">
          {result === null ? (
            <ErrorState
              title={t("errorTitle")}
              text={t("errorText")}
              action={
                <Link href={{ pathname: "/cars", query: { ...query, ...(page > 1 ? { page: String(page) } : {}) } }} className="btn-dark btn-sm">
                  {t("retry")}
                </Link>
              }
            />
          ) : result.content.length === 0 ? (
            <div className="card mx-auto flex max-w-xl flex-col items-center px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
                <SearchX className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink-900">{t("emptyTitle")}</h2>
              <p className="mt-2 text-sm text-ink-600">{t("emptyText")}</p>
              <Link href="/cars" className="btn-outline btn-sm mt-6">
                {t("reset")}
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm font-medium text-ink-600" aria-live="polite">
                {t("results", { count: result.totalElements })}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.content.map((car, i) => (
                  <CarCard key={car.id} car={car} whatsappNumber={settings?.whatsappNumber ?? null} priority={i < 3} />
                ))}
              </div>
              <Pagination page={result.page + 1} totalPages={result.totalPages} pathname="/cars" query={query} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
