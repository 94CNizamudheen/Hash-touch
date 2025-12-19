
import { NUMBERS } from "./data";
import { useTranslation } from "react-i18next";
import { getCurrentLanguage } from "../../../lib/current-language";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react"; 
import { Input } from "@/ui/shadcn/components/ui/input";

const EnterPin = ({
  value,
  onChangeValue,
  onSubmit,
  placeholder = "******",
  type = "password",
  label = true,
  className,
  input = true,
}: {
  value: string;
  onChangeValue: (value: string) => void;
  onSubmit: (value: boolean) => void;
  placeholder?: string;
  type?: string;
  label?: boolean;
  className?: string;
  input?: boolean;
}) => {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const formatIP = (val: string) => {
    const cleanedValue = val.replace(/\D/g, "");
    const formattedValue = cleanedValue.match(/.{1,3}/g)?.join(".") || "";
    return formattedValue;
  };

  return (
    <div className={cn("w-full rounded-lg flex flex-col gap-4", className)}>
      {label && (
        <p className="text-gray-800 font-medium text-base">{t("enter_pin")}</p>
      )}

      {input && (
        <Input
          className={cn(
            "w-full h-12 bg-gray-100 border border-gray-300 text-center text-2xl text-gray-900 rounded-md focus:outline-none",
            className
          )}
          type={type}
          placeholder={t(placeholder)}
          readOnly
          value={value}
        />
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {NUMBERS.map((item) => {
          const isEnter = item.value === "Enter";
          const isClear = item.value === "C";

          return (
            <button
              key={item.value}
              disabled={value === "" && isClear}
              onClick={() => {
                if (item.value !== "C" && !isEnter) {
                  if (type === "text") {
                    onChangeValue(formatIP(value + item.value));
                  } else {
                    onChangeValue(value + item.value);
                  }
                } else {
                  if (isClear) {
                    onChangeValue("");
                  } else {
                    onSubmit(true);
                  }
                }
              }}
              className={cn(
                "flex items-center justify-center h-14 rounded-lg text-2xl font-medium transition-all",
                "bg-[#F2F2F2] hover:bg-gray-200 text-gray-900",
                isEnter && "text-gray-900",
                isClear && "text-gray-900"
              )}
            >
              {isEnter ? (
                <LogIn className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                currentLanguage === "ar" ? item.labelAr : item.labelEn
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EnterPin;
