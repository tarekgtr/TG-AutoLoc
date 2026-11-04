import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { Link } from "@/i18n/navigation";
import { pageWindow } from "@/lib/pagination";

/** Link-based pagination (crawlable, works without JavaScript). `page` is 1-based. */
export function Pagination({
  page,
  totalPages,
  pathname,
  query,
}: {
  page: number;
  totalPages: number;
  pathname: string;
  query: Record<string, string>;
}) {
  const t = useTranslations("cars");
  if (totalPages <= 1) return null;

  const href = (p: number) => ({ pathname, query: { ...query, ...(p > 1 ? { page: String(p) } : {}) } });
  const navBtn = "inline-flex h-10 items-center gap-1 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium";

  return (
    <nav aria-label={t("pagination")} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={clsx(navBtn, "hover:bg-ink-50")} rel="prev">
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          {t("previous")}
        </Link>
      ) : (
        <span className={clsx(navBtn, "opacity-40")} aria-disabled="true">
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          {t("previous")}
        </span>
      )}

      <ul className="flex items-center gap-1">
        {pageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-400">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-label={t("goToPage", { page: p })}
                aria-current={p === page ? "page" : undefined}
                className={clsx(
                  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold",
                  p === page ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100",
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={clsx(navBtn, "hover:bg-ink-50")} rel="next">
          {t("next")}
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </Link>
      ) : (
        <span className={clsx(navBtn, "opacity-40")} aria-disabled="true">
          {t("next")}
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
