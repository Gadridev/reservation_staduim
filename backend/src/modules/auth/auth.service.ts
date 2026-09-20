import { User } from "./auth.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";
import { generateToken } from "../../utils/jwt.js";
interface userId {
  userId: string;
}
interface updatePasswordInput {
  userId: string;
  body: { oldPassword: string; newPassword: string };
}
interface updateUserInput {
  userId: string;
  body: { firstName: string; lastName: string; email: string };
}
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
  const token = generateToken({ userId: user._id.toString() });

  return {
    token,
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}
export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.comparePassword(input.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }
  if (!user.isActive) {
    throw new AppError("Your account is inactive", 403);
  }
  const token = generateToken({ userId: user._id.toString() });

  return {
    token,
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}
export async function getMeUser(input: userId) {
  const user = await User.findById(input.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}
//update user
//allowedFields: firstName, lastName, email
const filterObjg = (obj: any, ...allowedFields: string[]) => {
  const filteredObj: any = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) {
      filteredObj[field] = obj[field];
    }
  });
  return filteredObj;
};
export async function updateUserService(input: updateUserInput) {
  const filteredBody = filterObjg(input.body, "firstName", "lastName", "email");
  const user = await User.findByIdAndUpdate(input.userId, filteredBody, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}
//second part update password
export async function updatePasswordService(input: updatePasswordInput) {
  const user = await User.findById(input.userId).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await user.comparePassword(input.body.oldPassword);

  if (!isPasswordValid) {
    throw new AppError("Old password is incorrect", 401);
  }

  user.password = input.body.newPassword;

  await user.save();

  const token = generateToken({
    userId: user._id.toString(),
  });

  return {
    token,
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}
//forgot password with reset and i will use email mailtrap
