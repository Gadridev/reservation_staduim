import mongoose from "mongoose";
import { User } from "../auth/auth.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import type { ListUsersQuery, DeactivateUserInput } from "./admin.validation.js";
import { AdminAction } from "./admin.model.js";

async function findUserOrThrow(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("User not found", 404);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function getUsers(query: ListUsersQuery) {
  const filter: Record<string, unknown> = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  const skip = (query.page - 1) * query.limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}

export async function getUserById(userId: string) {
  return findUserOrThrow(userId);
}

export async function deactivateUser(
  adminId: mongoose.Types.ObjectId,
  userId: string,
  input: DeactivateUserInput
) {
  const user = await findUserOrThrow(userId);

  if (user._id.toString() === adminId.toString()) {
    throw new AppError("You cannot deactivate your own account", 403);
  }

  if (user.role === "ADMIN") {
    throw new AppError("You do not have permission to manage another admin account", 403);
  }

  if (!user.isActive) {
    throw new AppError("This user is already inactive", 409);
  }

  user.isActive = false;
  await user.save();

  try {
    await AdminAction.create({
      adminId,
      action: "DEACTIVATE_USER",
      targetType: "USER",
      targetId: user._id,
      reason: input.reason,
    });
  } catch (err) {
    // Compensating action: audit log failed, revert the user state
    // to avoid an inconsistent deactivation with no trace.
    user.isActive = true;
    await user.save().catch(() => {});
    throw err;
  }

  return user;
}

export async function activateUser(adminId: mongoose.Types.ObjectId, userId: string) {
  const user = await findUserOrThrow(userId);

  if (user._id.toString() === adminId.toString()) {
    throw new AppError("You cannot activate your own account", 403);
  }

  if (user.role === "ADMIN") {
    throw new AppError("You do not have permission to manage another admin account", 403);
  }

  if (user.isActive) {
    throw new AppError("This user is already active", 409);
  }

  user.isActive = true;
  await user.save();

  try {
    await AdminAction.create({
      adminId,
      action: "ACTIVATE_USER",
      targetType: "USER",
      targetId: user._id,
      reason: null,
    });
  } catch (err) {
    user.isActive = false;
    await user.save().catch(() => {});
    throw err;
  }

  return user;
}