import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useSetup } from "@/ui/context/SetupContext";
import type { PaymentEntry } from "./OrderSidebar";
import { SwipeablePaymentItem } from "./SwipeablePaymentItem";

interface PaymentEntriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentEntry[];
  onRemovePayment: (id: string) => void;
  onClearAllPayments: () => void;
  totalPaid: number;
  grandTotal: number;
}

export default function PaymentEntriesModal({
  isOpen,
  onClose,
  payments,
  onRemovePayment,
  onClearAllPayments,
}: PaymentEntriesModalProps) {
  const { t } = useTranslation();
  const { currencyCode } = useSetup();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  /* Close modal automatically when no payments left */
  useEffect(() => {
    if (isOpen && payments.length === 0) {
      onClose();
    }
  }, [isOpen, payments.length, onClose]);

  if (!isOpen) return null;

  const handleClearAll = () => {
    setShowConfirmClear(true);
  };

  const confirmClearAll = () => {
    onClearAllPayments();
    setShowConfirmClear(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-secondary rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ===== Header ===== */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {t("Payment Details")}
          </h2>
        </div>

        {/* ===== Payment List ===== */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          {payments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("No payments added")}
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground mb-3 text-center">
                {t("Swipe left to remove a payment")}
              </div>

              {payments.map((payment) => (
                <SwipeablePaymentItem
                  key={payment.id}
                  payment={payment}
                  onRemove={onRemovePayment}
                  currencyCode={currencyCode}
                />
              ))}
            </>
          )}
        </div>

        {/* ===== Footer Actions ===== */}
        {payments.length > 0 && (
          <div className="flex gap-4 p-4 border-t border-border rtl:flex-row-reverse">
            <Button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-background text-foreground hover:bg-muted/80"
            >
              {t("Cancel")}
            </Button>

            <Button
              onClick={handleClearAll}
              className="flex-1 h-12 rounded-xl bg-primary text-background hover:bg-primary-hover"
            >
              {t("Clear")}
            </Button>
          </div>
        )}

        {/* ===== Confirm Clear Modal ===== */}
        {showConfirmClear && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">

              {/* Icon */}
              <div className="flex justify-center mt-6">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>
              </div>

              {/* Content */}
              <div className="px-6 mt-4 text-center">
                <h3 className="text-lg font-semibold">
                  {t("Payments")}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Are you sure you want to delete all partial payments?")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 px-6 py-6 rtl:flex-row-reverse">
                <Button
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1 h-12 rounded-xl bg-destructive text-white hover:bg-red-600"
                >
                  {t("Cancel")}
                </Button>

                <Button
                  onClick={confirmClearAll}
                  className="flex-1 h-12 rounded-xl bg-primary text-background hover:bg-primary-hover"
                >
                  {t("Ok")}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
