"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";

/**
 * Translates API errors to messages in the current language. A 401 means the session expired:
 * the admin is sent back to the login page.
 */
export function useApiError() {
  const t = useTranslations("admin.errors");
  const router = useRouter();

  return useCallback(
    (error: unknown): string => {
      if (error instanceof ApiError) {
        if (error.status === 401 && error.code !== "invalid_credentials") {
          router.replace({ pathname: "/admin/login", query: { expired: "1" } });
          return t("unauthorized");
        }
        return t.has(error.code) ? t(error.code) : t("generic");
      }
      console.error(error);
      return t("generic");
    },
    [router, t],
  );
}

/** Translates a backend/validation field error code (e.g. "required", "invalid_phone"). */
export function useFieldError() {
  const t = useTranslations("admin.validation");
  return useCallback((code: string | undefined) => (code ? (t.has(code) ? t(code) : code) : undefined), [t]);
}
