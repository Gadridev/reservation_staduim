import type { Request, Response, NextFunction } from "express";
import {
  createStadium as createStadiumService,
  getPublicStadiums as getPublicStadiumsService,
  getStadiumById as getStadiumByIdService,
  getMyStadiums as getMyStadiumsService,
  updateStadium as updateStadiumService,
  deactivateStadium as deactivateStadiumService,
  getWorkingHours as getWorkingHoursService,
  updateWorkingHours as updateWorkingHoursService,
  getStadiumBookingsAvailablity as getStadiumBookingsAvailablityService
} from "./stadium.service.js";
import type mongoose from "mongoose";


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

//   "stadiumId": "6a98357948c8f433212ba1e3",
//   "date": "2026-09-15",
//   "pricePerHour": 100,
//   "slots": [
//     {
//       "startTime": "16:00",
//       "endTime": "17:00",
//       "status": "available"
//     },
//     {
//       "startTime": "17:00",
//       "endTime": "18:00",
//       "status": "available"
//     },
//     {
//       "startTime": "18:00",
//       "endTime": "19:00",
//       "status": "booked"
//     },
//     {
//       "startTime": "19:00",
//       "endTime": "20:00",
//       "status": "pending"
//     },
//     {
//       "startTime": "20:00",
//       "endTime": "21:00",
//       "status": "available"
//     }
//   ]
// }
//GET /api/stadiums/:stadiumId/availability?date=2026-09-15
export async function getStadiumBookingsAvailablity(req: Request, res: Response, next: NextFunction) {
  try {
    const stadiumId = req.params.id;
    const date = req.query.date as string;
console.log(date)
    const availability = await getStadiumBookingsAvailablityService(stadiumId as string , date);

    res.status(200).json({ success: true, data: availability });
  } catch (err) {
    next(err);
  }
}