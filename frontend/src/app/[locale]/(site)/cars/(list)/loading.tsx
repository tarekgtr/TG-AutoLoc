import { CarGridSkeleton } from "@/components/cars/CarGridSkeleton";

export default function Loading() {
  return (
    <>
      <div className="bg-ink-900">
        <div className="container space-y-3 py-12 sm:py-16">
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-9 w-2/3 max-w-md animate-pulse rounded bg-white/10" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="container -mt-6 pb-20 sm:-mt-8">
        <div className="card h-[74px] animate-pulse" />
        <div className="mt-8" role="status">
          <CarGridSkeleton />
        </div>
      </div>
    </>
  );
}
