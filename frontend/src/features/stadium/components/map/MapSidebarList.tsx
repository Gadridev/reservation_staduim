import type { Stadium } from "../../types";
import { StadiumListCard } from "./MapListCard";

interface MapSidebarListProps {
  stadiums: Stadium[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MapSidebarList({ stadiums, selectedId, onSelect }: MapSidebarListProps) {
  return (
    <div className="flex flex-col gap-2.5 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
      {stadiums.map((stadium) => (
        <StadiumListCard
          key={stadium._id}
          stadium={stadium}
          isSelected={stadium._id === selectedId}
          onClick={() => onSelect(stadium._id)}
        />
      ))}
    </div>
  );
}
