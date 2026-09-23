import { SearchBar } from "../features/stadium/components/SearchBar";
import { FilterChips } from "../features/stadium/components/FilterChips";
import { StadiumCard } from "../features/stadium/components/StadiumCard";
import { EmptyState } from "../components/ui/States";
import { useAllStadium } from "../features/stadium/hooks/useAllStadium";
import { StadiumCardSkeleton } from "../features/stadium/components/StadiumCardSkeleton";

export function DiscoverPage() {

  const { isLoading: isStadium, data } = useAllStadium();

  const stadiums = Array.isArray(data) ? data : [];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-pitch-dark to-pitch px-7 py-16 text-cream">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0_2px,transparent_2px_64px)] opacity-40" />
        <div className="relative mx-auto max-w-[1180px]">
          <p className="mb-3.5 font-mono text-xs tracking-[0.18em] text-amber">
            NO MORE PHONE-CALL BOOKINGS
          </p>
          <h1 className="font-display mb-4 max-w-[720px] text-5xl font-black uppercase leading-[0.98] tracking-wide sm:text-6xl">
            Book the pitch.
            <br />
            Skip the <span className="text-amber">middleman.</span>
          </h1>
          <p className="mb-8 max-w-[520px] text-base leading-relaxed text-cream/70">
            Compare stadiums, check real availability, and lock your slot in seconds — no calls, no
            forgotten reservations.
          </p>

          <SearchBar />

          <div className="mt-6">
            <FilterChips />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-11">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-[28px] font-black uppercase tracking-wide text-ink">
            Stadiums near Beni Mellal
          </h2>
          <span className="font-mono text-[13px] text-ink-soft">{stadiums.length} results</span>
        </div>

        {isStadium ? (
          <div
            role="status"
            aria-label="Loading stadiums"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <StadiumCardSkeleton key={i} />
            ))}
            <span className="sr-only">Loading stadiums…</span>
          </div>
        ) : stadiums.length === 0 ? (
          <EmptyState
            icon="🏟️"
            title="No stadiums found"
            description="Try widening your search or removing a filter."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stadiums.map((stadium) => (
              <StadiumCard key={stadium._id} stadium={stadium} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
