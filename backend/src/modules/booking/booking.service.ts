import mongoose from "mongoose";
import { Booking } from "./booking.model.js";
import { Stadium } from "../stadium/stadium.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { BOOKING_RULES } from "../../shared/constants/bookingRules.js";
import type { CreateBookingInput } from "./booking.validation.js";
import { toTimeString } from "../../utils/date.js";



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
  const nowInMinutes = now.getHours() * 60 + now.getMinutes();
  const startAtInMinutes = startAt.getHours() * 60 + startAt.getMinutes();

  if (startAtInMinutes < nowInMinutes) {
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