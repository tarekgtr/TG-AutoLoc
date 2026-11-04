import Image from "next/image";
import { CarFront } from "lucide-react";
import type { CarSummary } from "@/lib/types";

export function AdminCarThumb({ car }: { car: Pick<CarSummary, "mainImage" | "brand" | "model"> }) {
  return (
    <span className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-100 text-ink-400">
      {car.mainImage ? (
        <Image src={car.mainImage.url} alt={`${car.brand} ${car.model}`} fill sizes="64px" className="object-cover" />
      ) : (
        <CarFront className="h-5 w-5" aria-hidden="true" />
      )}
    </span>
  );
}
