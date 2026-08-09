import multer, { MulterError } from "multer";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { IMAGE_RULES } from "../constants/imageRules.js";

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_RULES.MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_RULES.ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      return cb(new AppError("Unsupported file type. Allowed: JPEG, PNG, WEBP", 400) as any);
    }
    cb(null, true);
  },
}).single("image");

export function uploadImage(req: Request, res: Response, next: NextFunction) {
  multerUpload(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Image file is too large (max 5MB)", 400));
      }
      if (err instanceof AppError) return next(err);
      return next(new AppError((err as Error).message || "File upload failed", 400));
    }
    next();
  });
}