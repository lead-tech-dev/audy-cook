import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, customerApi } from "@/lib/api";

interface Customer {
  id: string;
  email: string;
  name: string;
}

interface CustomerAuthValue {
  customer: Customer | null;
  isLoggedIn: boolean;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCustomer: (patch: Partial<Customer>) => void;
}

const CustomerAuthContext = createContext<CustomerAuthValue | undefined>(undefined);

const TOKEN_KEY = "audycook_customer_token";

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    customerApi
      .get("/account/me")
      .then((r) => setCustomer({ id: r.data.id, email: r.data.email, name: r.data.name }))
      .catch((err) => {
        if (err?.response?.status === 401) localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const r = await api.post("/auth/register", { name, email, password });
    localStorage.setItem(TOKEN_KEY, r.data.access_token);
    setCustomer({ id: r.data.id, email: r.data.email, name: r.data.name });
  };

  const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, r.data.access_token);
    setCustomer({ id: r.data.id, email: r.data.email, name: r.data.name });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setCustomer(null);
  };

  const updateCustomer = (patch: Partial<Customer>) => {
    setCustomer((prev) => prev ? { ...prev, ...patch } : prev);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, isLoggedIn: !!customer, loading, register, login, logout, updateCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
