import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  createStadiumSchema,
  updateStadiumSchema,
  updateWorkingHoursSchema,
} from "./stadium.validation.js";

import {
  createStadium,
  getPublicStadiums,
  getStadiumById,
  getMyStadiums,
  updateStadium,
  deactivateStadium,
  updateWorkingHours,
  getWorkingHours,
} from "./stadium.controller.js";

const router = Router();

/**
 * @openapi
 * /stadiums:
 *   post:
 *     tags: [Stadium]
 *     summary: Create a new stadium (OWNER only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, location, pricePerHour]
 *             properties:
 *               name: { type: string, example: "Stadium Al Amal" }
 *               description: { type: string, example: "A well-lit 5-a-side football stadium" }
 *               location: { $ref: '#/components/schemas/Location' }
 *               images:
 *                 type: array
 *                 items: { type: string, format: uri }
 *               amenities:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Parking", "Showers"]
 *               pricePerHour: { type: number, example: 100 }
 *     responses:
 *       201:
 *         description: Stadium created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Stadium' }
 *       403:
 *         description: Only OWNER users can create stadiums
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Duplicate stadium (same name and location)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   get:
 *     tags: [Stadium]
 *     summary: List all active stadiums (public)
 *     security: []
 *     responses:
 *       200:
 *         description: List of active stadiums
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Stadium' }
 */
router.post("/", authenticate, authorize("OWNER"), validate(createStadiumSchema), createStadium);
router.get("/", getPublicStadiums);

/**
 * @openapi
 * /stadiums/my:
 *   get:
 *     tags: [Stadium]
 *     summary: Get stadiums owned by the current authenticated OWNER
 *     responses:
 *       200:
 *         description: List of stadiums owned by the current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Stadium' }
 *       403:
 *         description: Only OWNER users can access this endpoint
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/my", authenticate, authorize("OWNER"), getMyStadiums);

/**
 * @openapi
 * /stadiums/{id}:
 *   get:
 *     tags: [Stadium]
 *     summary: Get a single active stadium by ID (public)
 *     security: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Stadium details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Stadium' }
 *       404:
 *         description: Stadium not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   patch:
 *     tags: [Stadium]
 *     summary: Update a stadium owned by the current user
 *     parameters:
 *       - name: id
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
 *               name: { type: string }
 *               description: { type: string }
 *               location: { $ref: '#/components/schemas/Location' }
 *               images:
 *                 type: array
 *                 items: { type: string, format: uri }
 *               amenities:
 *                 type: array
 *                 items: { type: string }
 *               pricePerHour: { type: number }
 *     responses:
 *       200:
 *         description: Stadium updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Stadium' }
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
router.patch("/:id", authenticate, authorize("OWNER"), validate(updateStadiumSchema), updateStadium);
router.get("/:id", getStadiumById);

/**
 * @openapi
 * /stadiums/{id}/deactivate:
 *   patch:
 *     tags: [Stadium]
 *     summary: Deactivate a stadium (soft delete)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Stadium deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Stadium' }
 *       403:
 *         description: Not the owner of this stadium
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/:id/deactivate", authenticate, authorize("OWNER"), deactivateStadium);

/**
 * @openapi
 * /stadiums/{id}/working-hours:
 *   get:
 *     tags: [Stadium]
 *     summary: Get the working hours of a stadium (public)
 *     security: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Working hours for each day of the week
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/WorkingHour' }
 *       404:
 *         description: Stadium not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   patch:
 *     tags: [Stadium]
 *     summary: Replace the full weekly working hours (OWNER only)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             minItems: 7
 *             maxItems: 7
 *             items: { $ref: '#/components/schemas/WorkingHour' }
 *     responses:
 *       200:
 *         description: Working hours updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/WorkingHour' }
 *       400:
 *         description: Validation error (wrong count, duplicate day, bad format...)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not the owner of this stadium
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id/working-hours", getWorkingHours);
router.patch("/:id/working-hours", authenticate, authorize("OWNER"), validate(updateWorkingHoursSchema), updateWorkingHours);
export default router;
