// src/components/ProtectedRoute.tsx
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  if (!auth.access) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
