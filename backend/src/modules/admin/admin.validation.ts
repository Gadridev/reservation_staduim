import { z } from "zod";

export const listUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    role: z.enum(["PLAYER", "OWNER", "ADMIN"]).optional(),
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
  })
  .strict();

export const deactivateUserSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(5, "Reason must be at least 5 characters")
      .max(500, "Reason must not exceed 500 characters"),
  })
  .strict();

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type DeactivateUserInput = z.infer<typeof deactivateUserSchema>;