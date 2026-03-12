"use client";

import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadUserFromToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = JSON.parse(atob(token.split('.')[1]));
          setUser({ token, role: userData.role });
        } catch {
          localStorage.removeItem('token');
        }
      }
    }
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const login = (token, role) => {
    localStorage.setItem('token', token);
    setUser({ token, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

