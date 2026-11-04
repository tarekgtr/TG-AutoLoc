"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import type { CarImage } from "@/lib/types";
import { CarPhoto } from "./CarPhoto";

/** Main photo with previous/next controls, thumbnails, and arrow-key navigation (direction-aware). */
export function CarGallery({ images, name }: { images: CarImage[]; name: string }) {
  const t = useTranslations("car");
  const rtl = useLocale() === "ar";
  const [index, setIndex] = useState(() => Math.max(0, images.findIndex((i) => i.main)));
  const total = images.length;

  if (total === 0) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
        <CarPhoto src={null} alt="" sizes="100vw" />
      </div>
    );
  }

  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(rtl ? -1 : 1);
    if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
  };
  const current = images[index];

  return (
    <section aria-label={t("gallery")} aria-roledescription="carousel" onKeyDown={onKeyDown}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-ink-900">
        <Image
          key={current.id}
          src={current.url}
          alt={t("photoAlt", { name, index: index + 1 })}
          fill
          priority={index === 0 || current.main}
          sizes="(min-width: 1280px) 760px, (min-width: 1024px) 60vw, 100vw"
          className="animate-fade-up object-cover"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("previousPhoto")}
              className="absolute start-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("nextPhoto")}
              className="absolute end-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />
            </button>
            <span
              className="absolute bottom-3 end-3 rounded-full bg-ink-900/75 px-3 py-1 text-xs font-semibold text-white"
              aria-live="polite"
              dir="ltr"
            >
              {t("photoCount", { index: index + 1, total })}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t("showPhoto", { index: i + 1 })}
                aria-current={i === index}
                className={clsx(
                  "relative block h-16 w-24 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-28",
                  i === index ? "ring-brand-400" : "opacity-70 ring-transparent hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill sizes="112px" className="object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
