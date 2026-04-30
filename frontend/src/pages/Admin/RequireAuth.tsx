import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading } = useAuth();
  if (loading) return <div style={{ padding: "6rem", textAlign: "center" }}>—</div>;
  if (!isAuthed) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
