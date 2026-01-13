import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCharges } from "@/ui/hooks/useCharges";
import type { CartItem } from "@/types/cart";
import CartCard from "./CartCard";
import { useSetup } from "@/ui/context/SetupContext";
import { useEffect, useState } from "react";
import PaymentEntriesModal from "./PaymentEntriesModal";

export interface PaymentEntry {
  id: string;
  paymentMethodId: string;
  paymentMethodName: string;
  amount: number;
  timestamp: string;
}

interface OrderSidebarProps {
  items: CartItem[];
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  payments?: PaymentEntry[];
  onRemovePayment?: (id: string) => void;
  onClearAllPayments?: () => void;
}

export default function OrderSidebar({
  items,
  total,
  isOpen,
  onClose,
  payments = [],
  onRemovePayment,
  onClearAllPayments,
}: OrderSidebarProps) {
  const { t } = useTranslation();
  const { currencyCode } = useSetup();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const isMobileOverlay = isOpen && window.innerWidth < 1024;
  const { charges, totalCharges } = useCharges(items, total);

  const subtotal = total;
  const grandTotal = Math.round((subtotal + totalCharges) * 100) / 100;

  // Calculate total paid from all payment entries (round to avoid floating point issues)
  const totalPaid = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
  const remainingBalance = Math.round((grandTotal - totalPaid) * 100) / 100;

  // 🔒 Prevent background scroll on mobile overlay
  useEffect(() => {
    if (isMobileOverlay) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOverlay]);

  const isPaymentsClickable = payments.length > 0;

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
      <aside className="max-w-[500px] h-dvh bg-secondary flex flex-col border-r border-border shadow-lg safe-area ">
        {/* ─────────────── Header (mobile only) */}
        {isMobileOverlay && (
          <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-background shrink-0">
            <span className="font-semibold text-sm">{t("Current Order")}</span>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ─────────────── Cart Items */}
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

        {/* ─────────────── Totals (fixed bottom) */}
        <div className="shrink-0 bg-background border-t border-border cursor-pointer"
          onClick={() => {
            if (isPaymentsClickable) setShowPaymentModal(true);
          }}
        >

          <div className="px-4 py-3 text-sm space-y-2">

            {/* Subtotal */}
            <div className="flex justify-between">
              <span>
                {t("Subtotal")} ({items.reduce((a, b) => a + b.quantity, 0)})
              </span>
              <span>{currencyCode} {subtotal.toFixed(2)}</span>
              
            </div>

            {/* GST / Charges */}
            {charges
              .filter((c) => c.applied)
              .map((charge) => (
                <div
                  key={charge.id}
                  className="flex justify-between text-muted-foreground"
                >
                  <span>{charge.name}</span>
                  <span>+{currencyCode} {charge.amount.toFixed(2)}</span>
                </div>
              ))}

            <hr className="border-border my-2" />

            {/* Grand Total */}
            <div className="flex justify-between font-semibold text-base">
              <span>{t("Grand Total")}</span>
              <span>{currencyCode} {grandTotal.toFixed(2)}</span>
            </div>

            {/* Payment Section */}
            {payments.length > 0 && (
              <>
                <hr className="border-border my-2" />

                {/* Clickable Payment Total */}
                <div
                  className="w-full flex justify-between text-left hover:bg-muted/40 px-1 py-1 rounded-md transition-colors"
                >
                  <span className="font-medium">{t("Payment Total")}</span>
                  <span className="font-medium text-green-600">
                    +{currencyCode} {totalPaid.toFixed(2)}
                  </span>
                </div>

                {/* Payment method breakdown */}
                <div className="space-y-1 mt-1">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between text-muted-foreground text-sm"
                    >
                      <span>{p.paymentMethodName}</span>
                      <span>{currencyCode} {p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-border my-2" />

                {/* Balance */}
                <div className="flex justify-between font-semibold text-blue-600 text-base">
                  <span>{t("Balance")}</span>
                  <span>
                    {currencyCode} {remainingBalance.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

      </aside>

      {/* Payment Entries Modal */}
      {onRemovePayment && onClearAllPayments && (
        <PaymentEntriesModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          payments={payments}
          onRemovePayment={onRemovePayment}
          onClearAllPayments={onClearAllPayments}
          totalPaid={totalPaid}
          grandTotal={grandTotal}
        />
      )}
    </div>
  );
}