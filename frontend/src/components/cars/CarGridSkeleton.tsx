/** Placeholder grid shown while vehicles load. */
export function CarGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[16/10] rounded-none" />
          <div className="space-y-4 p-5">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-5 w-2/3" />
            <div className="grid grid-cols-2 gap-2">
              <div className="skeleton h-4" />
              <div className="skeleton h-4" />
              <div className="skeleton h-4" />
              <div className="skeleton h-4" />
            </div>
            <div className="skeleton h-6 w-1/2" />
            <div className="grid grid-cols-2 gap-2">
              <div className="skeleton h-9" />
              <div className="skeleton h-9" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
