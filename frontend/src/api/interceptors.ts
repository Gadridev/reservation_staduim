import type { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "../features/auth/store";
import toast from "react-hot-toast";

export const ACCESS_TOKEN_KEY = "accessToken";
export interface ApiErrorResponse {
  message: string;
  errors: Record<string, string[] | string>;
}

export function attachAuthInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(async (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => {

      const status = error.response?.status;
      const backendMessage = error.response?.data?.error.message;

      let finalMessage = "An unexpected error occurred; please try again later";

      if (status && status >= 400 && status < 500) {
        finalMessage = backendMessage || "Invalid data.";
      }

      else if (status && status >= 500) {
        finalMessage = "Server error, please try again later.";
      }
      return Promise.reject(new Error(finalMessage));
    },
  );
}
