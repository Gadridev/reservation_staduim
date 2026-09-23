import { useState } from "react";
import { StadiumsMap } from "../features/stadium/components/map/StadiumsMap";
import { useAllStadium } from "../features/stadium/hooks/useAllStadium";
import { StadiumListCard } from "../features/stadium/components/map/MapListCard";
import { MapPageSkeleton } from "../features/stadium/components/map/MapPageSkeleton";

export function MapPage() {
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>();
  const { data, isLoading, isError, refetch } = useAllStadium();

  if (isLoading) {
    return <MapPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center bg-chalk">
        <p className="font-mono text-sm text-ink-soft">
          Couldn't load stadiums. Please try again.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-lg bg-pitch-dark px-4 py-2 text-sm font-semibold text-cream"
        >
          Try again
        </button>
      </div>
    );
  }

  const stadiums = data ?? [];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col bg-chalk p-4 pb-20 md:h-[calc(100vh-80px)] md:p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-ink">
            Explore Stadiums
          </h1>
          <p className="text-sm text-ink-soft">
            {stadiums.length} stadium{stadiums.length !== 1 ? "s" : ""} found · select a pin or
            card to view details
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row md:gap-6">
        <div className="h-[50vh] min-h-[300px] overflow-hidden rounded-2xl border border-line md:h-auto md:flex-1">
          <StadiumsMap
            stadiums={stadiums}
            selectedStadiumId={selectedStadiumId}
            onSelectStadium={setSelectedStadiumId}
          />
        </div>

        <div className="max-h-[36vh] w-full space-y-3 overflow-y-auto pb-4 pr-2 md:max-h-none md:w-[320px] md:shrink-0">
          {stadiums.length === 0 ? (
            <p className="p-4 text-center text-sm text-ink-soft">No stadiums found.</p>
          ) : (
            stadiums.map((stadium) => (
              <StadiumListCard
                key={stadium._id}
                stadium={stadium}
                isSelected={selectedStadiumId === stadium._id}
                onClick={() => setSelectedStadiumId(stadium._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
