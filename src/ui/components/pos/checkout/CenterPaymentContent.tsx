
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
}

export default function CenterPaymentContent({
  total,
  balance,
  inputValue,
  setInputValue,
  onPay,
  onQuick,
  onKey,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full gap-4">
      {/* Totals */}
      <div className="bg-muted p-4 rounded-xl border">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{t("total")}</div>
            <div className="text-3xl font-bold text-primary">
              ${total.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t("balance")}</div>
            <div className="text-3xl font-bold text-accent">
              ${balance >= 0 ? balance.toFixed(2) : "0.00"}
            </div>
          </div>
        </div>
      </div>

      {/* Tender */}
      <div>
        <label className="block text-sm mb-1">{t("tender_amount")}</label>
        <input
          className="w-full border rounded-xl p-3 text-2xl font-semibold"
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

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button onClick={onPay} className="bg-primary text-primary-foreground">
          {t("pay")}
        </Button>
        <Button variant="outline" disabled>{t("split")}</Button>
        <Button variant="outline" disabled>{t("divide")}</Button>
      </div>

      {/* Quick */}
      <div className="grid grid-cols-3 gap-2">
        {[10, 25, 50].map((a) => (
          <Button key={a} variant="outline" onClick={() => onQuick(a)}>
            ${a}
          </Button>
        ))}
      </div>

      {/* Keypad */}
      <div className="flex-1 flex justify-center">
        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9","C","0","."].map((k) => (
            <button
              key={k}
              onClick={() => onKey(k)}
              className={`w-24  rounded-xl text-xl font-bold border bg-muted hover:bg-primary-hover transition ${
                k === "C" ? "bg-destructive text-destructive-foreground hover:bg-destructive/80" : ""
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
