import type { Stadium } from "../../types";
import { MOCK_MAP_POSITIONS } from "../../mapPositions";
import { MapPin } from "./MapPin";
import { MapPopup } from "./MapPopup";

interface MapCanvasProps {
  stadiums: Stadium[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ROAD_LINES = {
  horizontal: ["18%", "52%", "80%"],
  vertical: ["22%", "58%", "82%"],
};

export function MapCanvas({ stadiums, selectedId, onSelect }: MapCanvasProps) {
  const selectedStadium = stadiums.find((stadium) => stadium._id === selectedId) ?? null;
  const selectedPosition = selectedId ? MOCK_MAP_POSITIONS[selectedId] : null;

  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-line bg-[#e7e3d2] lg:h-[640px]">
      {ROAD_LINES.horizontal.map((top) => (
        <div key={top} style={{ top }} className="absolute inset-x-0 h-3.5 bg-[#f6f3e8]" />
      ))}
      {ROAD_LINES.vertical.map((left) => (
        <div key={left} style={{ left }} className="absolute inset-y-0 w-3.5 bg-[#f6f3e8]" />
      ))}
      <div className="absolute left-[24%] top-[20%] h-[30%] w-[32%] rounded-md bg-turf/[0.07]" />
      <div className="absolute left-[60%] top-[54%] h-[24%] w-[20%] rounded-md bg-turf/[0.07]" />

      { }
      <span className="absolute left-[45%] top-[58%] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,127,217,0.25)]" />

      {stadiums.map((stadium) => {
        const position = MOCK_MAP_POSITIONS[stadium._id];
        if (!position) return null;
        return (
          <MapPin
            key={stadium._id}
            price={stadium.pricePerHour}
            top={position.top}
            left={position.left}
            isActive={stadium._id === selectedId}
            onClick={() => onSelect(stadium._id)}
          />
        );
      })}

      {selectedStadium && selectedPosition && (
        <MapPopup stadium={selectedStadium} top={selectedPosition.top} left={selectedPosition.left} />
      )}

      <div className="absolute bottom-4 right-4 z-10 overflow-hidden rounded-lg bg-chalk shadow-lg">
        <button type="button" className="block h-9 w-9 border-b border-line text-lg font-bold text-ink">
          +
        </button>
        <button type="button" className="block h-9 w-9 text-lg font-bold text-ink">
          −
        </button>
      </div>
    </div>
  );
}
