"use client";

import { createContext, useState } from "react";

export const AuthContext = createContext();

const parseUserFromToken = (token) => {
  try {
    const [, payload = ""] = token.split(".");
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    return {
      token,
      role: decodedPayload?.role ?? "admin",
    };
  } catch {
    localStorage.removeItem("token");
    return null;
  }
};

const getInitialUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("token");

  return token ? parseUserFromToken(token) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);

  const login = (token, role) => {
    localStorage.setItem("token", token);
    setUser({ token, role });
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
