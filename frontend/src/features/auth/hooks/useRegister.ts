import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  registerRequest,
  type LoginResponse,
  type RegisterPayload,
} from "../api";

export function useRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const from = (location.state as { from: Location })?.from?.pathname || "/";
  return useMutation<LoginResponse, Error, RegisterPayload>({
    mutationFn: (credentials) => registerRequest(credentials),
    onSuccess: (user: LoginResponse) => {
      localStorage.setItem("accessToken", user.data.token);

      setUser(user.data);
      toast.success(`Welcome , ${user.data.firstName}!`, {
        id: "auth-register-success",
      });
      navigate(from, { replace: true });
    },
    onError: (error) => {

      toast.error(error.message);
    },
  });
}
