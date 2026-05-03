// src/context/AuthContext.js
"use client";
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const normalizeTokens = (tokens) => {
  const source = tokens?.tokens ?? tokens ?? {};
  return {
    accessToken:
      source.accessToken ||
      source.access_token ||
      source.token ||
      source.jwt ||
      source.access ||
      null,
    refreshToken:
      source.refreshToken || source.refresh_token || source.refresh || null,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (userData, tokens) => {
    const normalized = normalizeTokens(tokens);
    if (normalized.accessToken)
      localStorage.setItem("accessToken", normalized.accessToken);
    if (normalized.refreshToken)
      localStorage.setItem("refreshToken", normalized.refreshToken);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
