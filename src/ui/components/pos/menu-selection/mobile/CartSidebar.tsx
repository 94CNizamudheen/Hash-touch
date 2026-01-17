import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ShoppingBag, Plus } from "lucide-react";
import { MdAddShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/ui/context/CartContext";
import EmptyCart from "@/assets/empty-cart.png";
import CartItemCardMobile from "./CartItemCardMobile";
import ProductTagGroupModal from "../ProductTagGroupModal";
import ClearCartConfirmModal from "../../modal/ClearCartConfirmModal";
import { useState } from "react";
import type { CartItem } from "@/types/cart";
import { useTranslation } from "react-i18next";
import { useCharges } from "@/ui/hooks/useCharges";
import { useSetup } from "@/ui/context/SetupContext";
import { FaArrowCircleDown } from "react-icons/fa";
import { Button } from "@/ui/shadcn/components/ui/button"; 

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

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { charges, totalCharges } = useCharges(items, total);
  const subtotal = total;
  const grandTotal = subtotal + totalCharges;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isHydrated) return null;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close on downward drag
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  const handleSettle = () => {
    navigate("/pos/payment-panel", {
      state: { items, total: grandTotal },
    });
  };

  const handleAddMore = () => {
    onClose();
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

          {/* Full Page Cart - Slides from Bottom */}
          <motion.div
            key="cart-drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            className={`safe-area fixed inset-0 bg-background z-50 flex flex-col pointer-events-auto`}
          >
            {/* Header */}
            <header className="flex-shrink-0 px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:scale-95 transition-transform"
                >
                  <FaArrowCircleDown  className="w-5 h-5 text-foreground" />
                </button>

                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h1 className="text-lg font-bold text-foreground">{t("My Cart")}</h1>
                  {itemCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => items.length > 0 && setShowClearConfirm(true)}
                  disabled={items.length === 0}
                  variant="destructive"
                  size="sm"
                >
                  {t("Clear")}
                </Button>
              </div>
            </header>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {items.length > 0 ? (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <CartItemCardMobile
                      key={item.id}
                      name={item.name}
                      quantity={item.quantity}
                      price={item.price}
                      imageUrl={item.image_url}
                      modifiers={item.modifiers}
                      onIncrement={() => increment(item.id)}
                      onDecrement={() => decrement(item.id)}
                      onRemove={() => remove(item.id)}
                      onClick={() => handleCardClick(item)}
                    />
                  ))}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 h-full py-20">
                  <img
                    src={EmptyCart}
                    alt="Empty cart"
                    className="w-40 h-40 opacity-80 mb-4"
                  />
                  <p className="text-lg font-medium text-foreground mb-1">
                    {t("Your cart is empty")}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t("Add items to get started")}
                  </p>
                  <button
                    onClick={handleAddMore}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2 active:scale-95 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                    {t("Browse Menu")}
                  </button>
                </div>
              )}
            </div>

            {/* Footer - Only show when items exist */}
            {items.length > 0 && (
              <footer className="flex-shrink-0 border-t border-border bg-secondary ">
                {/* Order Summary */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("Subtotal")} ({itemCount} {t("items")})</span>
                    <span className="text-foreground">{currencyCode} {subtotal.toFixed(2)}</span>
                  </div>

                  {charges.filter(charge => charge.applied).map((charge) => (
                    <div key={charge.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {charge.name} ({charge.percentage}%)
                      </span>
                      <span className="text-foreground">{currencyCode} {charge.amount.toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-base font-bold text-foreground">{t("Total")}</span>
                    <span className="text-xl font-bold text-primary">
                      {currencyCode} {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Buttons */}
                <div className="px-4 pb-4 flex gap-3">
                  <button
                    onClick={handleAddMore}
                    className="h-14 bg-secondary text-foreground border-2 border-primary rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform flex-shrink-0 px-6"
                  >
                    <MdAddShoppingCart className="w-6 h-6" />
                    <span>{t("Add More")}</span>
                  </button>
                  
                  <button
                    onClick={handleSettle}
                    className="flex-1 h-14 bg-primary text-primary-foreground rounded-xl font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg"
                  >
                    <span>{t("Settle")}</span>
                    <span className="bg-primary-foreground/20 px-3 py-1 rounded-lg text-sm">
                      {currencyCode} {grandTotal.toFixed(2)}
                    </span>
                  </button>
                </div>
              </footer>
            )}
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