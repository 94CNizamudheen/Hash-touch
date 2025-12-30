import { Button } from "@/ui/shadcn/components/ui/button";
import { useTranslation } from "react-i18next";

interface Props {
  total: number;
  balance: number;
  inputValue: string;
  setInputValue: (v: string) => void;
  onPay: () => void;
  onQuick: (n: number) => void;
  onKey: (k: string) => void;
  onPaymentReady: () => void;
}

export default function CenterPaymentContent({
  total,
  balance,
  inputValue,
  setInputValue,
  onQuick,
  onKey,
  onPaymentReady,
}: Props) {
  const { t } = useTranslation();

  // Generate dynamic quick amounts based on total
  const generateQuickAmounts = (total: number): number[] => {
    const roundedTotal = Math.ceil(total);

    // Round up to nearest 5, then add increments
    const base = Math.ceil(roundedTotal / 5) * 5;
    return [base, base + 5, base + 10];
  };

  const quickAmounts = generateQuickAmounts(total);

  return (
    <div className="flex flex-col h-full px-4   ">
      {/* Totals */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline p-3 border-b pb-1">
          <span className="text-lg text-muted-foreground">{t("Total")}:</span>
          <span className="text-3xl font-bold">${total.toFixed(2)}</span>
        </div> 
        <div className="flex justify-between items-baseline p-3">
          <span className="text-lg text-muted-foreground">{t("Balance")}:</span>
          <span className="text-3xl font-bold">
            ${balance >= 0 ? balance.toFixed(2) : "0.00"}
          </span>
        </div>
      </div>
      

      {/* Tender */}
      <div className="mb-3">
        <label className="block text-m text-muted-foreground mb-1">
          {t("Type tender here")}
        </label>
        <div className="relative ">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
            $
          </span>
          <input
            className="w-full h-16 border rounded-lg pl-8 pr-3 py-2 text-3xl font-bold"
            value={inputValue}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*\.?\d*$/.test(v)) setInputValue(v);
            }}
            onBlur={() => {
              const n = parseFloat(inputValue);
              if (!isNaN(n)) setInputValue(n.toFixed(2));
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mb-3 ">
        <Button
          onClick={() => {
            setInputValue(total.toFixed(2));
            onPaymentReady();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white h-12 "
        >
          {t("All")}
        </Button>
        <Button variant="outline" className="h-12" >
          {t("split")}
        </Button>
        <Button variant="outline" className="h-12" >
          {t("divide")}
        </Button>
      </div>

      {/* Quick */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {quickAmounts.map((a) => (
          <Button
            key={a}
            variant="outline"
            className="h-12"
            onClick={() => {
              onQuick(a);
              onPaymentReady();
            }}
          >
            $ {a}.00
          </Button>
        ))}
      </div>

      {/* Keypad */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2 w-full max-w-xl">
          {["1","2","3","4","5","6","7","8","9","C","0","."].map((k) => (
            <button
              key={k}
              onClick={() => onKey(k)}
              className="h-20 rounded-lg text-2xl font-semibold border bg-white hover:bg-gray-50 transition active:scale-95"
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}