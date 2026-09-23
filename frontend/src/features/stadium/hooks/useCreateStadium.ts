import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createStadium } from "../api";

export function useCreateStadium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStadium,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stadiums"] });
      toast.success("Stadium created successfully.");
    },
    onError: () => {
      toast.error("Could not create stadium. Please try again.");
    },
  });
}
