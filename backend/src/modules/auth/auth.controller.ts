import type { Request, Response, NextFunction } from "express";
import {
  getMeUser,
  loginUser,
  registerUser,
  updatePasswordService,
  updateUserService,
} from "./auth.service.js";

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
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getMeUser({ userId: req.user!._id.toString() });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updatePasswordService({ userId: req.user!._id.toString(), body: req.body });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateUserService({ userId: req.user!._id.toString(), body: req.body });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
