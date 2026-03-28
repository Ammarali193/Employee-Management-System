"use client";

import { createContext, useState } from "react";

export const AuthContext = createContext();

const normalizeToken = (rawToken) => {
  const token = String(rawToken || "").trim();

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token.replace(/^"|"$/g, "").replace(/^Bearer\s+/i, "");
};

const decodeBase64Url = (value) => {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

const parseUserFromToken = (token) => {
  try {
    const safeToken = normalizeToken(token);

    if (!safeToken) {
      return null;
    }

    const [, payload = ""] = safeToken.split(".");
    const decodedPayload = JSON.parse(decodeBase64Url(payload));

    return {
      token: safeToken,
      role: decodedPayload?.role ?? "admin",
    };
  } catch {
    // Keep token in storage and let API/auth flow handle invalid token response.
    return null;
  }
};

const getInitialUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = normalizeToken(localStorage.getItem("token"));

  return token ? parseUserFromToken(token) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);

  const login = (token, role) => {
    const safeToken = normalizeToken(token);

    if (safeToken) {
      localStorage.setItem("token", safeToken);
      setUser({ token: safeToken, role });
      return;
    }

    localStorage.removeItem("token");
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
