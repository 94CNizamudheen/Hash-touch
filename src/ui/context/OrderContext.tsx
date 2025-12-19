import { createContext, useContext, useState,type ReactNode } from "react";

import type { Product } from "@/types/products";

interface OrderContextType {
  orderItems: Product[];
  addToOrder: (item: Product) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orderItems, setOrderItems] = useState<Product[]>([]);

  const addToOrder = (item: Product) => {
    setOrderItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: (p as any).quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const incrementItem = (id: string) => {
    setOrderItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: (p as any).quantity + 1 } : p
      )
    );
  };

  const decrementItem = (id: string) => {
    setOrderItems((prev) =>
      prev
        .map((p) =>
          p.id === id
            ? { ...p, quantity: Math.max((p as any).quantity - 1, 0) }
            : p
        )
        .filter((p) => (p as any).quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setOrderItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearOrder = () => setOrderItems([]);

  return (
    <OrderContext.Provider
      value={{ orderItems, addToOrder, incrementItem, decrementItem, removeItem, clearOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
};
