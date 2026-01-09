
import CartSidebar from "./CartSidebar";
import { useState, type ReactNode } from "react";
import { ShoppingCart, TextAlignJustifyIcon } from "lucide-react";
import { useCart } from "@/ui/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import MenuSelectionSidebarMobile from "./MenuSelectionSidebarMobile";

/* =========================
   Header
========================= */
const MobileHeader = ({ onOpenCart, onOpenMenu }: any) => {
  const { items } = useCart();

  const itemCount = items.reduce(
    (sum, item: any) => sum + item.quantity,
    0
  );

  return (
    <header className="fixed left-0 w-full h-16 z-30 border-b border-border bg-background flex items-center justify-between px-4">
      {/* Cart Button */}
      <button
         id="cart-button" 
        onClick={onOpenCart}
        className="relative w-10 h-10 flex items-center justify-center bg-primary rounded-full"
      >
        <ShoppingCart className="w-5 h-5 text-background" />

        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {itemCount}
          </motion.span>
        )}
      </button>

      {/* <h3 className="text-sm font-semibold">Dine In — Table T1</h3> */}

      <button
        onClick={onOpenMenu}
        className="w-10 h-10 flex items-center justify-center bg-primary rounded-full"
      >
        <TextAlignJustifyIcon className="w-6 h-6 text-background" />
      </button>
    </header>
  );
};

/* =========================
   Mobile View
========================= */
const MobileView = ({ children }: { children?: ReactNode }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-screen flex flex-col bg-background safe-area">
      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Menu Sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 w-[80%] z-50 shadow-xl bg-background"
            >
              <MenuSelectionSidebarMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <MobileHeader
        onOpenCart={() => setCartOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 mt-16 overflow-y-auto no-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default MobileView;