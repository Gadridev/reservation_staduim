import { User } from "./auth.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import type { RegisterInput,LoginInput } from "./auth.validation.js";
import { generateToken } from "../../utils/jwt.js";
interface getMe {
    userId:string
}
export async function registerUser(input: RegisterInput) {
  // const existingUser = await User.findOne({ email: input.email });
  // if (existingUser) {
  //   throw new AppError("Email is already registered", 409);
  // }
  console.log(input)

  const user = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,

  });

  return {
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
// export async function getMeUser(input:getMe){

// }