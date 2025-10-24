// src/app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "CUSTOMER" | "SUPER_ADMIN" | "GUEST";
} | null;

type AuthContextType = {
  user: User;
  token: string | null; // allow null for guest users
  login: (user: User, token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return; // no token → probably guest → skip JWT logic

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp < now) {
        logout();
        return;
      }

      const timeout = (payload.exp - now) * 1000;
      const timer = setTimeout(() => logout(), timeout);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Invalid token", err);
      logout();
    }
  }, [token]);

  const login = (user: User, token: string | null) => {
    if (token) {
      localStorage.setItem("token", token);
    }
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
