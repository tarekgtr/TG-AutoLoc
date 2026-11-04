"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, Star, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AdminCarThumb } from "@/components/admin/AdminCarThumb";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toaster";
import { useApiError } from "@/components/admin/useApiError";
import { AvailabilityBadge } from "@/components/cars/AvailabilityBadge";
import { api } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";
import type { CarSummary, Page } from "@/lib/types";

const SORTS = ["NEWEST", "OLDEST", "UPDATED", "BRAND_ASC", "PRICE_ASC", "PRICE_DESC", "YEAR_DESC"] as const;
const PAGE_SIZE = 20;

export default function AdminCarsPage() {
  const t = useTranslations("admin");
  const tc = useTranslations("car");
  const locale = useLocale();
  const toast = useToast();
  const toMessage = useApiError();

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [availability, setAvailability] = useState<"" | "true" | "false">("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("NEWEST");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<CarSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CarSummary | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Debounce the search box.
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page: String(page), size: String(PAGE_SIZE) });
    if (q) params.set("q", q);
    if (availability) params.set("available", availability);
    try {
      setData(await api.get<Page<CarSummary>>(`/api/admin/cars?${params}`));
      setError(null);
    } catch (e) {
      setError(toMessage(e));
    } finally {
      setLoading(false);
    }
  }, [q, availability, sort, page, toMessage]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleAvailability(car: CarSummary) {
    setBusyId(car.id);
    try {
      await api.patch(`/api/admin/cars/${car.id}/availability`, { available: !car.available });
      toast.success(t("cars.availabilityUpdated"));
      await load();
    } catch (e) {
      toast.error(toMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await api.delete(`/api/admin/cars/${toDelete.id}`);
      toast.success(t("cars.deleted"));
      setToDelete(null);
      if (data && data.content.length === 1 && page > 0) setPage(page - 1);
      else await load();
    } catch (e) {
      toast.error(toMessage(e));
    }
  }

  const publicHref = (slug: string) => `${locale === "fr" ? "" : `/${locale}`}/cars/${slug}`;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("cars.title")}</h1>
          {data && <p className="mt-1 text-sm text-ink-500">{t("cars.total", { count: data.totalElements })}</p>}
        </div>
        <Link href="/admin/cars/new" className="btn-primary">
          <Plus className="h-5 w-5" aria-hidden="true" />
          {t("cars.add")}
        </Link>
      </div>

      <div className="card mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <label htmlFor="admin-search" className="sr-only">
            {t("cars.search")}
          </label>
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            id="admin-search"
            type="search"
            className="input ps-10"
            placeholder={t("cars.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="admin-availability" className="sr-only">
            {t("cars.availability")}
          </label>
          <select
            id="admin-availability"
            className="input"
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value as typeof availability);
              setPage(0);
            }}
          >
            <option value="">
              {t("cars.availability")}: {t("cars.all")}
            </option>
            <option value="true">{t("cars.availableOnly")}</option>
            <option value="false">{t("cars.unavailableOnly")}</option>
          </select>
        </div>
        <div>
          <label htmlFor="admin-sort" className="sr-only">
            {t("cars.sort")}
          </label>
          <select
            id="admin-sort"
            className="input"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as (typeof SORTS)[number]);
              setPage(0);
            }}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`cars.sortValues.${s}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          <button type="button" className="btn-outline btn-sm" onClick={load}>
            {t("common.retry")}
          </button>
        </div>
      )}

      <div className="card mt-6 overflow-x-auto" aria-busy={loading}>
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-ink-100 bg-ink-50/60 text-start text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">{t("cars.vehicle")}</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">{t("cars.price")}</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">{t("cars.status")}</th>
              <th scope="col" className="px-4 py-3 text-end font-semibold">{t("cars.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading && !data
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} aria-hidden="true">
                    <td className="px-4 py-3" colSpan={4}>
                      <div className="skeleton h-12" />
                    </td>
                  </tr>
                ))
              : data?.content.map((car) => (
                  <tr key={car.id} className="transition hover:bg-ink-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AdminCarThumb car={car} />
                        <div className="min-w-0">
                          <Link href={`/admin/cars/${car.id}`} className="font-semibold text-ink-900 hover:underline">
                            {car.brand} {car.model}
                          </Link>
                          <p className="flex items-center gap-2 text-xs text-ink-500">
                            <span>{car.year}</span>·
                            <span>{tc(`transmissionValues.${car.transmission}`)}</span>·
                            <span>{t("cars.photos", { count: car.imageCount })}</span>
                            {car.featured && (
                              <span className="inline-flex items-center gap-0.5 text-brand-700">
                                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                                {t("cars.featured")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-900">
                      {car.dailyPrice !== null ? formatPrice(car.dailyPrice, locale) : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <AvailabilityBadge available={car.available} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          label={car.available ? t("cars.markUnavailable") : t("cars.markAvailable")}
                          onClick={() => toggleAvailability(car)}
                          disabled={busyId === car.id}
                        >
                          {car.available ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5" />}
                        </IconButton>
                        <a
                          href={publicHref(car.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t("cars.preview")}
                          aria-label={`${t("cars.preview")} – ${car.brand} ${car.model}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/admin/cars/${car.id}`}
                          title={t("cars.edit")}
                          aria-label={`${t("cars.edit")} – ${car.brand} ${car.model}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <IconButton label={`${t("cars.delete")} – ${car.brand} ${car.model}`} onClick={() => setToDelete(car)} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {data && data.content.length === 0 && <p className="px-5 py-12 text-center text-sm text-ink-500">{t("cars.empty")}</p>}
      </div>

      {data && data.totalPages > 1 && (
        <nav aria-label={t("common.page", { page: page + 1, total: data.totalPages })} className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button type="button" className="btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            {t("common.previous")}
          </button>
          <span className="text-ink-600">{t("common.page", { page: page + 1, total: data.totalPages })}</span>
          <button type="button" className="btn-outline btn-sm" disabled={page + 1 >= data.totalPages} onClick={() => setPage(page + 1)}>
            {t("common.next")}
            <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          </button>
        </nav>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={t("cars.confirmDeleteTitle")}
        description={toDelete ? t("cars.confirmDeleteText", { name: `${toDelete.brand} ${toDelete.model}` }) : ""}
        confirmLabel={t("confirm.delete")}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50 ${
        danger ? "text-red-600 hover:bg-red-50" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );
}
