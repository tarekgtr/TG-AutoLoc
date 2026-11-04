"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import {
  initialCarForm,
  maxYear,
  MIN_YEAR,
  toCarRequest,
  validateCarForm,
  type CarFormErrors,
  type CarFormValues,
} from "@/lib/carForm";
import { FUEL_TYPES, TRANSMISSIONS, type CarDetail } from "@/lib/types";
import { FormSection } from "@/components/admin/FormSection";
import { Field } from "./Field";
import { useToast } from "./Toaster";
import { useApiError, useFieldError } from "./useApiError";

/** Create (no `car`) or edit form for a vehicle. */
export function CarForm({ car, onSaved }: { car?: CarDetail | null; onSaved: (car: CarDetail) => void }) {
  const t = useTranslations("admin.form");
  const tc = useTranslations("car");
  const toast = useToast();
  const toMessage = useApiError();
  const fieldError = useFieldError();
  const [values, setValues] = useState<CarFormValues>(() => initialCarForm(car));
  const [errors, setErrors] = useState<CarFormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CarFormValues>(key: K, value: CarFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clientErrors = validateCarForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      toast.error(t("invalidForm"));
      e.currentTarget.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setSaving(true);
    try {
      const body = toCarRequest(values);
      const saved = car
        ? await api.put<CarDetail>(`/api/admin/cars/${car.id}`, body)
        : await api.post<CarDetail>("/api/admin/cars", body);
      toast.success(car ? t("saved") : t("created"));
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.code === "year_range") setErrors({ year: "year_range" });
      else if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors as CarFormErrors);
      toast.error(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const err = (k: keyof CarFormValues) => fieldError(errors[k]);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <FormSection title={t("general")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="brand" label={t("brand")} error={err("brand")} required>
            <input className="input" value={values.brand} onChange={(e) => set("brand", e.target.value)} placeholder={t("brandPlaceholder")} maxLength={60} />
          </Field>
          <Field id="model" label={t("model")} error={err("model")} required>
            <input className="input" value={values.model} onChange={(e) => set("model", e.target.value)} placeholder={t("modelPlaceholder")} maxLength={80} />
          </Field>
          <Field id="year" label={t("year")} error={err("year")} required>
            <input className="input" type="number" inputMode="numeric" min={MIN_YEAR} max={maxYear()} value={values.year} onChange={(e) => set("year", e.target.value)} />
          </Field>
          <Field id="dailyPrice" label={t("dailyPrice")} hint={t("priceHint")} error={err("dailyPrice")}>
            <input className="input" type="number" inputMode="decimal" min={0} step={100} value={values.dailyPrice} onChange={(e) => set("dailyPrice", e.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("specs")}>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="transmission" label={t("transmission")} required>
            <select className="input" value={values.transmission} onChange={(e) => set("transmission", e.target.value as CarFormValues["transmission"])}>
              {TRANSMISSIONS.map((v) => (
                <option key={v} value={v}>
                  {tc(`transmissionValues.${v}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="fuelType" label={t("fuel")} required>
            <select className="input" value={values.fuelType} onChange={(e) => set("fuelType", e.target.value as CarFormValues["fuelType"])}>
              {FUEL_TYPES.map((v) => (
                <option key={v} value={v}>
                  {tc(`fuelValues.${v}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field id="seats" label={t("seats")} error={err("seats")} required>
            <input className="input" type="number" inputMode="numeric" min={1} max={9} value={values.seats} onChange={(e) => set("seats", e.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("descriptions")}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field id="descriptionFr" label={t("descriptionFr")} error={err("descriptionFr")}>
            <textarea className="input min-h-36" dir="ltr" lang="fr" value={values.descriptionFr} onChange={(e) => set("descriptionFr", e.target.value)} maxLength={5000} />
          </Field>
          <Field id="descriptionAr" label={t("descriptionAr")} error={err("descriptionAr")}>
            <textarea className="input min-h-36" dir="rtl" lang="ar" value={values.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} maxLength={5000} />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("visibility")}>
        <div className="space-y-4">
          <Toggle id="available" checked={values.available} onChange={(v) => set("available", v)} label={t("available")} hint={t("availableHint")} />
          <Toggle id="featured" checked={values.featured} onChange={(v) => set("featured", v)} label={t("featured")} hint={t("featuredHint")} />
        </div>
      </FormSection>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary min-w-40" disabled={saving}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
          {saving ? t("saving") : car ? t("save") : t("create")}
        </button>
      </div>
    </form>
  );
}


function Toggle({ id, checked, onChange, label, hint }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-describedby={`${id}-hint`} />
      <span
        aria-hidden="true"
        className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full bg-ink-200 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2 after:absolute after:start-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5"
      />
      <span>
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        <span id={`${id}-hint`} className="block text-xs text-ink-500">
          {hint}
        </span>
      </span>
    </label>
  );
}
