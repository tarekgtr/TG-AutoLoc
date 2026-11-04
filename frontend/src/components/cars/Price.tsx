import { useLocale, useTranslations } from "next-intl";
import { clsx } from "clsx";
import { formatPrice } from "@/lib/format";

export function Price({ amount, size = "md" }: { amount: number | null; size?: "md" | "lg" }) {
  const t = useTranslations("car");
  const locale = useLocale();
  if (amount === null || amount === undefined) {
    return <span className="text-sm font-medium text-ink-500">{t("priceOnRequest")}</span>;
  }
  return (
    <span className="whitespace-nowrap">
      <span className={clsx("font-display font-extrabold text-ink-900", size === "lg" ? "text-3xl" : "text-xl")}>
        {formatPrice(amount, locale)}
      </span>{" "}
      <span className="text-sm text-ink-500">{t("perDay")}</span>
    </span>
  );
}
