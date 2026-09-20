import { z } from "zod";

const longitudeSchema = z
  .number()
  .min(-180)
  .max(180);

const latitudeSchema = z
  .number()
  .min(-90)
  .max(90);

const coordinatesSchema = z
  .tuple([longitudeSchema, latitudeSchema])
  .describe("[longitude, latitude]");

const locationSchema = z.object({
  address: z.string().trim().min(3, "Address must be at least 3 characters"),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  coordinates: z.object({
    type: z.literal("Point").default("Point"),
    coordinates: coordinatesSchema,
  }),
});

export const createStadiumSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    location: locationSchema,
    images: z.array(z.string().url("Each image must be a valid URL")).default([]),
    amenities: z.array(z.string().trim().min(1)).default([]),
    pricePerHour: z.number().positive("Price must be a positive number"),
  })
  .strict();

export const updateStadiumSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters").optional(),
    description: z.string().trim().min(10, "Description must be at least 10 characters").optional(),
    location: locationSchema.optional(),
    images: z.array(z.string().url("Each image must be a valid URL")).optional(),
    amenities: z.array(z.string().trim()).optional(),
    pricePerHour: z.number().positive("Price must be a positive number").optional(),
  })
  .strict();
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const workingHourSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    isOpen: z.boolean(),
    openTime: z.string().regex(timeRegex, "openTime must be in HH:mm format").nullable(),
    closeTime: z.string().regex(timeRegex, "closeTime must be in HH:mm format").nullable(),
  })
  .strict()
  .refine(
    (day) => {
      if (day.isOpen) {
        return day.openTime !== null && day.closeTime !== null;
      }
      return day.openTime === null && day.closeTime === null;
    },
    {
      message:
        "openTime and closeTime are required when isOpen is true, and must be null when isOpen is false",
    }
  )
  .refine(
    (day) => {
      if (day.isOpen && day.openTime && day.closeTime) {
        return day.openTime < day.closeTime;
      }
      return true;
    },
    { message: "openTime must be earlier than closeTime" }
  );

export const updateWorkingHoursSchema = z
  .array(workingHourSchema)
  .length(7, "Working hours must contain exactly 7 entries")
  .refine(
    (days) => {
      const uniqueDays = new Set(days.map((d) => d.dayOfWeek));
      return uniqueDays.size === 7;
    },
    { message: "Each day of the week must appear exactly once (0-6, no duplicates)" }
  );

export type UpdateWorkingHoursInput = z.infer<typeof updateWorkingHoursSchema>;

export type CreateStadiumInput = z.infer<typeof createStadiumSchema>;
export type UpdateStadiumInput = z.infer<typeof updateStadiumSchema>;