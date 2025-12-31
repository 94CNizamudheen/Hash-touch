import { Button } from "@/ui/shadcn/components/ui/button";
import { useTranslation } from "react-i18next";
import {  FilePlus2 } from "lucide-react";
import { TiPrinter } from "react-icons/ti";
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg mx-4">
        {/* Icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
            <div className="w-14 h-14 rounded-full border-4 border-green-600 flex items-center justify-center">
              <span className="text-green-600 text-2xl font-bold">$</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-black font-medium text-2xl">
            {t("Payment Success")}
          </p>

          <p className="text-black font-medium text-4xl">
            {t("Total")}:{" "}
            <span className="text-green-600">
              S$ {total.toFixed(2)}
            </span>
          </p>

          <p className="text-gray-600 text-xl">
            {t("Change")} S$ {balance > 0 ? balance.toFixed(2) : "0.00"}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 w-full">
          <Button
            variant="outline"
            onClick={onPrintReceipt}
            className="flex-1 h-12 flex items-center justify-center gap-3 border-2 border-gray-400 text-black"
          >
            <TiPrinter  className="w-5 h-5" />
            {t("Print Receipts")}
          </Button>

          <Button
            onClick={onNewOrder}
            className="flex-1 h-12 flex items-center justify-center gap-3 bg-blue-600 text-white hover:bg-blue-700"
          >
            <FilePlus2 className="w-5 h-5" />
            {t("New Order")}
          </Button>
        </div>
      </div>
    </div>
  );
}
