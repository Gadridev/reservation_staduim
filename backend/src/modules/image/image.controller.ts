import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import {
  uploadStadiumImage as uploadStadiumImageService,
  getStadiumImages as getStadiumImagesService,
  setPrimaryImage as setPrimaryImageService,
  deleteStadiumImage as deleteStadiumImageService,
} from "./image.service.js";

export async function uploadStadiumImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError("An image file is required", 400);
    }

    const image = await uploadStadiumImageService(
      req.params.stadiumId as string,
      req.user!._id,
      req.file
    );

    res.status(201).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
}

export async function getStadiumImages(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getStadiumImagesService(req.params.stadiumId as string);
    res.status(200).json({ success: true, data: result.images, isDefault: result.isDefault });
  } catch (err) {
    next(err);
  }
}

export async function setPrimaryImage(req: Request, res: Response, next: NextFunction) {
  try {
    const image = await setPrimaryImageService(
      req.params.stadiumId as string,
      req.user!._id,
      req.params.imageId as string
    );
    res.status(200).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
}

export async function deleteStadiumImage(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteStadiumImageService(req.params.stadiumId as string, req.user!._id, req.params.imageId as string);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}