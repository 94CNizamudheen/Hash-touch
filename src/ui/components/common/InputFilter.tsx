import { type FormEvent, useEffect, useRef, useState, useCallback } from "react";
import Keyboard from "./keyboard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "usehooks-ts";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/ui/shadcn/components/ui/input";

interface InputFilterProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputFilter = ({
  className,
  placeholder = "Search Product",
  value: controlledValue,
  onChange,
}: InputFilterProps) => {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const [internalValue, setInternalValue] = useState<string>(
    searchParams.get("search") ?? ""
  );
  const matches = useMediaQuery("(min-width: 1000px)");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLFormElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Memoize the change handler to prevent recreation on every render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  }, [onChange]);

  // Memoize the clear handler
  const handleClear = useCallback(() => {
    const fakeEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(fakeEvent);
  }, [handleChange]);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value === "") params.delete("search");
    else params.set("search", value);
    router(`?${params.toString()}`);
  }, [value, searchParams, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        keyboardRef.current &&
        !keyboardRef.current.contains(e.target as Node)
      ) {
        setShowKeyboard(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Memoize keyboard onChange handler
  const handleKeyboardChange = useCallback((val: string) => {
    const fakeEvent = {
      target: { value: val },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(fakeEvent);
  }, [handleChange]);

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex items-center bg-secondary min-h-[50px] gap-2 px-2 border border-border rounded-lg md:min-w-96",
        className
      )}
      ref={inputRef}
    >
      <Search className="stroke-body-foreground w-5 h-5" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="bg-transparent p-0 border-none shadow-none outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-accent"
        onFocus={() => setShowKeyboard(true)}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 p-1 hover:bg-accent/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 stroke-body-foreground" />
        </button>
      )}
      {matches && showKeyboard && (
        <div
          ref={keyboardRef}
          className="fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-10 bg-background z-50"
        >
          <Keyboard
            onChange={handleKeyboardChange}
            defaultValue={value}
          />
        </div>
      )}
    </form>
  );
};

export default InputFilter;