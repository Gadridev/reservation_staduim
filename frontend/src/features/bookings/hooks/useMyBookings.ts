import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../api";

export function useMyBookings() {
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: () => getMyBookings(),
  });
}
