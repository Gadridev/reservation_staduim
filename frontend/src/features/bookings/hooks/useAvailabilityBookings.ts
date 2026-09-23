import { useQuery } from "@tanstack/react-query";
import { getAvailability } from "../api";

export function useAvailabilityBookings(
  stadiumId: string | undefined,
  date: string,
) {
  return useQuery({
    queryKey: ["availability", stadiumId, date],
    queryFn: () => getAvailability(stadiumId!, date),
    enabled: Boolean(stadiumId),
  });
}
