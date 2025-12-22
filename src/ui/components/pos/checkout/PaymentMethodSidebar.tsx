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
      <div className="w-[300px] h-full bg-background flex flex-col border-l border-border shadow-lg safe-area">
      

        {/* Methods */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
            {isMobileOverlay && (
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          )}
          {paymentMethods.map((method) => (
            <Button
              key={method}
              onClick={() => onMethodSelect(method)}
              className={`w-full h-18 text-sm font-medium rounded-xl justify-center ${
                selectedMethod === method
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary-hover"
              }`}
            >
              {t(method)}
            </Button>
          ))}
        </div>
   </div>
    </div>
  );
}
