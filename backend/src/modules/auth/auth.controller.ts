import type { Request, Response, NextFunction } from "express";
import { registerUser } from "./auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}