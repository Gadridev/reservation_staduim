import mongoose, { Schema, type Document } from "mongoose";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface IBooking extends Document {
  playerId: mongoose.Types.ObjectId;
  stadiumId: mongoose.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  price: number;
  currency: string;
  status: BookingStatus;
  cancelledAt: Date | null;
}

const bookingSchema = new Schema<IBooking>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: true,
      index: true,
    },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "MAD" },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "CONFIRMED",
    },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
