import type { Request, Response, NextFunction } from "express";
import type { BookingListQuery,CancelBookingInput } from "./booking.validation.js";
import {
  createBooking as createBookingService,
  getBookingById as getBookingByIdService,
  getMyBookings as getMyBookingsService,
  getStadiumBookings as getStadiumBookingsService,
  cancelBooking as cancelBookingService
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

export async function getBookingById(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await getBookingByIdService(req.params.bookingId as string, {
      _id: req.user!._id,
      role: req.user!.role,
    });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.validatedQuery as BookingListQuery;
    const { bookings, pagination } = await getMyBookingsService(req.user!._id, query);
    res.status(200).json({ success: true, data: bookings, pagination });
  } catch (err) {
    next(err);
  }
}

export async function getStadiumBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.validatedQuery as BookingListQuery;
    const { bookings, pagination } = await getStadiumBookingsService(
      req.params.stadiumId as string,
      { _id: req.user!._id, role: req.user!.role },
      query
    );
    res.status(200).json({ success: true, data: bookings, pagination });
  } catch (err) {
    next(err);
  }
}


export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await cancelBookingService(
      req.params.bookingId as string,
      { _id: req.user!._id, role: req.user!.role },
      req.body as CancelBookingInput
    );
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}