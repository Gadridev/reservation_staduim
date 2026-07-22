import type { Request, Response, NextFunction } from "express";

import { User } from "../../modules/auth/auth.model.js";
import { AppError } from "../errors/AppError.js";
import { verifyToken } from "../../utils/jwt.js";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1] as string;

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}