import { createContext, useContext } from "react";

import type { AuthUser } from "@/lib/api";

export type LoginData = {
  program: string;
  year: number;
  section: string;
  password: string;
};

export type RegisterData = LoginData & {
  password_confirmation: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}