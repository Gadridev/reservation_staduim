import { useQuery } from "@tanstack/react-query";
import { getUnreadNotification } from "../api";

export function useUnreadNotification(){
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotification,
  });
}
