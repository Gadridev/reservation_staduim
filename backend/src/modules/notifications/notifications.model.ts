import mongoose, { Schema, type Document } from "mongoose";

export type NotificationType =
  | "NEW_BOOKING"
  | "BOOKING_CANCELLED"
  | "NEW_MESSAGE"
  | "ACCOUNT_DEACTIVATED"
  | "ACCOUNT_ACTIVATED"
  | "BOOKING_CONFIRMED";

export type NotificationTargetType = "BOOKING" | "CONVERSATION" | "USER";

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType: NotificationTargetType;
  relatedEntityId: mongoose.Types.ObjectId;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_BOOKING",
        "BOOKING_CANCELLED",
        "NEW_MESSAGE",
        "ACCOUNT_DEACTIVATED",
        "ACCOUNT_ACTIVATED",
        "BOOKING_CONFIRMED",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntityType: {
      type: String,
      enum: ["BOOKING", "CONVERSATION", "USER"],
      required: true,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);