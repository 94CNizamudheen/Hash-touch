import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/ui/shadcn/components/ui/button";

import { useNavigate } from "react-router-dom";
import { useCart } from "@/ui/context/CartContext";
import EmptyCart from "@/assets/empty-cart.png";
import CardDineIn from "../../common/card/CardDineIn";
import ProductTagGroupModal from "../ProductTagGroupModal";
import ClearCartConfirmModal from "../../modal/ClearCartConfirmModal";
import { useState } from "react";
import type { CartItem } from "@/types/cart";
import { useTranslation } from "react-i18next";
import { useCharges } from "@/ui/hooks/useCharges";
import { useSetup } from "@/ui/context/SetupContext";

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const CartSidebar = ({ open, onClose }: CartSidebarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currencyCode } = useSetup();

  const {
    items,
    increment,
    decrement,
    remove,
    clearCart,
    isHydrated,
    updateModifiers,
  } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate total and charges before early returns to keep hooks order stable
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // Calculate charges (hook called unconditionally)
  const { charges, totalCharges } = useCharges(items, total);
  const subtotal = total;
  const grandTotal = subtotal + totalCharges;
  
  // Avoid flicker before SQLite hydration
  if (!isHydrated) return null;

  const handleSettle = () => {
    navigate("/pos/payment-panel", {
      state: { items, total: grandTotal },
    });
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  const handleCardClick = (item: CartItem) => {
    if (!item.product_id) return;
    setSelectedCartItem(item);
    setModalOpen(true);
  };

  const handleModalConfirm = (modifiers: { name: string; qty: number; price: number }[]) => {
    if (!selectedCartItem || !selectedCartItem.product_id) return;

    // Get the base price from product (we need to fetch it or store it)
    // For now, we'll calculate it from the current item
    const currentModifiersTotal = selectedCartItem.modifiers?.reduce((sum, m) => sum + m.price * m.qty, 0) || 0;
    const basePrice = selectedCartItem.price - currentModifiersTotal;

    updateModifiers(selectedCartItem.id, modifiers, basePrice);
    setModalOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 bg-black/50 z-40 pointer-events-auto"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className=" fixed left-0 top-0 bottom-0 w-[80%] sm:w-[60%] 
                       bg-background z-50 shadow-2xl flex flex-col 
                       pointer-events-auto border-r border-border rounded-r-2xl"
          >

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
              {items.length > 0 ? (
                items.map((item) => (
                  <CardDineIn
                    key={item.id}
                    menu={item.name}
                    quantity={item.quantity}
                    price={item.price}
                    modifiers={item.modifiers}
                    onIncrement={() => increment(item.id)}
                    onDecrement={() => decrement(item.id)}
                    onRemove={() => remove(item.id)}
                    onClick={() => handleCardClick(item)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10">
                  <img
                    src={EmptyCart}
                    alt="Empty cart"
                    className="w-32 h-32 opacity-80 mb-3"
                  />
                  <p className="text-center text-muted-foreground text-sm">
                    {t("No items in cart")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="flex-shrink-0 border-t border-border p-3 flex flex-col gap-2 bg-background">
              {/* Totals Section */}
              {items.length > 0 && (
                <div className="space-y-1 text-xs pb-2">
                  <div className="flex justify-between text-foreground">
                    <span>{t("Sub Total")}</span>
                    <span>{currencyCode} {subtotal.toFixed(2)}</span>
                  </div>

                  {charges.filter(charge => charge.applied).map((charge) => (
                    <div key={charge.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {charge.name} ({charge.percentage}%)
                      </span>
                      <span>{currencyCode} {charge.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border text-foreground">
                    <span>{t("Grand Total")}</span>
                    <span>{currencyCode} {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSettle}
                  className="flex-1 h-10 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary-hover active:bg-primary-hover"
                  disabled={!items.length}
                >
                  {t("Settle")}
                </Button>

                <Button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 h-10 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-muted active:bg-muted"
                  disabled={!items.length}
                >
                  {t("Clear")}
                </Button>
              </div>
            </footer>
          </motion.div>

          {/* Product Tag Group Modal */}
          {selectedCartItem && selectedCartItem.product_id && (
            <ProductTagGroupModal
              open={modalOpen}
              productId={selectedCartItem.product_id}
              productName={selectedCartItem.name}
              productPrice={selectedCartItem.price - (selectedCartItem.modifiers?.reduce((sum, m) => sum + m.price * m.qty, 0) || 0)}
              onClose={() => setModalOpen(false)}
              onConfirm={handleModalConfirm}
              initialModifiers={selectedCartItem.modifiers}
              isEditMode={true}
            />
          )}

          {/* Clear Cart Confirm Modal */}
          {showClearConfirm && (
            <ClearCartConfirmModal
              onClose={() => setShowClearConfirm(false)}
              onConfirm={handleClearCart}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
