
import { Input } from "@/ui/shadcn/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import Keyboard from "./keyboard"; 
import { Label } from "@radix-ui/react-label"; 

const InputWithKeyboard = ({
  placeholder,
  onShowKeyboard,
  label,
}: {
  placeholder?: string;
  label?: string;
  onShowKeyboard?: (value: boolean) => void;
}) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const matches = useMediaQuery("(min-width: 1000px)");
  const inputRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<string>("");
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
    <div className="flex flex-col gap-2 w-full" ref={inputRef}>
      {label && <Label>{label}</Label>}
      <Input
        onFocus={() => {
          setShowKeyboard(true);
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          onShowKeyboard && onShowKeyboard(true);
        }}
        placeholder={placeholder}
      />
      {matches && showKeyboard && (
        <div
          ref={keyboardRef}
          className={
            "fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-10 bg-navigation-foreground z-50"
          }
        >
          <Keyboard
            onChange={(value) => setValue(value)}
            defaultValue={value}
          />
        </div>
      )}
    </div>
  );
};

export default InputWithKeyboard;
