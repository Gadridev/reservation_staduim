import type { Request, Response, NextFunction } from "express";
import { createBooking as createBookingService } from "./booking.service.js";

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const playerId = req.user!._id;
    const booking = await createBookingService(playerId, req.body);

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}