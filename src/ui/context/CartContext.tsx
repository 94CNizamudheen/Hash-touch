import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

import type { Product } from "@/types/products";
import { cartLocal } from "@/services/local/cart.local.service";
import type { CartItem } from "@/types/cart";
import { productGroupCategoryLocal } from "@/services/local/product-group-category.local.service";


interface CartContextType {
  items: CartItem[];
  isHydrated: boolean;

  addItem: (item: Product, modifiers?: { name: string; qty: number; price: number }[]) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => Promise<void>;
  clearCart: () => Promise<void>;
  updateModifiers: (id: string, modifiers: { name: string; qty: number; price: number }[], basePrice: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [categories, setCategories] = useState<Map<string, string>>(new Map());

  /* -------------------------------
      🔁 Hydrate from SQLite
  -------------------------------- */
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [draft, cats] = await Promise.all([
          cartLocal.getDraft(),
          productGroupCategoryLocal.getAll(),
        ]);

        // Build category_id -> product_group_id map
        const categoryMap = new Map<string, string>();
        cats.forEach((cat) => {
          categoryMap.set(cat.id, cat.product_group_id);
        });
        setCategories(categoryMap);

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
  const addItem = (item: Product, modifiers?: { name: string; qty: number; price: number }[]) => {
    setItems((prev) => {
      // Create a normalized modifier key for comparison
      const modifiersKey = modifiers && modifiers.length > 0
        ? JSON.stringify(
            modifiers
              .map(m => ({ name: m.name, price: m.price }))
              .sort((a, b) => a.name.localeCompare(b.name))
          )
        : '';

      // Find existing item with same product_id and same modifiers
      const existingItemIndex = prev.findIndex((cartItem) => {
        if (cartItem.product_id !== item.id) return false;

        const existingModifiersKey = cartItem.modifiers && cartItem.modifiers.length > 0
          ? JSON.stringify(
              cartItem.modifiers
                .map(m => ({ name: m.name, price: m.price }))
                .sort((a, b) => a.name.localeCompare(b.name))
            )
          : '';

        return existingModifiersKey === modifiersKey;
      });

      // If found, increment quantity
      if (existingItemIndex !== -1) {
        return prev.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      // Get product_group_id from category mapping
      const product_group_id = item.category_id
        ? categories.get(item.category_id) || null
        : null;

      // Calculate total price including modifiers
      const modifiersTotal = modifiers?.reduce((sum, m) => sum + m.price * m.qty, 0) || 0;
      const totalPrice = item.price + modifiersTotal;

      // Generate unique cart entry ID
      const cartEntryId = uuidv4();

      // Create new cart item
      return [
        ...prev,
        {
          id: cartEntryId,
          product_id: item.id,
          name: item.name,
          price: totalPrice,
          quantity: 1,
          category_id: item.category_id || null,
          product_group_id,
          image_url: null,
          modifiers,
        },
      ];
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

  const updateModifiers = (id: string, modifiers: { name: string; qty: number; price: number }[], basePrice: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        // Recalculate total price with new modifiers
        const modifiersTotal = modifiers?.reduce((sum, m) => sum + m.price * m.qty, 0) || 0;
        const totalPrice = basePrice + modifiersTotal;

        return {
          ...item,
          modifiers,
          price: totalPrice,
        };
      })
    );
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
        clearCart: clear,
        updateModifiers,
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
