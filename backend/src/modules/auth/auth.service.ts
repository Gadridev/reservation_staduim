import { User } from "./auth.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import type { RegisterInput } from "./auth.validation.js";

export async function registerUser(input: RegisterInput) {
  const existingUser = await User.findOne({ email: input.email });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
    // role غير مربوط بالـ input — دايما PLAYER بشكل افتراضي
  });

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}