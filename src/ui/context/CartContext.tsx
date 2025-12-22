import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/types/products";
import { cartLocal } from "@/services/local/cart.local.service";
import type { CartItem } from "@/types/common";


interface CartContextType {
  items: CartItem[];
  isHydrated: boolean;

  addItem: (item: Product) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  /* -------------------------------
      🔁 Hydrate from SQLite
  -------------------------------- */
  useEffect(() => {
    const hydrate = async () => {
      try {
        const draft = await cartLocal.getDraft();
        if (draft) {
          setItems(draft);
        }
      } catch (e) {
        console.error("Cart hydrate failed:", e);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrate();
  }, []);

  /* -------------------------------
      💾 Persist to SQLite
  -------------------------------- */
  useEffect(() => {
    if (!isHydrated) return;
    cartLocal.saveDraft(items).catch(console.error);
  }, [items, isHydrated]);

  /* -------------------------------
      Actions
  -------------------------------- */
  const addItem = (item: Product) => {
    setItems((prev) => {
      const ex = prev.find((p) => p.id === item.id);
      if (ex) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const increment = (id: string) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  };

  const decrement = (id: string) => {
    setItems((prev) =>
      prev
        .map((p) =>
          p.id === id
            ? { ...p, quantity: Math.max(p.quantity - 1, 0) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clear = async () => {
    setItems([]);
    await cartLocal.clear();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        addItem,
        increment,
        decrement,
        remove,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
