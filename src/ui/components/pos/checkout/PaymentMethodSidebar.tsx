import { X } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useTranslation } from "react-i18next";
import { usePaymentMethods } from "@/ui/hooks/usePaymentMethods";

interface PaymentMethodsSidebarProps {
  selectedMethod: string;
  isOpen: boolean;
  onClose: () => void;
  onMethodSelect: (method: string) => void;
  onCancel: () => void;
  isPaymentReady: boolean;
  onPay: () => void;
}

export default function PaymentMethodsSidebar({
  isOpen,
  onClose,
  onMethodSelect,
  isPaymentReady,
  onPay,
}: PaymentMethodsSidebarProps) {
  const { t } = useTranslation();
  const { paymentMethods, loading, error } = usePaymentMethods();

  const isMobileOverlay = isOpen && window.innerWidth < 1024;

  return (
    <div
      className={`${
        isMobileOverlay ? "fixed inset-0 z-50 bg-black/40 flex justify-end safe-area " : ""
      }`}
      onClick={(e) => {
        if (isMobileOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[300px] h-full bg-background flex flex-col border-l rounded shadow-lg relative">


        {/* Close button for mobile */}
        {isMobileOverlay && (
          <div className="p-3 border-b">
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Methods - Equal height distribution */}
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

          {!loading && !error && paymentMethods.map((method) => (
            <Button
              key={method.id}
              disabled={!isPaymentReady}
              onClick={() => {
                onMethodSelect(method.name);
                onPay();
              }}
              className={`flex-1 w-full text-sm font-medium rounded-xl justify-center ${
                isPaymentReady
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary-hover"
              }`}
            >
              {t(method.name)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
