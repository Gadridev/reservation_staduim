import { useQuery } from "@tanstack/react-query";
import { getAllStadium } from "../api";

export const useAllStadium = () => {
  return useQuery({
    queryKey: ["stadiums"],
    queryFn: () => getAllStadium(),
  });
};
