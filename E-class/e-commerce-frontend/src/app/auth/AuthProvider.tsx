import React, { createContext, useContext, useMemo, useState } from "react";
import { authStorage, AuthState } from "@/services/auth.storage";

type AuthContextValue = {
  auth: AuthState | null;
  isLoggedIn: boolean;
  hasRole: (role: string) => boolean;
  hasPerm: (perm: string) => boolean;
  hasAnyPerm: (perms: string[]) => boolean;
  login: (data: AuthState) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(() => authStorage.get());

  const value = useMemo<AuthContextValue>(() => {
    const isLoggedIn = !!auth?.token;

    const hasRole = (role: string) => (auth?.role || "") === role;
    const hasPerm = (perm: string) => (auth?.permissions || []).includes(perm);
    const hasAnyPerm = (perms: string[]) => perms.some((p) => (auth?.permissions || []).includes(p));

    const login = (data: AuthState) => {
      authStorage.set(data);
      setAuth(data);
    };

    const logout = () => {
      authStorage.clear();
      setAuth(null);
    };

    return { auth, isLoggedIn, hasRole, hasPerm, hasAnyPerm, login, logout };
  }, [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};