import mongoose from "mongoose";
import { Review } from "./review.model.js";
import { Booking } from "../booking/booking.model.js";
import { Stadium } from "../stadium/stadium.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import type { CreateReviewInput, UpdateReviewInput, ReviewListQuery } from "./review.validation.js";

export async function createReview(
  playerId: mongoose.Types.ObjectId,
  input: CreateReviewInput
) {
  if (!mongoose.Types.ObjectId.isValid(input.bookingId)) {
    throw new AppError("Booking not found", 404);
  }

  const booking = await Booking.findById(input.bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.playerId.toString() !== playerId.toString()) {
    throw new AppError("You do not have permission to review this booking", 403);
  }

  if (booking.status !== "COMPLETED") {
    throw new AppError("Only completed bookings can be reviewed", 400);
  }

  const existingReview = await Review.findOne({ bookingId: booking._id });

  if (existingReview) {
    throw new AppError("This booking has already been reviewed", 409);
  }

  try {
    const review = await Review.create({
      bookingId: booking._id,
      playerId,
      stadiumId: booking.stadiumId,
      rating: input.rating,
      comment: input.comment ?? null,
    });

    return review;
  } catch (err: any) {
    if (err.code === 11000) {
      throw new AppError("This booking has already been reviewed", 409);
    }
    throw err;
  }
}

export async function getReviewById(reviewId: string) {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError("Review not found", 404);
  }

  const review = await Review.findById(reviewId).populate([
    { path: "stadiumId", select: "name" },
    { path: "playerId", select: "firstName lastName" },
  ]);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  return review;
}

export async function getStadiumReviews(stadiumId: string, query: ReviewListQuery) {
  if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
    throw new AppError("Stadium not found", 404);
  }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  const filter = { stadiumId: stadium._id };
  const skip = (query.page - 1) * query.limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("playerId", "firstName lastName"),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}

export async function getMyReviews(playerId: mongoose.Types.ObjectId, query: ReviewListQuery) {
  const filter = { playerId };
  const skip = (query.page - 1) * query.limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("stadiumId", "name"),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}

export async function updateReview(
  reviewId: string,
  playerId: mongoose.Types.ObjectId,
  input: UpdateReviewInput
) {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError("Review not found", 404);
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.playerId.toString() !== playerId.toString()) {
    throw new AppError("You do not have permission to update this review", 403);
  }

  if (input.rating !== undefined) review.rating = input.rating;
  if (input.comment !== undefined) review.comment = input.comment;

  await review.save();

  return review;
}

export async function deleteReview(reviewId: string, playerId: mongoose.Types.ObjectId) {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new AppError("Review not found", 404);
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  if (review.playerId.toString() !== playerId.toString()) {
    throw new AppError("You do not have permission to delete this review", 403);
  }

  await review.deleteOne();
}