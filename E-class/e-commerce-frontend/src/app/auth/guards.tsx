import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // ✅ fallback: nếu AuthProvider chưa kịp cập nhật, vẫn cho qua nếu có token
  const token = localStorage.getItem("access_token");
  const ok = isLoggedIn || !!token;

  if (!ok) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

export const RequirePerm: React.FC<{
  perm?: string;
  anyPerms?: string[];
  children: React.ReactNode;
}> = ({ perm, anyPerms, children }) => {
  const { hasPerm, hasAnyPerm } = useAuth();

  // ✅ ADMIN bypass
  const role = (localStorage.getItem("role") || "").replace("ROLE_", "");
  if (role === "ADMIN") return <>{children}</>;

  const ok = perm ? hasPerm(perm) : anyPerms ? hasAnyPerm(anyPerms) : true;

  if (!ok) return <Navigate to="/403" replace />;
  return <>{children}</>;
};