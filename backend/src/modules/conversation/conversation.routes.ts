import { Router } from "express";
import {
  createOrGetConversation,
  getMyConversations,
  getConversationById,
  sendMessage,
  getConversationMessages,
} from "./conversation.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";
import { validate } from "../../shared/middleware/validate.js";
import { validateQuery } from "../../shared/middleware/validateQuery.js";
import {
  createConversationSchema,
  sendMessageSchema,
  conversationListQuerySchema,
  messageListQuerySchema,
} from "./conversation.validation.js";

const router = Router();

// كل الـ endpoints هنا محصورة فـ PLAYER/OWNER — ADMIN بلا وصول (بحال القرار المعماري ديال المحادثات الخاصة)
router.use(authenticate, authorize("PLAYER", "OWNER"));

/**
 * @openapi
 * /conversations:
 *   post:
 *     tags: [Conversation]
 *     summary: Create or retrieve a conversation with a stadium's owner (PLAYER only)
 *     description: >
 *       Requires the player to have at least one CONFIRMED or COMPLETED booking
 *       with the given stadium. If a conversation already exists for this
 *       player/owner/stadium combination, it is returned instead of creating a duplicate.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stadiumId]
 *             properties:
 *               stadiumId: { type: string }
 *     responses:
 *       200:
 *         description: Conversation created or retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Conversation' }
 *       403:
 *         description: No eligible booking with this stadium, or not a PLAYER
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Stadium not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   get:
 *     tags: [Conversation]
 *     summary: Get the authenticated user's conversations (as PLAYER or OWNER)
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 50 }
 *     responses:
 *       200:
 *         description: Paginated list of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Conversation' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.post("/", authorize("PLAYER"), validate(createConversationSchema), createOrGetConversation);
router.get("/", validateQuery(conversationListQuerySchema), getMyConversations);

/**
 * @openapi
 * /conversations/{conversationId}:
 *   get:
 *     tags: [Conversation]
 *     summary: Get a conversation by ID (participants only)
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Conversation' }
 *       403:
 *         description: Not a participant in this conversation
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:conversationId", getConversationById);

/**
 * @openapi
 * /conversations/{conversationId}/messages:
 *   get:
 *     tags: [Conversation]
 *     summary: Get messages of a conversation (participants only), newest first
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, default: 30, minimum: 1, maximum: 50 }
 *     responses:
 *       200:
 *         description: Paginated list of messages, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Message' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       403:
 *         description: Not a participant in this conversation
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   post:
 *     tags: [Conversation]
 *     summary: Send a message in a conversation (participants only)
 *     parameters:
 *       - name: conversationId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: "Hello, is the stadium available tomorrow?"
 *     responses:
 *       201:
 *         description: Message sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Message' }
 *       400:
 *         description: Empty or oversized message
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not a participant in this conversation
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/:conversationId/messages",
  validateQuery(messageListQuerySchema),
  getConversationMessages
);
router.post(
  "/:conversationId/messages",
  validate(sendMessageSchema),
  sendMessage
);

export default router;