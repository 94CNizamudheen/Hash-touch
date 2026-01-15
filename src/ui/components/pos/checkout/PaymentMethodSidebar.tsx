import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useTranslation } from "react-i18next";
import { usePaymentMethods } from "@/ui/hooks/usePaymentMethods";
import { calculateSurcharge } from "@/services/local/payment-method.local.service";
import { useSetup } from "@/ui/context/SetupContext";

interface PaymentMethodsSidebarProps {
  selectedMethod: string;
  isOpen: boolean;
  onClose: () => void;
  onMethodSelect: (method: string) => void;
  onCancel?: () => void;
  isPaymentReady: boolean;
  onPay: (paymentMethodName?: string) => void;
  isProcessing?: boolean;
  remainingBalance?: number;
}

export default function PaymentMethodsSidebar({
  isOpen,
  onClose,
  onMethodSelect,
  isPaymentReady,
  onPay,
  isProcessing = false,
  selectedMethod,
  remainingBalance = 0,
}: PaymentMethodsSidebarProps) {
  const { t } = useTranslation();
  const { paymentMethods, loading, error } = usePaymentMethods();
  const { currencyCode } = useSetup();

  const isMobileOverlay = isOpen && window.innerWidth < 1024;

  // 🔹 Desktop surcharge modal state
  const [showSurchargeConfirm, setShowSurchargeConfirm] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<string | null>(null);
  const [surchargeAmount, setSurchargeAmount] = useState(0);

  // 🔹 Handle click on payment method
  const handleMethodClick = (method: any) => {

     const isGiftCard =
    method.code === "Purchase card" ||
    method.code === "Redeem Card";

  if (isGiftCard) {
    onMethodSelect(method.name);
    onPay(method.name); 
    return;
  }
    const surcharge = calculateSurcharge(
      remainingBalance,
      method.processor
    );

    if (surcharge.hasSurcharge) {
      setPendingMethod(method.name);
      setSurchargeAmount(surcharge.surchargeAmount);
      setShowSurchargeConfirm(true);
      return;
    }

    onMethodSelect(method.name);
    onPay(method.name);
  };

  return (
    <div
      className={`${isMobileOverlay
          ? "fixed inset-0 z-50 bg-black/40 flex justify-end safe-area"
          : ""
        }`}
      onClick={(e) => {
        if (isMobileOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[300px] h-full bg-background flex flex-col border-l border-border shadow-lg relative">
        {/* Close button for mobile */}
        {isMobileOverlay && (
          <div className="p-3 border-b">
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Payment methods */}
        <div className="flex-1 flex flex-col p-3 gap-3">
          {loading && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {t("Loading payment methods...")}
            </div>
          )}

          {error && (
            <div className="flex-1 flex items-center justify-center text-destructive">
              {t("Failed to load payment methods")}
            </div>
          )}

          {!loading && !error && paymentMethods.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {t("No payment methods available")}
            </div>
          )}

          {!loading &&
            !error &&
            paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.name;
              const showSpinner = isProcessing && isSelected;

              return (
                <Button
                  key={method.id}
                  disabled={!isPaymentReady || isProcessing}
                  onClick={() => handleMethodClick(method)}
                  className={`flex-1 w-full text-sm font-medium rounded-xl justify-center ${isPaymentReady && !isProcessing
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary-hover"
                    }`}
                >
                  {showSpinner ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("Processing...")}
                    </span>
                  ) : (
                    t(method.name)
                  )}
                </Button>
              );
            })}
        </div>

        {/* 🔹 Desktop surcharge confirmation modal */}
        {showSurchargeConfirm && pendingMethod && (
          <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-secondary rounded-2xl w-full max-w-[550px] p-8 shadow-2xl">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
                {isProcessing ? (
                  <svg
                    className="w-8 h-8 text-yellow-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
                    />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-center mb-3 text-foreground">
                {t("Payment Surcharge")}
              </h2>

              {/* Description */}
              <p className="text-center text-muted-foreground mb-8">
                {t(
                  "This payment method includes an additional surcharge of {{amount}}. Do you want to continue?",
                  {
                    amount: `${currencyCode} ${surchargeAmount.toFixed(2)}`,
                  }
                )}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  disabled={isProcessing}
                  className="flex-1 border-2"
                  onClick={() => {
                    setShowSurchargeConfirm(false);
                    setPendingMethod(null);
                  }}
                >
                  {t("Cancel")}
                </Button>

                <Button
                  disabled={isProcessing}
                  className="flex-1 bg-destructive text-destructive-foreground"
                  onClick={() => {
                    onMethodSelect(pendingMethod);
                    onPay(pendingMethod);
                    setShowSurchargeConfirm(false);
                    setPendingMethod(null);
                  }}
                >
                  {isProcessing ? t("Applying...") : t("Apply Surcharge")}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
