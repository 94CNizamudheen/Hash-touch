import { Input } from "@/ui/shadcn/components/ui/input";
import { useFormContext } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Home, User, Lock, Eye, EyeOff } from "lucide-react";
import Keyboard from "../common/keyboard";
import { FormControl, FormField, FormItem, FormMessage } from "@/ui/shadcn/components/ui/form";

const ICONS = { home: Home, user: User, lock: Lock };

interface TenantInputProps {
  name: string;
  type?: string;
  icon?: keyof typeof ICONS;
  placeholder?: string;
  onShowKeyboard: (v: boolean) => void;
  showPasswordToggle?: boolean;
}

export default function TenantInput({
  name,
  type = "text",
  icon,
  placeholder,
  onShowKeyboard,
  showPasswordToggle,
}: TenantInputProps) {
  const form = useFormContext();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
          <FormItem ref={inputRef} className="w-full">
            <div
              className="
                flex items-center gap-3
                bg-muted
                rounded-xl
                px-4
                h-12
                transition
              "
            >
              {Icon && <Icon className="w-5 h-5 text-primary shrink-0" />}

              <FormControl>
                <Input
                  {...field}
                  type={
                    showPasswordToggle
                      ? showPassword
                        ? "text"
                        : "password"
                      : type
                  }
                  placeholder={placeholder}
                  autoComplete="off"
                  className="
                    border-none
                    text-sm
                    placeholder:text-muted-foreground
                    [&::-ms-reveal]:hidden
                    [&::-ms-clear]:hidden
                    [&::-webkit-credentials-auto-fill-button]:hidden
                    [&::-webkit-textfield-decoration-container]:hidden
                  "
                  onFocus={() => {
                    setShowKeyboard(true);
                    onShowKeyboard(true);
                  }}
                />
              </FormControl>

              {showPasswordToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-muted-foreground shrink-0 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>

            <FormMessage className="text-xs text-red-500 mt-1" />
          </FormItem>
        )}
      />

      {matches && showKeyboard && (
        <div
          ref={keyboardRef}
          className="fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-4 bg-background z-50"
        >
          <Keyboard
            defaultValue={form.getValues(name)}
            onChange={(value) =>
              form.setValue(name, value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
          />
        </div>
      )}
    </>
  );
}
