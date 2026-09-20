import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { socketAuthenticate } from "./socket.auth.js";
import { registerConversationHandlers } from "./socket.handlers.js";
import type { AppServer } from "./socket.types.js";

let ioInstance: AppServer | null = null;

export function initializeSocketServer(httpServer: HttpServer): AppServer {
  const io: AppServer = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuthenticate);

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.user._id}`);
    registerConversationHandlers(io, socket);
  });

  ioInstance = io;
  return io;
}

export function getIO(): AppServer {
  if (!ioInstance) {
    throw new Error("Socket.IO server has not been initialized yet");
  }
  return ioInstance;
}
