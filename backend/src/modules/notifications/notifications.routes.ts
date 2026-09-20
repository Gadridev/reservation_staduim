import { Router } from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "./notifications.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { validateQuery } from "../../shared/middleware/validateQuery.js";
import { notificationListQuerySchema } from "./notifications.validation.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notification]
 *     summary: Get the authenticated user's notifications, newest first
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 50 }
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Notification' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get("/", validateQuery(notificationListQuerySchema), getMyNotifications);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     tags: [Notification]
 *     summary: Get the count of unread notifications for the authenticated user
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     count: { type: integer, example: 3 }
 */
router.get("/unread-count", getUnreadCount);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags: [Notification]
 *     summary: Mark all of the authenticated user's notifications as read
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount: { type: integer, example: 5 }
 */
router.patch("/read-all", markAllAsRead);

/**
 * @openapi
 * /notifications/{notificationId}/read:
 *   patch:
 *     tags: [Notification]
 *     summary: Mark a single notification as read
 *     parameters:
 *       - name: notificationId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Notification' }
 *       403:
 *         description: Not the recipient of this notification
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/:notificationId/read", markAsRead);

export default router;