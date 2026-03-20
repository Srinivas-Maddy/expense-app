"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, AuthTokens } from "@expense-app/shared";
import { apiClient, setAccessToken } from "./api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  logout: () => void;
  updateCurrency: (currency: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function storeUserCurrency(currency: string) {
  localStorage.setItem("userCurrency", currency);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      apiClient<AuthTokens & { user: User }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: token }),
      })
        .then((data) => {
          setAccessToken(data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          if (data.user) {
            setUser(data.user);
            storeUserCurrency(data.user.currency);
          }
        })
        .catch(() => {
          localStorage.removeItem("refreshToken");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient<AuthTokens & { user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    storeUserCurrency(data.user.currency);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, currency?: string) => {
    const data = await apiClient<AuthTokens & { user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, currency }),
    });
    setAccessToken(data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    storeUserCurrency(data.user.currency);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      apiClient("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: token }),
      }).catch(() => {});
    }
    setAccessToken(null);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userCurrency");
    setUser(null);
  }, []);

  const updateCurrency = useCallback(async (currency: string) => {
    const updated = await apiClient<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ currency }),
    });
    storeUserCurrency(updated.currency);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateCurrency }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
