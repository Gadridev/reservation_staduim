import { z } from "zod";

export const createBookingSchema = z
  .object({
    stadiumId: z.string().min(1, "stadiumId is required"),
    startAt: z.coerce.date({
      error: "startAt must be a valid ISO date",
    }),
  })
  .strict();
export const bookingListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  })
  .strict();
export const cancelBookingSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(5, "Cancellation reason must be at least 5 characters")
      .max(500, "Cancellation reason cannot exceed 500 characters"),
  })
  .strict();

export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
