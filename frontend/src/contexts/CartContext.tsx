import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartLine, Product } from "@/types";

interface CartContextValue {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "audycook_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add = (product: Product, qty: number = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + qty } : l
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setDrawerOpen(true);
  };

  const remove = (productId: string) =>
    setLines((prev) => prev.filter((l) => l.product.id !== productId));

  const setQuantity = (productId: string, qty: number) =>
    setLines((prev) =>
      prev
        .map((l) => (l.product.id === productId ? { ...l, quantity: Math.max(0, qty) } : l))
        .filter((l) => l.quantity > 0)
    );

  const clear = () => setLines([]);

  const total = useMemo(
    () => lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0),
    [lines]
  );
  const count = useMemo(() => lines.reduce((acc, l) => acc + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider
      value={{ lines, add, remove, setQuantity, clear, total, count, drawerOpen, setDrawerOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
