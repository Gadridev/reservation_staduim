import { useQuery } from "@tanstack/react-query";
import { getOwnerDashboard } from "../api";

export function useOwnerDashboard() {
  return useQuery({
    queryKey: ["bookings", "dashboard", "owner"],
    queryFn: getOwnerDashboard,
  });
}
