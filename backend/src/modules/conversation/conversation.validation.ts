import { z } from "zod";

export const createConversationSchema = z
  .object({
    stadiumId: z.string().min(1, "stadiumId is required"),
  })
  .strict();

export const sendMessageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(2000, "Message must not exceed 2000 characters"),
  })
  .strict();

export const conversationListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export const messageListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(30),
  })
  .strict();

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ConversationListQuery = z.infer<typeof conversationListQuerySchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;