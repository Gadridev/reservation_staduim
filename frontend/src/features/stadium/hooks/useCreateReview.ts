import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createReview, type CreateReviewPayload } from "../api";

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["myBookings"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["review"],
      });

      toast.success("Review submitted successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
