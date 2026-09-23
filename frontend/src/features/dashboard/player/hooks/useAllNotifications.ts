import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "../api";

export function useAllNotifications(){
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: getAllNotifications,
  });
}
