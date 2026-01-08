// StartShiftModal.tsx
import { useState, useRef, useEffect } from "react";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { useMediaQuery } from "usehooks-ts";
import Keyboard from "@/ui/components/common/keyboard";
import { cn } from "@/lib/utils";

export default function StartShiftModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { startShift } = useWorkShift();

  const [user] = useState("Admin");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const matches = useMediaQuery("(min-width: 1000px)");

  // Close keyboard when clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4",showKeyboard && "pb-[320px]")}>
      <div className="bg-secondary rounded-2xl w-full max-w-[550px] p-8 shadow-2xl">
       

        <h2 className="text-xl font-bold pb-2 text-gray-900">
          Start Shift
        </h2>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div>
            
            <input
              ref={inputRef}
              type="number"
              min="0"
              step="1"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setShowKeyboard(true)}
              placeholder="0"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const amt = Number(amount || 0);
                await startShift(user, amt);
                onClose();
                onSuccess();
              } catch (error) {
                console.error("Failed to start shift:", error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white font-medium rounded-lg py-3 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Starting..." : "Start Shift"}
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
            initKeyboard={4}
            defaultValue={amount}
            onChange={(value) => setAmount(value)}
          />
        </div>
      )}
    </div>
  );
}