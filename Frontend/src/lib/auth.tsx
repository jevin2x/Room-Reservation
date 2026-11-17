import { useEffect, useState, type ReactNode } from "react";

import { authApi, getToken, setToken } from "@/lib/api";
import {
  AuthContext,
  type LoginData,
  type RegisterData,
} from "@/lib/auth-context";
import type { AuthUser } from "@/lib/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    let active = true;

    authApi
      .me()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function login(data: LoginData): Promise<void> {
    const result = await authApi.login(data);
    setToken(result.token);
    setUser(result.user);
  }

  async function register(data: RegisterData): Promise<void> {
    const result = await authApi.register(data);
    setToken(result.token);
    setUser(result.user);
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Ignore failures; the token is cleared regardless.
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}