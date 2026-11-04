"use client";

import { use, useEffect, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CarForm } from "@/components/admin/CarForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { useApiError } from "@/components/admin/useApiError";
import { AvailabilityBadge } from "@/components/cars/AvailabilityBadge";
import { api } from "@/lib/api/client";
import type { CarDetail } from "@/lib/types";

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("admin");
  const locale = useLocale();
  const format = useFormatter();
  const toMessage = useApiError();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!/^\d+$/.test(id)) {
      setError(t("errors.not_found"));
      return;
    }
    api.get<CarDetail>(`/api/admin/cars/${id}`).then(setCar, (e) => setError(toMessage(e)));
  }, [id, t, toMessage]);

  const back = (
    <Link href="/admin/cars" className="inline-flex items-center gap-1 text-sm font-medium text-ink-600 hover:text-ink-900">
      <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
      {t("form.back")}
    </Link>
  );

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        {back}
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      </div>
    );
  }
  if (!car) {
    return (
      <div className="flex justify-center py-20" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" aria-hidden="true" />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    );
  }

  const publicHref = `${locale === "fr" ? "" : `/${locale}`}/cars/${car.slug}`;
  const date = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="mx-auto max-w-6xl">
      {back}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
            {car.brand} {car.model} <span className="font-semibold text-ink-400">{car.year}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
            <AvailabilityBadge available={car.available} />
            <span>{t("form.createdAt", { date: date(car.createdAt) })}</span>
            <span>{t("form.updatedAt", { date: date(car.updatedAt) })}</span>
            <span>
              {t("form.slug")}: <code dir="ltr">/cars/{car.slug}</code>
            </span>
          </div>
        </div>
        <a href={publicHref} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          {t("cars.preview")}
        </a>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_400px]">
        {/* Keyed by id only: photo changes must not reset unsaved form edits. */}
        <CarForm key={car.id} car={car} onSaved={setCar} />
        <div className="xl:sticky xl:top-6">
          <ImageManager car={car} onChange={setCar} />
        </div>
      </div>
    </div>
  );
}
