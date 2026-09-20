import type { AppServer, AppSocket } from "./socket.types.js";
import {
  findConversationAndVerifyAccess,
  sendMessage as sendMessageService,
} from "../modules/conversation/conversation.service.js";
import { sendMessageSchema } from "../modules/conversation/conversation.validation.js";

function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

function emitSocketError(socket: AppSocket, message: string) {
  socket.emit("socket_error", { message });
}

export function registerConversationHandlers(io: AppServer, socket: AppSocket) {
  const authUser = { _id: socket.data.user._id, role: socket.data.user.role };

  socket.on("join_conversation", async (payload: { conversationId?: string }) => {
    try {
      const conversationId = payload?.conversationId;
      if (!conversationId) {
        return emitSocketError(socket, "conversationId is required");
      }

      await findConversationAndVerifyAccess(conversationId, authUser);

      socket.join(conversationRoom(conversationId));
      socket.emit("joined_conversation", { conversationId });
    } catch (err) {
      emitSocketError(socket, err instanceof Error ? err.message : "Unable to join conversation");
    }
  });

  socket.on("leave_conversation", (payload: { conversationId?: string }) => {
    const conversationId = payload?.conversationId;
    if (!conversationId) return;

    socket.leave(conversationRoom(conversationId));
    socket.emit("left_conversation", { conversationId });
  });

  socket.on(
    "send_message",
    async (payload: { conversationId?: string; content?: string }) => {
      try {
        const conversationId = payload?.conversationId;
        if (!conversationId) {
          return emitSocketError(socket, "conversationId is required");
        }

        const parsed = sendMessageSchema.safeParse({ content: payload?.content });
        if (!parsed.success) {
          return emitSocketError(socket, parsed.error.issues[0]?.message || "Invalid message content");
        }
        const message = await sendMessageService(conversationId, authUser, parsed.data);

        io.to(conversationRoom(conversationId)).emit("new_message", message);
      } catch (err) {
        emitSocketError(socket, err instanceof Error ? err.message : "Unable to send message");
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
}