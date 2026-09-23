import type { Stadium } from "../../types";
import { MapListCard } from "./MapListCard";

interface MapSidebarListProps {
  stadiums: Stadium[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MapSidebarList({ stadiums, selectedId, onSelect }: MapSidebarListProps) {
  return (
    <div className="flex flex-col gap-2.5 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
      {stadiums.map((stadium) => (
        <MapListCard
          key={stadium.id}
          stadium={stadium}
          isActive={stadium.id === selectedId}
          onClick={() => onSelect(stadium.id)}
        />
      ))}
    </div>
  );
}
