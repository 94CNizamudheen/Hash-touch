import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCharges } from "@/ui/hooks/useCharges";
import type { CartItem } from "@/types/cart";
import CartCard from "./CartCard";
import { useSetup } from "@/ui/context/SetupContext";
import { useEffect } from "react";

interface OrderSidebarProps {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
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
  const { currencyCode } = useSetup();

  const isMobileOverlay = isOpen && window.innerWidth < 1024;
  const { charges, totalCharges } = useCharges(items, total);

  const subtotal = total;
  const grandTotal = subtotal + totalCharges;
  const balance = tenderedAmount - grandTotal;

  // 🔒 Prevent background scroll on mobile overlay
  useEffect(() => {
    if (isMobileOverlay) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOverlay]);

  return (
    <div
      className={
        isMobileOverlay
          ? "fixed inset-0 z-50 bg-black/40 flex"
          : "relative"
      }
      onClick={(e) => {
        if (isMobileOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="max-w-[500px] h-dvh bg-secondary flex flex-col border-r border-border shadow-lg">
        {/* ───────────────── Header (mobile only) */}
        {isMobileOverlay && (
          <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-background shrink-0">
            <span className="font-semibold text-sm">{t("Current Order")}</span>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ───────────────── Cart Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <CartCard
                key={item.id}
                name={item.name}
                quantity={item.quantity}
                price={item.price}
                modifiers={item.modifiers}
              />
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              {t("No items in order")}
            </div>
          )}
        </div>

        {/* ───────────────── Totals (fixed bottom) */}
        <div className="shrink-0 bg-background border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.06)]">
          <div className="px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t("Subtotal")} ({items.reduce((a, b) => a + b.quantity, 0)})</span>
              <span>{currencyCode} {subtotal.toFixed(2)}</span>
            </div>

            {charges
              .filter((c) => c.applied)
              .map((charge) => (
                <div
                  key={charge.id}
                  className="flex justify-between text-xs text-muted-foreground"
                >
                  <span>
                    {charge.name} ({charge.percentage}%)
                  </span>
                  <span>
                    +{currencyCode} {charge.amount.toFixed(2)}
                  </span>
                </div>
              ))}

            <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
              <span>{t("Grand Total")}</span>
              <span>{currencyCode} {grandTotal.toFixed(2)}</span>
            </div>

            {tenderedAmount > 0 && (
              <>
                <div className="flex justify-between text-xs">
                  <span>{t("Tendered")}</span>
                  <span>{currencyCode} {tenderedAmount.toFixed(2)}</span>
                </div>

                <div
                  className={`flex justify-between font-bold text-sm ${
                    balance >= 0 ? "text-green-600" : "text-destructive"
                  }`}
                >
                  <span>{t("Balance")}</span>
                  <span>
                    {currencyCode} {Math.abs(balance).toFixed(2)}{" "}
                    {balance >= 0 ? `(${t("Change")})` : `(${t("Due")})`}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
