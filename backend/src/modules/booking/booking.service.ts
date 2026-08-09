import mongoose from "mongoose";
import { Booking } from "./booking.model.js";
import { Stadium } from "../stadium/stadium.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { BOOKING_RULES } from "../../shared/constants/bookingRules.js";
import type { CancelBookingInput, CreateBookingInput } from "./booking.validation.js";
import { toTimeString } from "../../utils/date.js";
import type { BookingListQuery } from "./booking.validation.js";



export async function createBooking(
  playerId: mongoose.Types.ObjectId,
  input: CreateBookingInput
) {
  // 3. Stadium exists
  const stadium = await Stadium.findById(input.stadiumId);
  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  // 4. Stadium is active
  if (!stadium.isActive) {
    throw new AppError("This stadium is not available for booking", 400);
  }

  const startAt = input.startAt;

  // 6. startAt is not in the past
  const now = new Date();
  //convert time to minute
  // const nowInMinutes = now.getHours() * 60 + now.getMinutes();
  // const startAtInMinutes = startAt.getHours() * 60 + startAt.getMinutes();

  if (startAt.getTime() <= now.getTime()) {
  throw new AppError("Booking time must be in the future", 400);
}

  // 7. startAt is within the next N days
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + BOOKING_RULES.MAX_ADVANCE_BOOKING_DAYS);
  if (startAt.getTime() > maxDate.getTime()) {
    throw new AppError(
      `Bookings can only be made within the next ${BOOKING_RULES.MAX_ADVANCE_BOOKING_DAYS} days`,
      400
    );
  }

  // endAt is computed here because steps 8, 9 and 11 need it for comparison.
  // The field itself is only persisted in step 13/14.
  const endAt = new Date(
    startAt.getTime() + BOOKING_RULES.DURATION_HOURS * BOOKING_RULES.HOURS_IN_MS
  );

  // 8. Requested day is open
  const dayOfWeek = startAt.getDay();
  const daySchedule = stadium.workingHours.find((d) => d.dayOfWeek === dayOfWeek);

  if (!daySchedule || !daySchedule.isOpen) {
    throw new AppError("The stadium is closed on the selected day", 400);
  }

  // 9. Requested hour is inside Working Hours
  const requestedStartTime = toTimeString(startAt);
  const requestedEndTime = toTimeString(endAt);

  if (
    !daySchedule.openTime ||
    !daySchedule.closeTime ||
    requestedStartTime < daySchedule.openTime ||
    requestedEndTime > daySchedule.closeTime
  ) {
    throw new AppError(
      "The selected time is outside the stadium's working hours",
      400
    );
  }

  // 10. Player has no active future booking for same stadium and date
  const startOfDay = new Date(startAt);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startAt);
  endOfDay.setHours(23, 59, 59, 999);

  const existingPlayerBooking = await Booking.findOne({
    playerId,
    stadiumId: stadium._id,
    status: "CONFIRMED",
    startAt: { $gte: startOfDay, $lte: endOfDay },
  });

  if (existingPlayerBooking) {
    throw new AppError(
      "You already have a booking for this stadium on this date",
      409
    );
  }

  // 11. Requested slot is available (conflict check, CONFIRMED only)
  const conflictingBooking = await Booking.findOne({
    stadiumId: stadium._id,
    status: "CONFIRMED",
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  });

  if (conflictingBooking) {
    throw new AppError("This time slot is already booked", 409);
  }

  // 12. Read stadium price (snapshot)
  const price = stadium.pricePerHour;


  // 14. Create booking
  const booking = await Booking.create({
    playerId,
    stadiumId: stadium._id,
    startAt,
    endAt,
    price,
    currency: "MAD",
    status: "CONFIRMED",
  });

  // 15. Return booking
  return booking;
}


interface AuthUser {
  _id: mongoose.Types.ObjectId;
  role: "PLAYER" | "OWNER" | "ADMIN";
}

export async function getBookingById(bookingId: string, user: AuthUser) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Booking not found", 404);
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (user.role === "PLAYER") {
    if (booking.playerId.toString() !== user._id.toString()) {
      throw new AppError("You do not have permission to view this booking", 403);
    }
  } else if (user.role === "OWNER") {
    const stadium = await Stadium.findById(booking.stadiumId);
    if (!stadium || stadium.ownerId.toString() !== user._id.toString()) {
      throw new AppError("You do not have permission to view this booking", 403);
    }
  }
  // ADMIN: بلا أي تحقق إضافي

  await booking.populate([
    { path: "stadiumId", select: "name" },
    { path: "playerId", select: "firstName lastName" },
  ]);

  return booking;
}

export async function getMyBookings(playerId: mongoose.Types.ObjectId, query: BookingListQuery) {
  const filter: Record<string, unknown> = { playerId };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("stadiumId", "name"),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}

export async function getStadiumBookings(
  stadiumId: string,
  user: AuthUser,
  query: BookingListQuery
) {
  if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
    throw new AppError("Stadium not found", 404);
  }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (user.role === "OWNER" && stadium.ownerId.toString() !== user._id.toString()) {
    throw new AppError("You do not have permission to view bookings for this stadium", 403);
  }
  // ADMIN: بلا تحقق ownership

  const filter: Record<string, unknown> = { stadiumId: stadium._id };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("playerId", "firstName lastName"),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}
export async function cancelBooking(
  bookingId: string,
  user: AuthUser,
  input: CancelBookingInput
) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Booking not found", 404);
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // Authorization
  if (user.role === "PLAYER") {
    if (booking.playerId.toString() !== user._id.toString()) {
      throw new AppError("You do not have permission to cancel this booking", 403);
    }
  } else if (user.role === "OWNER") {
    throw new AppError("You do not have permission to cancel this booking", 403);
  }
  // ADMIN: بلا تحقق إضافي

  // Status rules
  if (booking.status === "CANCELLED") {
    throw new AppError("This booking is already cancelled", 409);
  }

  if (booking.status === "COMPLETED") {
    throw new AppError("Completed bookings cannot be cancelled", 409);
  }

  // Time rule — PLAYER only, ADMIN bypasses
  if (user.role === "PLAYER") {
    const deadline = new Date(
      booking.startAt.getTime() - BOOKING_RULES.CANCELLATION_DEADLINE_HOURS * 60 * 60 * 1000
    );

    if (Date.now() > deadline.getTime()) {
      throw new AppError(
        "Bookings can only be cancelled at least 2 hours before the start time",
        400
      );
    }
  }

  booking.status = "CANCELLED";
  booking.cancelledAt = new Date();
  booking.cancelledBy = user._id;
  booking.cancellationReason = input.reason;

  await booking.save();

  return booking;
}

export async function completeExpiredBookings(): Promise<number> {
  const now = new Date();

  const result = await Booking.updateMany(
    {
      status: "CONFIRMED",
      endAt: { $lte: now },
    },
    {
      $set: {
        status: "COMPLETED",
        completedAt: now,
      },
    }
  );

  return result.modifiedCount;
}