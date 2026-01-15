import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import Keyboard from "@/ui/components/common/keyboard";
import { cn } from "@/lib/utils";

interface GiftCardUserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { firstName: string; lastName: string }) => void;
}

export default function GiftCardUserDetailsModal({
  open,
  onClose,
  onSubmit,
}: GiftCardUserDetailsModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] =
    useState<"firstName" | "lastName">("firstName");

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const matches = useMediaQuery("(min-width: 1000px)");

  // Close keyboard on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !firstNameRef.current?.contains(e.target as Node) &&
        !lastNameRef.current?.contains(e.target as Node) &&
        !keyboardRef.current?.contains(e.target as Node)
      ) {
        setShowKeyboard(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!open) return null;

  const keyboardValue =
    activeField === "firstName" ? firstName : lastName;

  const handleKeyboardChange = (value: string) => {
    if (activeField === "firstName") {
      setFirstName(value);
    } else {
      setLastName(value);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4",
        showKeyboard && "pb-[320px]"
      )}
    >
      <div className="bg-secondary rounded-2xl w-full max-w-[520px] p-8 shadow-2xl">
        <h2 className="text-xl font-bold pb-4 text-gray-900">
          Gift Card User Details
        </h2>

        <div className="space-y-4 mb-6">
          <input
            ref={firstNameRef}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onFocus={() => {
              setActiveField("firstName");
              setShowKeyboard(true);
            }}
          />

          <input
            ref={lastNameRef}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onFocus={() => {
              setActiveField("lastName");
              setShowKeyboard(true);
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-3 border border-border"
          >
            Cancel
          </button>

          <button
            disabled={!firstName || !lastName}
            onClick={() => onSubmit({ firstName, lastName })}
            className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-medium"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Keyboard */}
      {matches && showKeyboard && (
        <div
          ref={keyboardRef}
          className="fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-4 bg-background z-[10000]"
        >
          <Keyboard
            initKeyboard={1}
            defaultValue={keyboardValue}
            onChange={handleKeyboardChange}
          />
        </div>
      )}
    </div>
  );
}
