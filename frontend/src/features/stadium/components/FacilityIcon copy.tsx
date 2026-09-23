import type { StadiumFacility } from "../types";
import { FACILITY_ICON_PATHS } from "../facilityConfig";

interface FacilityIconProps {
  facility: StadiumFacility;
  className?: string;
}

export function FacilityIcon({ facility, className = "h-4 w-4" }: FacilityIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={FACILITY_ICON_PATHS[facility]} />
    </svg>
  );
}
