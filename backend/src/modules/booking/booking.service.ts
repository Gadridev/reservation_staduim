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

  const now = new Date();
  if (startAt.getTime() <= now.getTime()) {
    throw new AppError("Booking time must be in the future", 400);
  }
  if (
    startAt.getMinutes() !== 0 ||
    startAt.getSeconds() !== 0 ||
    startAt.getMilliseconds() !== 0
  ) {
    throw new AppError("Booking must start on an exact hour", 400);
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

export async function ownerDashboard(ownerId: mongoose.Types.ObjectId) {
  const stadiums = await Stadium.find({ ownerId }).select("_id");
  const stadiumIds = stadiums.map((stadium) => stadium._id);
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [todaysBookings, upcomingBookings, cancelledThisMonth, revenueResult] =
    await Promise.all([
      Booking.countDocuments({
        stadiumId: { $in: stadiumIds },
        status: "CONFIRMED",
        startAt: { $gte: dayStart, $lte: dayEnd },
      }),
      Booking.countDocuments({
        stadiumId: { $in: stadiumIds },
        status: "CONFIRMED",
        startAt: { $gt: now },
      }),
      Booking.countDocuments({
        stadiumId: { $in: stadiumIds },
        status: "CANCELLED",
        cancelledAt: { $gte: monthStart, $lt: nextMonthStart },
      }),
      Booking.aggregate([
        {
          $match: {
            stadiumId: { $in: stadiumIds },
            status: "COMPLETED",
          },
        },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
    ]);

  const todayBookings = await Booking.find({
    stadiumId: { $in: stadiumIds },
    status: "CONFIRMED",
    startAt: { $gte: dayStart, $lte: dayEnd },
  })
    .populate("playerId", "firstName lastName")
    .populate("stadiumId", "name")
    .sort({ startAt: 1 });
  const recentBookings = await Booking.find({
    stadiumId: { $in: stadiumIds },
  })
    .populate("playerId", "firstName lastName")
    .populate("stadiumId", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    stats: {
      todaysBookings,
      upcomingBookings,
      cancelledThisMonth,
      totalRevenue: revenueResult[0]?.total ?? 0,
      currency: "MAD",
    },
    todayBookings,
    recentBookings,
  };
}
