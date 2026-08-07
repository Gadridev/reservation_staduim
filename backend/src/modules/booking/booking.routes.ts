import { Router } from "express";
import { createBooking } from "./booking.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";
import { validate } from "../../shared/middleware/validate.js";
import { createBookingSchema } from "./booking.validation.js";

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
export default router;