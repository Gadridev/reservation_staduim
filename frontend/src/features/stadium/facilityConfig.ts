import type { StadiumFacility } from "./types";

export const FACILITY_ICON_PATHS: Record<StadiumFacility, string> = {
  floodlights: "M13 2 3 14h7l-1 8 10-12h-7l1-8z",
  parking: "M3 9h18M7 9V6a5 5 0 0 1 10 0v3",
  showers: "M12 3v10M8 21h8M9 13a3 3 0 0 0 6 0",
  turf: "M4 4h16v16H4z",
  "changing-rooms": "M4 19h16M6 19V9l6-5 6 5v10",
  cafe: "M4 7h16M6 7v13h12V7M9 7V4h6v3",
};

export const FACILITY_LABELS: Record<StadiumFacility, string> = {
  floodlights: "Floodlights",
  parking: "Free parking",
  showers: "Hot showers",
  turf: "Artificial turf",
  "changing-rooms": "Changing rooms",
  cafe: "Café on-site",
};

export function getFacilityKey(value: string): StadiumFacility | null {
  const key = value.trim().toLowerCase().replace(/\s+/g, "-");

  return Object.prototype.hasOwnProperty.call(FACILITY_LABELS, key)
    ? (key as StadiumFacility)
    : null;
}
