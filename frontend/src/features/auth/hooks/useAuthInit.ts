import { useEffect } from "react";
import { useAuthStore } from "../store";
import { getCurrentUserRequest } from "../api";

export const useAuthInit = () => {
  const { setInitializing, setUser, clearAuth } = useAuthStore();
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const getmeResponse = await getCurrentUserRequest();
        setUser(getmeResponse);
      } catch (error) {
        localStorage.removeItem("accessToken");
        clearAuth();
      } finally {
        setInitializing(false);
      }
    }
    initAuth();
  }, [setInitializing, setUser, clearAuth]);
};
