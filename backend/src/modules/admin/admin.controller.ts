import type { Request, Response, NextFunction } from "express";
import type { ListUsersQuery, DeactivateUserInput } from "./admin.validation.js";
import {
  getUsers as getUsersService,
  getUserById as getUserByIdService,
  deactivateUser as deactivateUserService,
  activateUser as activateUserService,
} from "./admin.service.js";

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.validatedQuery as ListUsersQuery;
    const { users, pagination } = await getUsersService(query);
    res.status(200).json({ success: true, data: users, pagination });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserByIdService(req.params.userId as string);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await deactivateUserService(
      req.user!._id,
      req.params.userId as string,
      req.body as DeactivateUserInput
    );
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function activateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await activateUserService(req.user!._id, req.params.userId as string);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}