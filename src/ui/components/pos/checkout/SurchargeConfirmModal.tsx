import { Button } from "@/ui/shadcn/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SurchargeConfirmModalProps {
  surchargeAmount: number;
  currencyCode: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function SurchargeConfirmModal({
  surchargeAmount,
  currencyCode,
  onConfirm,
  onClose,
}: SurchargeConfirmModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-secondary rounded-2xl w-full max-w-[550px] p-8 shadow-2xl">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
          {isLoading ? (
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
        <h2 className="text-xl font-bold text-center mb-3 text-gray-900">
          {t("Payment Surcharge")}
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-8">
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
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-2"
          >
            {t("Cancel")}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-destructive"
          >
            {isLoading ? t("Applying...") : t("Apply Surcharge")}
          </Button>
        </div>
      </div>
    </div>
  );
}
