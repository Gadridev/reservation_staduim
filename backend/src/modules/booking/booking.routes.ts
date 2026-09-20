import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
  getStadiumBookings,
} from "./booking.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";
import { validate } from "../../shared/middleware/validate.js";
import { validateQuery } from "../../shared/middleware/validateQuery.js";
import { createBookingSchema, bookingListQuerySchema, cancelBookingSchema } from "./booking.validation.js";

const router = Router();

/**
 * @openapi
 * /bookings:
 *   post:
 *     tags: [Booking]
 *     summary: Create a booking (PLAYER only, exactly 1 hour)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stadiumId, startAt]
 *             properties:
 *               stadiumId: { type: string }
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-10T18:00:00.000Z"
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Invalid time, past date, outside working hours, closed day, etc.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Only PLAYER users can create bookings
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Stadium not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Slot already booked, or player already has a booking that day
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/", authenticate, authorize("PLAYER"), validate(createBookingSchema), createBooking);

/**
 * @openapi
 * /bookings/my:
 *   get:
 *     tags: [Booking]
 *     summary: Get the authenticated player's own bookings (PLAYER only)
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 50 }
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Paginated list of the player's bookings, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Booking' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Only PLAYER users can access this endpoint
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/my",
  authenticate,
  authorize("PLAYER"),
  validateQuery(bookingListQuerySchema),
  getMyBookings
);

/**
 * @openapi
 * /bookings/stadium/{stadiumId}:
 *   get:
 *     tags: [Booking]
 *     summary: Get bookings for a specific stadium (OWNER of that stadium, or ADMIN)
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
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Paginated list of bookings for the stadium, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Booking' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not the owner of this stadium
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Stadium not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/stadium/:stadiumId",
  authenticate,
  authorize("OWNER", "ADMIN"),
  validateQuery(bookingListQuerySchema),
  getStadiumBookings
);

/**
 * @openapi
 * /bookings/{bookingId}:
 *   get:
 *     tags: [Booking]
 *     summary: Get a single booking by ID (resource-based access)
 *     description: >
 *       A PLAYER can view only their own booking.
 *       An OWNER can view only bookings for a stadium they own.
 *       An ADMIN can view any booking.
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Booking' }
 *       403:
 *         description: You do not have permission to view this booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:bookingId", authenticate, getBookingById);
/**
 * @openapi
 * /bookings/{bookingId}/cancel:
 *   patch:
 *     tags: [Booking]
 *     summary: Cancel a booking (PLAYER — own booking, within 2h deadline — or ADMIN)
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 example: "Changed plans, can't make it anymore"
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Invalid ID, validation error, or cancellation deadline passed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not allowed to cancel this booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Booking already cancelled or completed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch(
  "/:bookingId/cancel",
  authenticate,
  validate(cancelBookingSchema),
  cancelBooking
);

export default router;