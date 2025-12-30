import { Button } from "@/ui/shadcn/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ClearCartConfirmModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-background p-6 rounded-xl w-[300px] space-y-4">
        <h3 className="font-semibold text-lg">{t("Clear Cart")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Are you sure you want to clear all items from the cart?")}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t("Clear")}
          </Button>
        </div>
      </div>
    </div>
  );
}
