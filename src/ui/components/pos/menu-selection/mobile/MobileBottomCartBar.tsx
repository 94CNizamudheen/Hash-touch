import { useCart } from "@/ui/context/CartContext";
import { useSetup } from "@/ui/context/SetupContext";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const MobileBottomCartBar = ({ onOpenCart }: { onOpenCart: () => void }) => {
  const { items } = useCart();
  const { currencyCode } = useSetup();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
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
                bg-primary
                text-background
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

                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-background text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-semibold text-sm">
                    {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? "Item" : "Items"}` : "My Cart"}
                  </div>
                  <div className="text-xs text-white/80">
                    Tap to view
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs opacity-80">
                    {itemCount > 0 ? "Total" : ""}
                  </div>
                  <div className="font-bold text-xl">
                    {itemCount > 0 ? `${currencyCode} ${total.toFixed(2)}` : "Add items"}
                  </div>
                </div>

                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  <FaArrowUp />
                </motion.div>
              </div>
            </button>
          </div>
        </motion.div>
    </AnimatePresence>
  );
};

export default MobileBottomCartBar;