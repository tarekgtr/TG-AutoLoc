import { useTranslations } from "next-intl";
import { clsx } from "clsx";

export function AvailabilityBadge({ available, className }: { available: boolean; className?: string }) {
  const t = useTranslations("car");
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        available ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20" : "bg-red-50 text-red-800 ring-1 ring-red-600/20",
        className,
      )}
    >
      <span aria-hidden="true" className={clsx("h-1.5 w-1.5 rounded-full", available ? "bg-emerald-500" : "bg-red-500")} />
      {available ? t("available") : t("unavailable")}
    </span>
  );
}
