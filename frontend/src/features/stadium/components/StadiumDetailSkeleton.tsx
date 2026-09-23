import { Skeleton } from "../../../components/ui/Skeleton";

export function StadiumDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading stadium"
      className="mx-auto max-w-[1180px] px-7 py-6 pb-20"
    >
      <Skeleton className="mb-4 h-4 w-28" />

      <div className="grid h-[400px] grid-cols-1 gap-2.5 sm:grid-cols-[2fr_1fr]">
        <Skeleton className="rounded-[14px]" />
        <div className="hidden grid-rows-2 gap-2.5 sm:grid">
          <Skeleton className="rounded-[14px]" />
          <Skeleton className="rounded-[14px]" />
        </div>
      </div>

      <div className="mt-6 grid gap-9 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="mt-3 h-4 w-52" />
          <Skeleton className="mt-5 h-8 w-24 rounded-lg" />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 rounded-[10px]" />
            ))}
          </div>

          <Skeleton className="mt-7 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-2/3" />

          <Skeleton className="mt-8 h-44 rounded-xl" />
        </div>

        <Skeleton className="h-[330px] rounded-[14px]" />
      </div>

      <span className="sr-only">Loading stadium details…</span>
    </div>
  );
}
