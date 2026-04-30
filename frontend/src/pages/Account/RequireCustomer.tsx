import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function RequireCustomer({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useCustomerAuth();
  const location = useLocation();
  if (loading) return <div style={{ padding: "6rem", textAlign: "center" }}>—</div>;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}
