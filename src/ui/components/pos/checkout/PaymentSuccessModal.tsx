import { Button } from "@/ui/shadcn/components/ui/button";
import { Input } from "@/ui/shadcn/components/ui/input";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Mail, Printer, Plus } from "lucide-react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  total: number;
  balance: number;
  onPrintReceipt: () => void;
  onNewOrder: () => void;
  onSendEmail: (email: string) => void;
}

export default function PaymentSuccessModal({
  isOpen,
  total,
  balance,
  onPrintReceipt,
  onNewOrder,
  onSendEmail,
}: PaymentSuccessModalProps) {
  const { t } = useTranslation();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">

        {/* Success Icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
            <div className="w-14 h-14 rounded-full border-4 border-green-600 flex items-center justify-center">
              <span className="text-green-600 text-2xl font-bold">$</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-xl font-medium">{t("Payment Success")}</p>

          <p className="text-3xl font-semibold">
            {t("Total")}: <span className="text-green-600">S$ {total.toFixed(2)}</span>
          </p>

          <p className="text-gray-500">
            {t("Change")} S$ {balance > 0 ? balance.toFixed(2) : "0.00"}
          </p>
        </div>

        {/* BODY */}
        {!showEmailInput ? (
          /* ================= DEFAULT ACTIONS ================= */
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={() => setShowEmailInput(true)}
            >
              <Mail className="w-5 h-5" />
              {t("Email Receipts")}
            </Button>

            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={onPrintReceipt}
            >
              <Printer className="w-5 h-5" />
              {t("Print Receipts")}
            </Button>

            <Button
              className="col-span-2 h-12 bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={onNewOrder}
            >
              <Plus className="w-5 h-5" />
              {t("New Order")}
            </Button>
          </div>
        ) : (
          /* ================= EMAIL INPUT VIEW ================= */
          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-600">
              {t("Send receipt to email")}
            </p>

            <Input
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmailInput(false);
                  setEmail("");
                }}
              >
                {t("Cancel")}
              </Button>

              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  onSendEmail(email);
                  setShowEmailInput(false);
                  setEmail("");
                }}
                disabled={!email}
              >
                {t("Send Email")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
