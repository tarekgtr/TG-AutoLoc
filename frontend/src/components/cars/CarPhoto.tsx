import Image from "next/image";
import { useTranslations } from "next-intl";
import { CarFront } from "lucide-react";
import { clsx } from "clsx";

/** Vehicle photo served by the backend (optimized by next/image), or a branded placeholder when there is none. */
export function CarPhoto({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const t = useTranslations("car");
  if (!src) {
    return (
      <div
        className={clsx(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-ink-800 to-ink-900 text-white/40",
          className,
        )}
      >
        <CarFront className="h-12 w-12" aria-hidden="true" />
        <span className="text-xs font-medium">{t("noPhoto")}</span>
      </div>
    );
  }
  return (
    <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={clsx("object-cover", className)} />
  );
}
