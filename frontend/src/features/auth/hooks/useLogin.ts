import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginRequest, type LoginPayload, type LoginResponse } from "../api";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const from = (location.state as { from: Location })?.from?.pathname || "/";
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (credentials) => loginRequest(credentials),
    onSuccess: (user: LoginResponse) => {
      localStorage.setItem("accessToken", user.data.token);

      setUser(user.data);
      toast.success(`Welcome back, ${user.data.firstName}!`, {
        id: "auth-login-success",
      });
      navigate(from, { replace: true });
    },
    onError: (error) => {

      toast.error(error.message);
    },
  });
}