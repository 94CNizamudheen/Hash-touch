import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import CardDineIn from "../common/card/CardDineIn";
import { useCart } from "@/ui/context/CartContext";
import { useCharges } from "@/ui/hooks/useCharges";
import type { CartItem } from "@/types/cart";

interface OrderSidebarProps {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
}

export default function OrderSidebar({
  items,
  total,
  isOpen,
  onClose,
}: OrderSidebarProps) {
  const { t } = useTranslation();
  const isMobileOverlay = isOpen && window.innerWidth < 1024;

  const { increment, decrement, remove } = useCart();
  const { charges, totalCharges, totalTax } = useCharges(items, total);

  const subtotal = total;
  const grandTotal = subtotal + totalCharges;
  const paymentTotal = grandTotal;
  const balance = grandTotal - paymentTotal;


  return (
    <div
      className={`${isMobileOverlay ? " fixed inset-0 z-50 bg-black/40 flex" : ""}`}
      onClick={(e) => {
        if (isMobileOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[420px]  h-screen bg-background flex flex-col border-r border-border shadow-lg safe-area ">
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border bg-secondary/30 shrink-0">
          <h2 className="text-sm font-semibold">{t("Order summary")}</h2>
          {isMobileOverlay && (
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>


        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 items-center ">
          {items.length > 0 ? (
            items.map((item) => (
              <CardDineIn
                key={item.id}
                menu={item.name}
                quantity={item.quantity}
                price={item.price}
                onIncrement={() => increment(item.id)}
                onDecrement={() => decrement(item.id)}
                onRemove={() => remove(item.id)}
              />
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              No items in order
            </div>
          )}
        </div>

        <div className="shrink-0 bg-background border-t border-border">
          <div className="px-4 py-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {/* Display individual charges */}
            {charges.map((charge) => (
              <div key={charge.id} className="flex justify-between text-muted-foreground">
                <span>
                  {charge.name} ({charge.percentage}%)
                </span>
                <span>${charge.amount.toFixed(2)}</span>
              </div>
            ))}

            {/* Display total tax if there are any tax charges */}
            {totalTax > 0 && (
              <div className="flex justify-between font-medium">
                <span>{t("total_tax")}</span>
                <span>${totalTax.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border">
              <span>{t("grand_total")}</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>{t("payment_total")}</span>
              <span>${paymentTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-primary text-sm pt-1">
              <span>{t("balance")}</span>
              <span>${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
