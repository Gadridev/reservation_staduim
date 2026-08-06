import { z } from "zod";

export const createBookingSchema = z
  .object({
    stadiumId: z.string().min(1, "stadiumId is required"),
    startAt: z.coerce.date({
      errorMap: () => ({ message: "startAt must be a valid ISO date" }),
    }),
  })
  .strict();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;