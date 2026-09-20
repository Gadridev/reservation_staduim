import { Router } from "express";
import {
  createReview,
  getReviewById,
  getStadiumReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from "./review.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";
import { validate } from "../../shared/middleware/validate.js";
import { validateQuery } from "../../shared/middleware/validateQuery.js";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewListQuerySchema,
} from "./review.validation.js";

const router = Router();

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags: [Review]
 *     summary: Create a review for a completed booking (PLAYER only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId, rating]
 *             properties:
 *               bookingId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Great stadium, well maintained."
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Invalid rating/comment, or booking is not completed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: This booking does not belong to you, or only PLAYER can review
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: This booking has already been reviewed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/", authenticate, authorize("PLAYER"), validate(createReviewSchema), createReview);

/**
 * @openapi
 * /reviews/me:
 *   get:
 *     tags: [Review]
 *     summary: Get the authenticated player's own reviews (PLAYER only)
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 50 }
 *     responses:
 *       200:
 *         description: Paginated list of the player's reviews, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       403:
 *         description: Only PLAYER users can access this endpoint
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/me",
  authenticate,
  authorize("PLAYER"),
  validateQuery(reviewListQuerySchema),
  getMyReviews
);

/**
 * @openapi
 * /reviews/stadium/{stadiumId}:
 *   get:
 *     tags: [Review]
 *     summary: Get reviews for a specific stadium
 *     parameters:
 *       - name: stadiumId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 50 }
 *     responses:
 *       200:
 *         description: Paginated list of reviews for the stadium, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       404:
 *         description: Stadium not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/stadium/:stadiumId",
  authenticate,
  validateQuery(reviewListQuerySchema),
  getStadiumReviews
);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   get:
 *     tags: [Review]
 *     summary: Get a single review by ID
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   patch:
 *     tags: [Review]
 *     summary: Update your own review (PLAYER only)
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, maxLength: 500 }
 *     responses:
 *       200:
 *         description: Review updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Validation error, or attempt to modify a protected field
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not the author of this review
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   delete:
 *     tags: [Review]
 *     summary: Delete your own review (PLAYER only)
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: "null", example: null }
 *       403:
 *         description: Not the author of this review
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:reviewId", authenticate, getReviewById);

router.patch(
  "/:reviewId",
  authenticate,
  authorize("PLAYER"),
  validate(updateReviewSchema),
  updateReview
);

router.delete("/:reviewId", authenticate, authorize("PLAYER"), deleteReview);

export default router;