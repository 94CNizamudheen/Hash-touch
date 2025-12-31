import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCharges } from "@/ui/hooks/useCharges";
import type { CartItem } from "@/types/cart";
import CartCard from "./CartCard";

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
      <div className="w-[480px]  h-screen bg-background flex flex-col border-r border-border shadow-lg safe-area ">
        {/* Header */}

        {isMobileOverlay && (
          <div className="h-10 px-4 flex items-center justify-between border-b border-border bg-secondary/30 shrink-0">
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}



        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 items-center mt-2">
          {items.length > 0 ? (
            items.map((item) => (
              <CartCard
                key={item.id}
                name={item.name}
                quantity={item.quantity}
                price={item.price}
              />
            )))
            : (
              <div className="text-center text-sm text-muted-foreground py-10">
                No items in order
              </div>
            )}
        </div>

        <div className="shrink-0 bg-background border-t border-border safe-bottom">
          <div className="px-4 py-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>{t("Sub Total")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {/* Display individual charges */}
            {charges.map((charge) => (
              <div
                key={charge.id}
                className={`flex justify-between text-xs ${charge.applied
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
                  }`}
              >
                <span>
                  {charge.name} ({charge.percentage}%)
                  {!charge.applied && (
                    <span className="ml-1 italic"></span>
                  )}
                </span>

                <span>${charge.amount.toFixed(2)}</span>
              </div>
            ))}


            {/* Display total tax if there are any tax charges */}
            {totalTax > 0 && (
              <div className="flex justify-between font-medium">
                <span>{t("Total Tax")}</span>
                <span>${totalTax.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border">
              <span>{t("Grand Total")}</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>{t("Payment Total")}</span>
              <span>${paymentTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-primary text-sm pt-1">
              <span>{t("Balance")}</span>
              <span>${balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
