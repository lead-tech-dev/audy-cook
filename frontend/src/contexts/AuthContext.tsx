import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthContextValue {
  isAuthed: boolean;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("audycook_admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/admin/me")
      .then((r) => {
        setIsAuthed(true);
        setEmail(r.data.email);
      })
      .catch(() => {
        localStorage.removeItem("audycook_admin_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (em: string, password: string) => {
    const r = await api.post("/admin/login", { email: em, password });
    localStorage.setItem("audycook_admin_token", r.data.access_token);
    setIsAuthed(true);
    setEmail(r.data.email);
  };

  const logout = () => {
    localStorage.removeItem("audycook_admin_token");
    setIsAuthed(false);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthed, email, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
