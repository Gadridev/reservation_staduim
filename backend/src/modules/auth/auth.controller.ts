import type { Request, Response, NextFunction } from "express";
import { loginUser, registerUser } from "./auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await loginUser(req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
