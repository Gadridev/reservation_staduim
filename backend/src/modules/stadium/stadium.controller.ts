import type { Request, Response, NextFunction } from "express";
import {
  createStadium as createStadiumService,
  getPublicStadiums as getPublicStadiumsService,
  getStadiumById as getStadiumByIdService,
  getMyStadiums as getMyStadiumsService,
  updateStadium as updateStadiumService,
  deactivateStadium as deactivateStadiumService,
  getWorkingHours as getWorkingHoursService,
  updateWorkingHours as updateWorkingHoursService
} from "./stadium.service.js";

export async function createStadium(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = req.user!._id;
    const stadium = await createStadiumService(ownerId, req.body);

    res.status(201).json({
      success: true,
      data: stadium,
    });
  } catch (err) {
    next(err);
  }
}
export async function getPublicStadiums(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stadiums = await getPublicStadiumsService();
    res.status(200).json({ success: true, data: stadiums });
  } catch (err) {
    next(err);
  }
}

export async function getStadiumById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log(typeof req.params.id);
    const stadium = await getStadiumByIdService(req.params.id as string);
    res.status(200).json({ success: true, data: stadium });
  } catch (err) {
    next(err);
  }
}
export async function getMyStadiums(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = req.user!._id;
    console.log("just for checking", ownerId);
    const stadiums = await getMyStadiumsService(ownerId);
    res.status(200).json({ success: true, data: stadiums });
  } catch (err) {
    next(err);
  }
}
export async function updateStadium(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = req.user!._id;
    const stadium = await updateStadiumService(
      req.params.id as string,
      ownerId,
      req.body,
    );
    res.status(200).json({ success: true, data: stadium });
  } catch (err) {
    next(err);
  }
}
export async function deactivateStadium(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = req.user!._id;
    const stadium = await deactivateStadiumService(
      req.params.id as string,
      ownerId,
    );
    res.status(200).json({ success: true, data: stadium });
  } catch (err) {
    next(err);
  }
}
export async function getWorkingHours(req: Request, res: Response, next: NextFunction) {
  try {
    const workingHours = await getWorkingHoursService(req.params.id as string);
    res.status(200).json({ success: true, data: workingHours });
  } catch (err) {
    next(err);
  }
}

export async function updateWorkingHours(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!._id;
    const workingHours = await updateWorkingHoursService(req.params.id as string, ownerId, req.body);
    res.status(200).json({ success: true, data: workingHours });
  } catch (err) {
    next(err);
  }
}