import { useTranslations } from "next-intl";
import { CarFront } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function CarNotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
        <CarFront className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-ink-900">{t("carTitle")}</h1>
      <p className="mt-2 text-ink-600">{t("carText")}</p>
      <Link href="/cars" className="btn-primary mt-8">
        {t("seeCars")}
      </Link>
    </div>
  );
}
