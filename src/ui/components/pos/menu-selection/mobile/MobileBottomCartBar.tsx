import { useCart } from "@/ui/context/CartContext";
import { useSetup } from "@/ui/context/SetupContext";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const MobileBottomCartBar = ({ onOpenCart }: { onOpenCart: () => void }) => {
  const { items } = useCart();
  const { currencyCode } = useSetup();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          key="mobile-bottom-cart"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none safe-area-bottom"
        >
          <div className="px-4 pb-4 pt-2">
            <button
              onClick={onOpenCart}
              className="
                w-full h-16 px-6 rounded-2xl
                flex items-center justify-between
                shadow-[0_4px_20px_rgba(0,0,0,0.15)]
                pointer-events-auto
                bg-gradient-to-r from-blue-600 to-blue-700
                text-white
                hover:scale-[1.02]
                active:scale-[0.98]
                transition-transform
              "
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div id="cart-button" className="p-2 rounded-xl bg-white/20">
                    <ShoppingCart className="w-5 h-5" />
                  </div>

                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-sm">
                    {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </div>
                  <div className="text-xs text-white/80">
                    Tap to view
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs opacity-80">Total</div>
                  <div className="font-bold text-xl">
                    {currencyCode} {total.toFixed(2)}
                  </div>
                </div>

                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileBottomCartBar;