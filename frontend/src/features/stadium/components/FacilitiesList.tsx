import { CircleHelp } from "lucide-react";
import { FacilityIcon } from "./FacilityIcon";
import { FACILITY_LABELS, getFacilityKey } from "../facilityConfig";

interface FacilitiesListProps {
  facilities: string[];
}

export function FacilitiesList({ facilities }: FacilitiesListProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility, index) => {
        const key = getFacilityKey(facility);

        return (
          <div
            key={`${facility}-${index}`}
            className="flex items-center gap-2.5 rounded-[10px] border border-line bg-chalk px-3.5 py-3 text-[13.5px] font-semibold text-ink"
          >
            {key ? (
              <FacilityIcon facility={key} className="h-4 w-4 text-turf" />
            ) : (
              <CircleHelp className="h-4 w-4 text-turf" aria-hidden="true" />
            )}
            {key ? FACILITY_LABELS[key] : facility}
          </div>
        );
      })}
    </div>
  );
}
