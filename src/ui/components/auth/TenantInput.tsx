
import { Input } from "@/ui/shadcn/components/ui/input";
import { useFormContext } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Home, User, Lock } from "lucide-react";
import Keyboard from "../common/keyboard";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/shadcn/components/ui/form";

const ICONS = { home: Home, user: User, lock: Lock };

interface TenantInputProps {
  name: string;
  label: string;
  type?: string;
  icon?: keyof typeof ICONS;
  placeholder?: string;
  onShowKeyboard: (v: boolean) => void;
}

export default function TenantInput({
  name,
  label,
  type = "text",
  icon,
  placeholder,
  onShowKeyboard,
}: TenantInputProps) {
  const form = useFormContext();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const matches = useMediaQuery("(min-width: 1000px)");
  const Icon = icon ? ICONS[icon] : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        keyboardRef.current &&
        !keyboardRef.current.contains(e.target as Node)
      ) {
        setShowKeyboard(false);
        onShowKeyboard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onShowKeyboard]);

  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem ref={inputRef} className="w-full flex flex-col gap-1">
            <FormLabel className="text-sm font-light text-muted-foreground">
              {label}
            </FormLabel>

            {/* Input Wrapper */}
            <div className="relative flex items-center bg-gray-200 rounded-xl border border-transparent focus-within:border-primary px-3 py-2 transition">
              {Icon && (
                <Icon
                  className="text-primary w-5 h-5 mr-2 shrink-0"
                  strokeWidth={2}
                />
              )}
              <FormControl>
                <Input
                  type={type}
                  {...field}
                  value={field.value || ""}
                  placeholder={placeholder}
                  autoComplete="off"
                  className="border-none bg-transparent focus-visible:ring-0 text-sm placeholder:text-zinc-500 dark:text-black"
                  onFocus={() => {
                    setShowKeyboard(true);
                    onShowKeyboard(true);
                  }}
                />
              </FormControl>
            </div>

            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* On-screen Keyboard */}
      {matches && showKeyboard && (
        <div
          ref={keyboardRef}
          className="fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-4 bg-navigation-foreground z-50"
        >
          <Keyboard
            onChange={(value) => form.setValue(name, value,{
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            })}
            defaultValue={form.getValues(name)}
          />
        </div>
      )}
    </>
  );
}
