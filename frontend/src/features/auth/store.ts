import { create } from "zustand";
import type { User } from "./api";

interface AuthState {
  user: User | null;
  isInitializing: boolean;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitializing: true,

  setUser: (user) => set({ user }),

  clearAuth: () => set({ user: null }),

  setInitializing: (value) => set({ isInitializing: value }),
}));
