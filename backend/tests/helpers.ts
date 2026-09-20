import mongoose from "mongoose";
import { User } from "../src/modules/auth/auth.model.js";
import { Stadium } from "../src/modules/stadium/stadium.model.js";
import { Booking } from "../src/modules/booking/booking.model.js";
import { DEFAULT_WORKING_HOURS } from "../src/shared/constants/defaultWorkingHours.js";
import { generateToken } from "../src/utils/jwt.js";
import { Conversation } from "../src/modules/conversation/conversation.model.js";

export async function createTestUser(role: "PLAYER" | "OWNER" | "ADMIN" = "PLAYER") {
  const user = await User.create({
    firstName: "Test",
    lastName: role,
    email: `${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
    password: "123456",
    role,
  });

  const token = generateToken({ userId: (user._id as mongoose.Types.ObjectId).toString() });

  return { user, token };
}

export async function createTestStadium(
  ownerId: mongoose.Types.ObjectId,
  overrides: Record<string, unknown> = {}
) {
  const stadium = await Stadium.create({
    ownerId,
    name: `Test Stadium ${Date.now()}`,
    description: "A stadium created for testing purposes",
    location: {
      address: "123 Test St",
      city: "Casablanca",
      coordinates: { type: "Point", coordinates: [-7.5898, 33.5731] },
    },
    pricePerHour: 100,
    workingHours: DEFAULT_WORKING_HOURS,
    ...overrides,
  });

  return stadium;
}

export async function createTestBooking(
  playerId: mongoose.Types.ObjectId,
  stadiumId: mongoose.Types.ObjectId,
  overrides: Record<string, unknown> = {}
) {
  const startAt = new Date();
  startAt.setDate(startAt.getDate() + 1);
  startAt.setHours(18, 0, 0, 0);
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  const booking = await Booking.create({
    playerId,
    stadiumId,
    startAt,
    endAt,
    price: 100,
    currency: "MAD",
    status: "CONFIRMED",
    ...overrides,
  });

  return booking;
}
export async function createTestConversation(
  playerId: mongoose.Types.ObjectId,
  ownerId: mongoose.Types.ObjectId,
  stadiumId: mongoose.Types.ObjectId
) {
  return Conversation.create({ playerId, ownerId, stadiumId });
}