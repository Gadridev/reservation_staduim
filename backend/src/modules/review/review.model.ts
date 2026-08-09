import mongoose, { Schema, type Document } from "mongoose";

export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  stadiumId: mongoose.Types.ObjectId;
  rating: number;
  comment: string | null;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>("Review", reviewSchema);