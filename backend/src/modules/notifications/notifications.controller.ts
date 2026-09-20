import type { Request, Response, NextFunction } from "express";
import type { NotificationListQuery } from "./notifications.validation.js";
import {
  getMyNotifications as getMyNotificationsService,
  getUnreadCount as getUnreadCountService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
} from "./notifications.service.js";

export async function getMyNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.validatedQuery as NotificationListQuery;
    const { notifications, pagination } = await getMyNotificationsService(req.user!._id, query);
    res.status(200).json({ success: true, data: notifications, pagination });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await getUnreadCountService(req.user!._id);
    res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await markAsReadService(req.params.notificationId as string, req.user!._id);
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const modifiedCount = await markAllAsReadService(req.user!._id);
    res.status(200).json({ success: true, data: { modifiedCount } });
  } catch (err) {
    next(err);
  }
}