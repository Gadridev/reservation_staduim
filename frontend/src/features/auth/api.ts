import api from "../../api/client";

export type UserRole = "PLAYER" | "OWNER" | "ADMIN";

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
  token:string
}
export interface LoginResponse {
  data: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export async function updateUserRequest(payload: UpdateUserPayload): Promise<void> {
  await api.put("/auth/updateUser", payload);
}

export async function changePasswordRequest(payload: ChangePasswordPayload): Promise<void> {
  await api.put("/auth/password", payload);
}


export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post("/auth/login", payload);
  return response.data;
}
export async function registerRequest(payload: RegisterPayload): Promise<LoginResponse> {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function getCurrentUserRequest(): Promise<User> {
  const response = await api.get("/auth/me");
  return response.data.data;
}
