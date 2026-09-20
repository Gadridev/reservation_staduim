import mongoose from "mongoose";
import { Notification } from "./notifications.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { getIO } from "../../socket/socket.server.js";
import type { NotificationType, NotificationTargetType } from "./notifications.model.js";
import type { NotificationListQuery } from "./notifications.validation.js";

interface CreateNotificationParams {
  recipientId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType: NotificationTargetType;
  relatedEntityId: mongoose.Types.ObjectId;
}

export async function createNotification(params: CreateNotificationParams) {
  const notification = await Notification.create(params);

  const io = getIO();
  io.to(`user:${params.recipientId}`).emit("new_notification", notification);

  return notification;
}

export async function getMyNotifications(
  userId: mongoose.Types.ObjectId,
  query: NotificationListQuery
) {
  const filter = { recipientId: userId };
  const skip = (query.page - 1) * query.limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}

export async function getUnreadCount(userId: mongoose.Types.ObjectId) {
  const count = await Notification.countDocuments({ recipientId: userId, isRead: false });
  return count;
}

export async function markAsRead(notificationId: string, userId: mongoose.Types.ObjectId) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError("Notification not found", 404);
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.recipientId.toString() !== userId.toString()) {
    throw new AppError("You do not have permission to access this notification", 403);
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  return notification;
}

export async function markAllAsRead(userId: mongoose.Types.ObjectId) {
  const result = await Notification.updateMany(
    { recipientId: userId, isRead: false },
    { $set: { isRead: true } }
  );

  return result.modifiedCount;
}