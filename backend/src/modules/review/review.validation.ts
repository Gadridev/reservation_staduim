import { z } from "zod";

export const createReviewSchema = z
  .object({
    bookingId: z.string().min(1, "bookingId is required"),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must not exceed 5"),
    comment: z.string().trim().max(500, "Comment must not exceed 500 characters").optional(),
  })
  .strict();

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(500).optional(),
  })
  .strict();

export const reviewListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;