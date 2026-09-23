import { useQuery } from "@tanstack/react-query";
import { getStadium } from "../api";

export const useStadium = (id:string) => {
  return useQuery({
    queryKey: ["stadium",id],
    queryFn: () => getStadium(id),
  });
};
