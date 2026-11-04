"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/site/ErrorState";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error("[page error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container py-20">
      <ErrorState
        title={t("title")}
        text={t("text")}
        action={
          <button type="button" onClick={reset} className="btn-dark btn-sm">
            {t("retry")}
          </button>
        }
      />
    </div>
  );
}
