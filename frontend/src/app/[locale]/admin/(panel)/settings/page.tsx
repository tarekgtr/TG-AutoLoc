"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { FormSection } from "@/components/admin/FormSection";
import { Field } from "@/components/admin/Field";
import { useToast } from "@/components/admin/Toaster";
import { useApiError, useFieldError } from "@/components/admin/useApiError";
import { api, ApiError } from "@/lib/api/client";
import { formatPhone } from "@/lib/format";
import type { BusinessSettings } from "@/lib/types";

type Key = Exclude<keyof BusinessSettings, "updatedAt">;
const KEYS: Key[] = [
  "whatsappNumber",
  "phoneNumber",
  "secondaryPhone",
  "email",
  "locationFr",
  "locationAr",
  "openingHoursFr",
  "openingHoursAr",
  "mapsUrl",
  "facebookUrl",
];
type FormValues = Record<Key, string>;

const toForm = (s: BusinessSettings): FormValues =>
  Object.fromEntries(KEYS.map((k) => [k, k.endsWith("Number") || k === "secondaryPhone" ? (s[k] ? formatPhone(s[k]!) : "") : (s[k] ?? "")])) as FormValues;

export default function SettingsPage() {
  const t = useTranslations("admin.settings");
  const tForm = useTranslations("admin.form");
  const format = useFormatter();
  const toast = useToast();
  const toMessage = useApiError();
  const fieldError = useFieldError();
  const [values, setValues] = useState<FormValues | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    api.get<BusinessSettings>("/api/admin/settings").then(
      (s) => {
        setValues(toForm(s));
        setUpdatedAt(s.updatedAt);
      },
      (e) => setLoadError(toMessage(e)),
    );
  }, [toMessage]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values) return;
    setSaving(true);
    setErrors({});
    try {
      const body = Object.fromEntries(KEYS.map((k) => [k, values[k].trim() || null]));
      const saved = await api.put<BusinessSettings>("/api/admin/settings", body);
      setValues(toForm(saved));
      setUpdatedAt(saved.updatedAt);
      toast.success(t("saved"));
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors);
      toast.error(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <p role="alert" className="mx-auto max-w-4xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}
      </p>
    );
  }
  if (!values) {
    return (
      <div className="flex justify-center py-20" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" aria-hidden="true" />
      </div>
    );
  }

  const input = (key: Key, props: { type?: string; dir?: "ltr" | "rtl"; placeholder?: string; inputMode?: "tel" | "email" | "url" } = {}) => (
    <input
      className="input"
      value={values[key]}
      onChange={(e) => {
        setValues({ ...values, [key]: e.target.value });
        if (errors[key]) setErrors({ ...errors, [key]: "" });
      }}
      maxLength={key.endsWith("Url") ? 500 : 255}
      {...props}
    />
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{t("title")}</h1>
      <p className="mt-1 text-sm text-ink-600">{t("subtitle")}</p>
      {updatedAt && <p className="mt-1 text-xs text-ink-500">{t("lastUpdate", { date: format.dateTime(new Date(updatedAt), { dateStyle: "medium", timeStyle: "short" }) })}</p>}

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-6">
        <FormSection title={t("contactSection")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="whatsappNumber" label={t("whatsapp")} hint={t("whatsappHint")} error={fieldError(errors.whatsappNumber)} className="sm:col-span-2">
              {input("whatsappNumber", { type: "tel", dir: "ltr", inputMode: "tel", placeholder: "05XX XX XX XX" })}
            </Field>
            <Field id="phoneNumber" label={t("phone")} error={fieldError(errors.phoneNumber)}>
              {input("phoneNumber", { type: "tel", dir: "ltr", inputMode: "tel" })}
            </Field>
            <Field id="secondaryPhone" label={t("secondaryPhone")} error={fieldError(errors.secondaryPhone)}>
              {input("secondaryPhone", { type: "tel", dir: "ltr", inputMode: "tel" })}
            </Field>
            <Field id="email" label={t("email")} error={fieldError(errors.email)} className="sm:col-span-2">
              {input("email", { type: "email", dir: "ltr", inputMode: "email" })}
            </Field>
          </div>
        </FormSection>

        <FormSection title={t("locationSection")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="locationFr" label={t("locationFr")} error={fieldError(errors.locationFr)}>
              {input("locationFr", { dir: "ltr" })}
            </Field>
            <Field id="locationAr" label={t("locationAr")} error={fieldError(errors.locationAr)}>
              {input("locationAr", { dir: "rtl" })}
            </Field>
            <Field id="openingHoursFr" label={t("hoursFr")} error={fieldError(errors.openingHoursFr)}>
              {input("openingHoursFr", { dir: "ltr", placeholder: t("hoursPlaceholder") })}
            </Field>
            <Field id="openingHoursAr" label={t("hoursAr")} error={fieldError(errors.openingHoursAr)}>
              {input("openingHoursAr", { dir: "rtl" })}
            </Field>
          </div>
        </FormSection>

        <FormSection title={t("linksSection")}>
          <div className="grid gap-5">
            <Field id="mapsUrl" label={t("mapsUrl")} hint={t("mapsHint")} error={fieldError(errors.mapsUrl)}>
              {input("mapsUrl", { type: "url", dir: "ltr", inputMode: "url", placeholder: "https://maps.app.goo.gl/…" })}
            </Field>
            <Field id="facebookUrl" label={t("facebook")} error={fieldError(errors.facebookUrl)}>
              {input("facebookUrl", { type: "url", dir: "ltr", inputMode: "url" })}
            </Field>
          </div>
        </FormSection>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary min-w-40" disabled={saving}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
            {saving ? tForm("saving") : t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
