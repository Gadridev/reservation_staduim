import type { Request, Response, NextFunction } from "express";
import {
  createBooking as createBookingService,
  ownerDashboard as ownerDashboardService,
} from "./booking.service.js";

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const playerId = req.user!._id;
    const booking = await createBookingService(playerId, req.body);

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function ownerDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ownerDashboardService(req.user!._id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
