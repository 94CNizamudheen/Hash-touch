import { Button } from "@/ui/shadcn/components/ui/button";
import { Input } from "@/ui/shadcn/components/ui/input";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { Mail, Printer, Plus, Phone, ChevronDown } from "lucide-react";
import Keyboard from "@/ui/components/common/keyboard";
import { useSetup } from "@/ui/context/SetupContext";

const COUNTRY_CODES = [
  { code: "65", label: "Singapore", flag: "🇸🇬" },
  { code: "91", label: "India", flag: "🇮🇳" },
  { code: "971", label: "UAE", flag: "🇦🇪" },
  { code: "966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "1", label: "USA", flag: "🇺🇸" },
  { code: "84", label: "Vietnam", flag: "🇻🇳" },
  { code: "62", label: "Indonesia", flag: "🇮🇩" },
];

interface PaymentSuccessModalProps {
  isOpen: boolean;
  total: number;
  balance: number;
  onPrintReceipt: () => void;
  onNewOrder: () => void;
  onSendReceipt: (payload: { email?: string; phone?: string }) => void;
}

export default function PaymentSuccessModal({
  isOpen,
  total,
  balance,
  onPrintReceipt,
  onNewOrder,
  onSendReceipt,
}: PaymentSuccessModalProps) {
  const { t } = useTranslation();
  const { currencyCode } = useSetup();

  const [mode, setMode] = useState<"email" | "phone" | null>(null);
  const [value, setValue] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [countryCode, setCountryCode] = useState("91"); 
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const isMobile = window.innerWidth < 640;

  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !keyboardRef.current?.contains(e.target as Node) &&
        !countryDropdownRef.current?.contains(e.target as Node)
      ) {
        setShowKeyboard(false);
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!value) return;

    if (mode === "phone") {
      // Combine country code + phone number without + sign
      const fullPhone = `${countryCode}${value}`;
      onSendReceipt({ phone: fullPhone });
    } else {
      onSendReceipt({ email: value });
    }

    setMode(null);
    setValue("");
    setShowKeyboard(false);
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-2 sm:p-4 safe-area">
      <div
        className={`w-full max-w-2xl ${
          showKeyboard ? "pb-[220px] sm:pb-[280px]" : ""
        }`}
      >
        <div className="relative w-full rounded-lg bg-white p-6 sm:p-8 shadow-lg">
          {/* Success Icon */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow">
              <div className="w-14 h-14 rounded-full border-4 border-green-600 flex items-center justify-center">
                <span className="text-green-600 text-2xl font-bold">✓</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-lg sm:text-xl font-medium">
              {t("Payment Success")}
            </p>

            <p className="text-2xl sm:text-3xl font-semibold">
              {t("Total")}:{" "}
              <span className="text-green-600">
                {currencyCode} {total.toFixed(2)}
              </span>
            </p>

            <p className="text-gray-500 text-sm sm:text-base">
              {t("Change")}: {currencyCode}{" "}
              {balance > 0 ? balance.toFixed(2) : "0.00"}
            </p>
          </div>

          {/* BODY */}
          {!mode ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-12 sm:h-14 gap-2"
                onClick={() => setMode("email")}
              >
                <Mail className="w-5 h-5" />
                {t("Email Receipts")}
              </Button>

              <Button
                variant="outline"
                className="h-12 sm:h-14 gap-2"
                onClick={() => {
                  setMode("phone");
                  setValue("");
                  setShowCountryDropdown(true);
                }}
              >
                <Phone className="w-5 h-5" />
                {t("Phone Receipts")}
              </Button>

              <Button
                variant="outline"
                className="h-12 sm:h-14 gap-2"
                onClick={onPrintReceipt}
              >
                <Printer className="w-5 h-5" />
                {t("Print Receipts")}
              </Button>

              <Button
                className="h-12 sm:h-14 gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={onNewOrder}
              >
                <Plus className="w-5 h-5" />
                {t("New Order")}
              </Button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {/* COUNTRY CODE DROPDOWN - Phone Only */}
              {mode === "phone" && (
                <div ref={countryDropdownRef} className="relative">
                  <button
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm font-medium flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{selectedCountry?.flag}</span>
                      <div className="text-left">
                        <p className="text-xs text-gray-500">
                          {t("Country")}
                        </p>
                        <p className="font-semibold">
                          {selectedCountry?.label} ({selectedCountry?.code})
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showCountryDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-[10000] max-h-64 overflow-y-auto">
                      {COUNTRY_CODES.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setCountryCode(country.code);
                            setShowCountryDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 border-b last:border-b-0 ${
                            countryCode === country.code
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <span className="text-xl">{country.flag}</span>
                          <div className="flex-1">
                            <p className="font-medium">
                              {country.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {country.code}
                            </p>
                          </div>
                          {countryCode === country.code && (
                            <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Phone Number or Email Input */}
              <div className="flex items-center gap-3">
                {mode === "phone" && !isMobile && (
                  <div className="flex-shrink-0 px-3 py-2.5 bg-gray-100 rounded-lg font-semibold min-w-24 text-center">
                    {countryCode}
                  </div>
                )}
                <Input
                  ref={inputRef}
                  type={mode === "email" ? "email" : "tel"}
                  placeholder={
                    mode === "email"
                      ? "customer@example.com"
                      : "Enter phone number"
                  }
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={() => {
                    setShowKeyboard(true);
                    setShowCountryDropdown(false);
                  }}
                  className="flex-1 text-base sm:text-lg"
                />
              </div>

              {/* Display Format Preview */}
              {mode === "phone" && value && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-900">
                  <p className="text-xs text-blue-600 mb-1">
                    {t("Will send to")}:
                  </p>
                  <p className="font-mono font-semibold text-lg">
                    {countryCode}{value}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => {
                    setMode(null);
                    setValue("");
                    setShowKeyboard(false);
                    setShowCountryDropdown(false);
                  }}
                >
                  {t("Cancel")}
                </Button>

                <Button
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                  disabled={!value}
                  onClick={handleSend}
                >
                  {mode === "email" ? t("Send Email") : t("Send SMS")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard */}
        {showKeyboard && (
          <div
            ref={keyboardRef}
            className="fixed bottom-0 left-0 w-full
                       min-h-[240px] sm:min-h-[300px]
                       px-2 sm:px-12 md:px-44
                       py-4 bg-white z-50"
          >
            <Keyboard defaultValue={value} onChange={(v) => setValue(v)} />
          </div>
        )}
      </div>
    </div>
  );
}