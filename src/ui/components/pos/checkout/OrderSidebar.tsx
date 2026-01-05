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
  tenderedAmount?: number;
}

export default function OrderSidebar({
  items,
  total,
  isOpen,
  onClose,
  tenderedAmount = 0,
}: OrderSidebarProps) {
  const { t } = useTranslation();
  const isMobileOverlay = isOpen && window.innerWidth < 1024;

  const { charges, totalCharges, totalTax } = useCharges(items, total);

  const subtotal = total;
  const grandTotal = subtotal + totalCharges;
  const balance = tenderedAmount - grandTotal;


  return (
    <div
      className={`${isMobileOverlay ? " fixed inset-0 z-50 bg-black/40 flex" : ""}`}
      onClick={(e) => {
        if (isMobileOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[480px]  h-screen bg-background flex flex-col border-r border-border shadow-lg ">
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
                modifiers={item.modifiers}
              />
            )))
            : (
              <div className="text-center text-sm text-muted-foreground py-10">
                {t("No items in order")}
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
            {charges.filter(charge => charge.applied).map((charge) => (
              <div
                key={charge.id}
                className="flex justify-between text-xs text-muted-foreground"
              >
                <span>
                  {charge.name} ({charge.percentage}%)
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
            {tenderedAmount > 0 && (
              <>
                <div className="flex justify-between text-xs pt-1">
                  <span>{t("Tendered")}</span>
                  <span>${tenderedAmount.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-bold text-sm pt-1 ${balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  <span>{t("Balance")}</span>
                  <span>${Math.abs(balance).toFixed(2)} {balance < 0 ? `(${t("Due")})` : `(${t("Change")})`}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
