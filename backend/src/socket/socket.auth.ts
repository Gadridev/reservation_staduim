import { User } from "../modules/auth/auth.model.js";
import { verifyToken } from "../utils/jwt.js";
import type { AppSocket } from "./socket.types.js";

export async function socketAuthenticate(
  socket: AppSocket,
  next: (err?: Error) => void
) {
  try {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return next(new Error("Invalid or expired token"));
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return next(new Error("User no longer exists"));
    }

    if (!user.isActive) {
      return next(new Error("Your account is inactive"));
    }

    socket.data.user = user;
    next();
  } catch {
    next(new Error("Authentication failed"));
  }
}