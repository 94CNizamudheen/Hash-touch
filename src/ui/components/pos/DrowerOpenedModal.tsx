import { Banknote, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface DrawerOpenedModalProps {
  isOpen: boolean;
  loading: boolean;
  onCompleteOrder: () => void;
}

export default function DrawerOpenedModal({
  isOpen,
  loading,
  onCompleteOrder,
}: DrawerOpenedModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]">
      <div className="bg-background text-foreground border border-border rounded-[var(--radius)] p-6 w-[340px] text-center shadow-md">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-primary/10 flex items-center justify-center rounded-full">
            <Banknote className="w-7 h-7 text-primary" />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2">{t("drawer_opened")}</h2>
        <p className="text-sm text-muted-foreground mb-5">
          {t("collect_cash_message")}
        </p>

        <Button
          onClick={onCompleteOrder}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground rounded-[var(--radius)] h-11"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              {t("processing")}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t("complete_order")}
            </div>
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-3">
          {t("ensure_payment_collected")}
        </p>
      </div>
    </div>
  );
}
