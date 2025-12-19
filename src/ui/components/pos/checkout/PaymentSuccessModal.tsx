import { Button } from "@/ui/shadcn/components/ui/button"; 
import { useTranslation } from "react-i18next";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  total: number;
  balance: number;
  onPrintReceipt: () => void;
  onNewOrder: () => void;
}

export default function PaymentSuccessModal({
  isOpen,
  total,
  balance,
  onPrintReceipt,
  onNewOrder,
}: PaymentSuccessModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
      <div className="bg-background text-foreground rounded-[var(--radius)] shadow-md border border-border p-6 w-[360px] text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-xl font-bold">
            $
          </div>
        </div>

        <div className="mb-1 text-muted-foreground text-sm">
          {t("paid")}: ${(total + balance).toFixed(2)}
        </div>
        <div className="text-2xl font-semibold text-primary mb-2">
          {t("total")}: ${total.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground mb-6">
          {t("change")}: ${balance > 0 ? balance.toFixed(2) : "0.00"}
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onPrintReceipt}
            className="border border-border text-foreground bg-secondary hover:bg-primary-hover"
          >
            {t("print_receipt")}
          </Button>
          <Button
            onClick={onNewOrder}
            className="bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            {t("new_order")}
          </Button>
        </div>
      </div>
    </div>
  );
}
