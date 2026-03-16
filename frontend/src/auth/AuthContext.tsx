import React, { createContext, useContext, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "./tokenStorage";

type AuthContextValue = {
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      async login(identifier: string, password: string) {
        const res = await api.post("/auth/login", { identifier, password });
        const newToken: string = res.data?.accessToken;
        if (!newToken) throw new Error("Token not returned by server");
        setStoredToken(newToken);
        setToken(newToken);
      },
      async register(username: string, email: string, password: string) {
        await api.post("/auth/register", { username, email, password });
      },
      async logout() {
        try {
          const current = getStoredToken();
          if (current) await api.post("/auth/logout", { token: current });
        } finally {
          clearStoredToken();
          setToken(null);
        }
      },
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

