
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/shadcn/components/ui/form";
import { Input } from "@ui/shadcn/components/ui/input";

import { useFormContext } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import Keyboard from "@/ui/components/common/keyboard";
import { useMediaQuery } from "usehooks-ts";
import { useTranslation } from "react-i18next";

 type InputProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  initKeyboard?: number;
  onShowKeyboard?: (value: boolean) => void;
};


const InputWithForm = ({
  name,
  label,
  type = "text",
  initKeyboard,
  onShowKeyboard,
}: InputProps) => {
  const form = useFormContext();
  const { t } = useTranslation();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const matches = useMediaQuery("(min-width: 1000px)");
  const inputRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        keyboardRef.current &&
        !keyboardRef.current.contains(e.target as Node)
      ) {
        setShowKeyboard(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onShowKeyboard && onShowKeyboard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem
            className="w-full text-black flex flex-col gap-1"
            ref={inputRef}
          >
            <FormLabel className="text-accent font-light">{t(label)}</FormLabel>
            <FormControl className="bg-accent-foreground w-full">
              <Input
                type={type}
                {...field}
                autoComplete="off"
                className="text-foreground"
                onFocus={() => {
                  setShowKeyboard(true);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  onShowKeyboard && onShowKeyboard(true);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {matches && showKeyboard && (
        <div
          ref={keyboardRef}
          className={
            "fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-4 bg-navigation-foreground z-50 "
          }
        >
          <Keyboard
            onChange={(value) => form.setValue(name, value)}
            defaultValue={form.getValues(name)}
            initKeyboard={initKeyboard}
          />
        </div>
      )}
    </>
  );
};

export default InputWithForm;
