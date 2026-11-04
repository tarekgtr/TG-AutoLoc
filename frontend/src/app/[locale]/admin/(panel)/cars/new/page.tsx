"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { CarForm } from "@/components/admin/CarForm";

export default function NewCarPage() {
  const t = useTranslations("admin");
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/cars" className="inline-flex items-center gap-1 text-sm font-medium text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        {t("form.back")}
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("form.newTitle")}</h1>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* After creation, continue on the edit page where photos can be uploaded. */}
        <CarForm onSaved={(car) => router.replace(`/admin/cars/${car.id}`)} />
        <aside className="card flex h-fit items-start gap-3 p-5 text-sm text-ink-600">
          <ImagePlus className="h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
          {t("images.saveFirst")}
        </aside>
      </div>
    </div>
  );
}
