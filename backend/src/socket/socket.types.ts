import type { Server, Socket, DefaultEventsMap } from "socket.io";
import type { IUser } from "../modules/auth/auth.model.js";

// كل socket connection مصادق عليها كتحمل معاها الـ user الكامل (نفس شكل req.user فـ REST)
export interface SocketData {
  user: IUser;
}

export type AppServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
export type AppSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;