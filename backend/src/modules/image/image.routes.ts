import { Router } from "express";
import {
  uploadStadiumImage,
  getStadiumImages,
  setPrimaryImage,
  deleteStadiumImage,
} from "./image.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { authorize } from "../../shared/middleware/authorize.js";
import { uploadImage } from "../../shared/middleware/upload.js";

// mergeParams: true → باش naccessi req.params.stadiumId جاي من الـ parent mount path
const router = Router({ mergeParams: true });

/**
 * @openapi
 * /stadiums/{stadiumId}/images:
 *   post:
 *     tags: [Image]
 *     summary: Upload an image for a stadium (OWNER only, max 5 real images)
 *     parameters:
 *       - name: stadiumId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPEG, PNG or WEBP, max 5MB
 *     responses:
 *       201:
 *         description: Image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Image' }
 *       400:
 *         description: Missing file, or unsupported file type/size
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
 *       409:
 *         description: Maximum of 5 images already reached
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   get:
 *     tags: [Image]
 *     summary: Get a stadium's images (real images, or 3 default images if none uploaded)
 *     parameters:
 *       - name: stadiumId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of images (real or default fallback)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 isDefault: { type: boolean, example: false }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Image' }
 *       404:
 *         description: Stadium not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/", authenticate, authorize("OWNER"), uploadImage, uploadStadiumImage);
router.get("/", getStadiumImages);

/**
 * @openapi
 * /stadiums/{stadiumId}/images/{imageId}/primary:
 *   patch:
 *     tags: [Image]
 *     summary: Set an image as the primary image (OWNER only)
 *     parameters:
 *       - name: stadiumId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: imageId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Primary image updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Image' }
 *       403:
 *         description: Not the owner of this stadium
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Stadium or image not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.patch("/:imageId/primary", authenticate, authorize("OWNER"), setPrimaryImage);

/**
 * @openapi
 * /stadiums/{stadiumId}/images/{imageId}:
 *   delete:
 *     tags: [Image]
 *     summary: Delete a stadium image (OWNER only)
 *     parameters:
 *       - name: stadiumId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *       - name: imageId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: "null", example: null }
 *       403:
 *         description: Not the owner of this stadium
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Stadium or image not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/:imageId", authenticate, authorize("OWNER"), deleteStadiumImage);

export default router;