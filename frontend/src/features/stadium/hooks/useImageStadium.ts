import { useQuery } from "@tanstack/react-query";
import { getImageStadium } from "../api";

export const useImageStadium = (id:string) => {
  return useQuery({
    queryKey: ["image-stadium", id],
    queryFn: () => getImageStadium(id),
  });
};
