import { Button } from "@/ui/shadcn/components/ui/button";
import { CiDollar } from "react-icons/ci";
import { useTranslation } from "react-i18next";
import { useSetup } from "@/ui/context/SetupContext";

interface Props {
  total: number;
  balance: number;
  inputValue: string;
  setInputValue: (v: string) => void;
  onQuick: (n: number) => void;
  onKey: (k: string) => void;
  remainingAmount?: number; // NEW: Remaining amount after payments
}

export default function CenterPaymentContent({
  total,
  balance,
  inputValue,
  setInputValue,
  onQuick,
  onKey,
  remainingAmount,
}: Props) {
  const { t, i18n } = useTranslation();
  const { currencySymbol } = useSetup();

  // Use remaining amount if provided, otherwise use total
  const displayTotal = remainingAmount !== undefined ? remainingAmount : total;

  // Generate dynamic quick amounts based on remaining amount
  const generateQuickAmounts = (amount: number): number[] => {
    const roundedAmount = Math.ceil(amount);
    const base = Math.ceil(roundedAmount / 5) * 5;
    return [base, base + 5, base + 10];
  };

  const quickAmounts = generateQuickAmounts(displayTotal);

  // Arabic numerals mapping
  const arabicNumerals: Record<string, string> = {
    "0": "٠",
    "1": "١",
    "2": "٢",
    "3": "٣",
    "4": "٤",
    "5": "٥",
    "6": "٦",
    "7": "٧",
    "8": "٨",
    "9": "٩",
    ".": ".",
    "C": "م",
  };

  const getKeypadDisplay = (key: string): string => {
    if (i18n.language === "ar") {
      return arabicNumerals[key] || key;
    }
    return key === "C" ? t("C") : key;
  };

  return (
    <div className="flex flex-col h-full px-1 ">
      {/* Totals */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline p-3 border-b pb-1">
          <span className="text-lg text-muted-foreground">
            {t("Total")}:
          </span>
          <span className="text-3xl font-bold">
            {currencySymbol} {displayTotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-baseline p-3">
          <span className="text-lg text-muted-foreground">
            {t("Change")}:
          </span>
          <span className="text-3xl font-bold">
            {currencySymbol} {balance >= 0 ? balance.toFixed(2) : "0.00"}
          </span>
        </div>
      </div>

      {/* Tender input */}
      <div className="mb-3">
        <label className="block text-m text-muted-foreground mb-1">
          {t("Type tender here")}
        </label>

        <div className="relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xl">
            <CiDollar size={32} />
          </div>

          <input
            className="w-full h-16 border rounded-lg pl-12 pr-2 py-2 text-3xl font-bold"
            value={inputValue === "0.00" ? "" : inputValue}
            inputMode="decimal"
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*\.?\d*$/.test(v)) {
                setInputValue(v);
              }             
            }}
            onBlur={() => {
              if (!inputValue) return;
              const n = parseFloat(inputValue);
              if (!isNaN(n)) {
                setInputValue(n.toFixed(2));
              }
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button
          onClick={() => setInputValue(displayTotal.toFixed(2))}
          className="bg-blue-600 hover:bg-blue-700 text-white h-12"
        >
          {remainingAmount !== undefined 
            ? `${t("All")} (${currencySymbol}${displayTotal.toFixed(2)})` 
            : t("All")}
        </Button>

        <Button variant="outline" className="h-12">
          {t("split")}
        </Button>

        <Button variant="outline" className="h-12">
          {t("divide")}
        </Button>
      </div>

      {/* Quick amounts */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {quickAmounts.map((a) => (
          <Button
            key={a}
            variant="outline"
            className="h-12"
            onClick={() => onQuick(a)}
          >
            {currencySymbol} {a}.00
          </Button>
        ))}
      </div>

      {/* Keypad */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2 w-full max-w-xl">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "."].map(
            (k) => (
              <button
                key={k}
                onClick={() => onKey(k)}
                className="h-20 rounded-lg text-2xl font-semibold border bg-socondary hover:bg-gray-50 hover:text-black transition active:scale-95"
              >
                {getKeypadDisplay(k)}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}