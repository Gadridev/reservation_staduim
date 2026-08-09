import type { Request, Response, NextFunction } from "express";
import {
  createReview as createReviewService,
  getReviewById as getReviewByIdService,
  getStadiumReviews as getStadiumReviewsService,
  getMyReviews as getMyReviewsService,
  updateReview as updateReviewService,
  deleteReview as deleteReviewService,
} from "./review.service.js";
import type { ReviewListQuery } from "./review.validation.js";

export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const review = await createReviewService(req.user!._id, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function getReviewById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const review = await getReviewByIdService(req.params.reviewId as string);
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function getStadiumReviews(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery as ReviewListQuery;
    const { reviews, pagination } = await getStadiumReviewsService(
      req.params.stadiumId as string,
      query,
    );
    res.status(200).json({ success: true, data: reviews, pagination });
  } catch (err) {
    next(err);
  }
}

export async function getMyReviews(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery as ReviewListQuery;
    const { reviews, pagination } = await getMyReviewsService(
      req.user!._id,
      query,
    );
    res.status(200).json({ success: true, data: reviews, pagination });
  } catch (err) {
    next(err);
  }
}

export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const review = await updateReviewService(
      req.params.reviewId as string,
      req.user!._id,
      req.body,
    );
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await deleteReviewService(req.params.reviewId as string, req.user!._id);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
