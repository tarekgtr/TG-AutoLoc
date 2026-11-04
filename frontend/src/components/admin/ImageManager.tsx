"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { api } from "@/lib/api/client";
import type { CarDetail, CarImage } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toaster";
import { useApiError } from "./useApiError";

/** Must match the backend limits (app.storage.*). */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_MB = 8;

export function ImageManager({ car, onChange }: { car: CarDetail; onChange: (car: CarDetail) => void }) {
  const t = useTranslations("admin.images");
  const tErr = useTranslations("admin.errors");
  const toast = useToast();
  const toMessage = useApiError();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toRemove, setToRemove] = useState<CarImage | null>(null);

  async function upload(files: File[]) {
    if (files.length === 0) return;
    const invalidType = files.find((f) => !ALLOWED_IMAGE_TYPES.includes(f.type));
    if (invalidType) return toast.error(tErr("unsupported_image_type"));
    if (files.some((f) => f.size > MAX_IMAGE_MB * 1024 * 1024)) return toast.error(tErr("file_too_large"));

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    setUploading(true);
    try {
      const updated = await api.post<CarDetail>(`/api/admin/cars/${car.id}/images`, form);
      onChange(updated);
      toast.success(t("uploaded", { count: files.length }));
    } catch (e) {
      toast.error(toMessage(e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function setMain(image: CarImage) {
    setBusyId(image.id);
    try {
      onChange(await api.put<CarDetail>(`/api/admin/cars/${car.id}/images/${image.id}/main`));
      toast.success(t("mainUpdated"));
    } catch (e) {
      toast.error(toMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!toRemove) return;
    try {
      onChange(await api.delete<CarDetail>(`/api/admin/cars/${car.id}/images/${toRemove.id}`));
      toast.success(t("removed"));
      setToRemove(null);
    } catch (e) {
      toast.error(toMessage(e));
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    upload(Array.from(e.dataTransfer.files));
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="images-title">
      <h2 id="images-title" className="font-bold text-ink-900">
        {t("title")}
      </h2>
      <p className="mt-1 text-xs text-ink-500">{t("hint", { size: MAX_IMAGE_MB })}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          "mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
          dragging ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-ink-50",
        )}
      >
        {uploading ? (
          <p className="flex items-center gap-2 text-sm font-medium text-ink-700" role="status">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            {t("uploading")}
          </p>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-ink-400" aria-hidden="true" />
            <p className="mt-2 text-sm text-ink-600">
              {t("drop")}{" "}
              <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-ink-900 underline underline-offset-4">
                {t("browse")}
              </button>
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-label={t("add")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => upload(Array.from(e.target.files ?? []))}
        />
      </div>

      {car.images.length === 0 ? (
        <p className="mt-5 text-center text-sm text-ink-500">{t("empty")}</p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
          {car.images.map((img, i) => (
            <li key={img.id} className={clsx("overflow-hidden rounded-xl border bg-white", img.main ? "border-brand-400 ring-2 ring-brand-400" : "border-ink-100")}>
              <div className="relative aspect-[4/3] bg-ink-100">
                <Image src={img.url} alt={t("alt", { index: i + 1 })} fill sizes="(min-width: 640px) 220px, 45vw" className="object-cover" />
                {img.main && (
                  <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-400 px-2 py-0.5 text-xs font-bold text-ink-900">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    {t("main")}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <button
                  type="button"
                  onClick={() => setMain(img)}
                  disabled={img.main || busyId === img.id}
                  title={t("setMain")}
                  className="btn-ghost btn-sm min-w-0 px-2 text-xs disabled:opacity-40"
                >
                  <Star className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate">{t("setMain")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToRemove(img)}
                  aria-label={`${t("remove")} ${i + 1}`}
                  title={t("remove")}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toRemove !== null}
        title={t("confirmRemoveTitle")}
        description={t("confirmRemoveText")}
        confirmLabel={t("remove")}
        onConfirm={remove}
        onClose={() => setToRemove(null)}
      />
    </section>
  );
}
