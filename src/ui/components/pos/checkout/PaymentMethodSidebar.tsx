import { X } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button"; 
import { useTranslation } from "react-i18next";

interface PaymentMethodsSidebarProps {
  selectedMethod: string;
  isOpen: boolean;
  onClose: () => void;
  onMethodSelect: (method: string) => void;
  onCancel: () => void;
}

export default function PaymentMethodsSidebar({
  selectedMethod,
  isOpen,
  onClose,
  onMethodSelect,
  onCancel,
}: PaymentMethodsSidebarProps) {
  const { t } = useTranslation();
  const paymentMethods = [
    "Cash",
    "Credit Card",
    "E-Wallet",
    "Bank Transfer",
    "CRM Points",
    "Tabsquare",
    "Quick Dine",
    "Mall Voucher",
    "Stripe",
  ];

  const isMobileOverlay = isOpen && window.innerWidth < 1024;

  return (
    <div
      className={`${
        isMobileOverlay ? "fixed inset-0 z-50 bg-black/40 flex justify-end" : ""
      }`}
      onClick={(e) => {
        if (isMobileOverlay && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-64  bg-background text-foreground flex flex-col h-full border-l border-border shadow-md safe-area rounded-l-2xl">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-semibold text-foreground">{t("payment_method")}</h3>
          {isMobileOverlay && (
            <button
              onClick={onClose}
              className="hover:bg-secondary p-2 rounded-[var(--radius)] transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {paymentMethods.map((method) => (
            <Button
              key={method}
              onClick={() => onMethodSelect(method)}
              className={`w-full justify-start rounded-[var(--radius)] ${
                selectedMethod === method
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary-hover"
              }`}
            >
              {t(method)}
            </Button>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <Button
            onClick={onCancel}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
          >
            {t("cancel_payment")}
          </Button>
        </div>
      </div>
    </div>
  );
}
