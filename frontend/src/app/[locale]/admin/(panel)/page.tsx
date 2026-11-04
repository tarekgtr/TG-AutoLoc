"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CarFront, CheckCircle2, Plus, Sparkles, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAdmin } from "@/components/admin/AdminShell";
import { useApiError } from "@/components/admin/useApiError";
import { AdminCarThumb } from "@/components/admin/AdminCarThumb";
import { AvailabilityBadge } from "@/components/cars/AvailabilityBadge";
import { api } from "@/lib/api/client";
import type { AdminStats } from "@/lib/types";

export default function DashboardPage() {
  const t = useTranslations("admin.dashboard");
  const format = useFormatter();
  const { username } = useAdmin();
  const toMessage = useApiError();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<AdminStats>("/api/admin/stats").then(setStats, (e) => setError(toMessage(e)));
  }, [toMessage]);

  const cards = [
    { label: t("total"), value: stats?.totalCars, icon: CarFront, tone: "bg-ink-900 text-brand-400" },
    { label: t("available"), value: stats?.availableCars, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    { label: t("unavailable"), value: stats?.unavailableCars, icon: XCircle, tone: "bg-red-50 text-red-700" },
    { label: t("recent"), value: stats?.addedLast30Days, icon: Sparkles, tone: "bg-brand-50 text-brand-700" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">{t("welcome", { name: username })}</p>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("title")}</h1>
        </div>
        <Link href="/admin/cars/new" className="btn-primary">
          <Plus className="h-5 w-5" aria-hidden="true" />
          {t("addCar")}
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-sm text-ink-500">{label}</dt>
              <dd className="font-display text-3xl font-extrabold text-ink-900">
                {value ?? <span className="skeleton inline-block h-7 w-10 align-middle" aria-hidden="true" />}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <section className="card mt-8" aria-labelledby="recent-title">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 id="recent-title" className="font-bold text-ink-900">
            {t("recentCars")}
          </h2>
          <Link href="/admin/cars" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            {t("viewAll")}
          </Link>
        </div>
        {stats && stats.recentCars.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-500">{t("noCars")}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {(stats?.recentCars ?? []).map((car) => (
              <li key={car.id}>
                <Link href={`/admin/cars/${car.id}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-ink-50">
                  <AdminCarThumb car={car} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">
                      {car.brand} {car.model} <span className="font-normal text-ink-500">{car.year}</span>
                    </p>
                    <p className="text-xs text-ink-500">{format.dateTime(new Date(car.createdAt), { dateStyle: "medium" })}</p>
                  </div>
                  <AvailabilityBadge available={car.available} />
                </Link>
              </li>
            ))}
            {!stats &&
              !error &&
              Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-3" aria-hidden="true">
                  <div className="skeleton h-12 w-16" />
                  <div className="skeleton h-4 flex-1" />
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
