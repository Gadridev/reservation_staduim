import mongoose, { Schema, type Document } from "mongoose";

export type AdminActionType = "DEACTIVATE_USER" | "ACTIVATE_USER";
export type AdminActionTargetType = "USER";

export interface IAdminAction extends Document {
  adminId: mongoose.Types.ObjectId;
  action: AdminActionType;
  targetType: AdminActionTargetType;
  targetId: mongoose.Types.ObjectId;
  reason: string | null;
}

const adminActionSchema = new Schema<IAdminAction>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["DEACTIVATE_USER", "ACTIVATE_USER"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["USER"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdminAction = mongoose.model<IAdminAction>("AdminAction", adminActionSchema);