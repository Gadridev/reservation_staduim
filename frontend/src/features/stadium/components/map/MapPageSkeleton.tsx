import { Skeleton } from "../../../../components/ui/Skeleton";

export function MapPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading stadium map"
      className="mx-auto flex h-[calc(100vh-80px)] max-w-7xl flex-col bg-chalk p-6"
    >
      <div className="mb-4 flex items-end justify-between">
        <div>
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="hidden h-10 w-40 rounded-full sm:block" />
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        <Skeleton className="flex-1 rounded-2xl" />

        <div className="hidden w-[320px] shrink-0 space-y-3 md:block">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-xl border border-line p-3"
            >
              <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading stadium map…</span>
    </div>
  );
}
