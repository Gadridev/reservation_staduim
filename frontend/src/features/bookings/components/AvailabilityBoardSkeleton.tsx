export function AvailabilityBoardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading availability"
      className="animate-pulse rounded-[20px] bg-pitch-dark px-7 py-7"
    >
      <div className="h-6 w-48 rounded bg-white/10" />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div
            key={index}
            className="h-[70px] rounded-[11px] border border-white/10 bg-white/[0.06]"
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-5">
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/10" />
      </div>

      <span className="sr-only">Loading available time slots…</span>
    </div>
  );
}
