import { Skeleton } from "./Skeleton";

export function PageLoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto min-h-[70vh] max-w-[1180px] px-7 py-10"
    >
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-5 h-10 w-72 max-w-full" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-40 rounded-[14px]" />
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
