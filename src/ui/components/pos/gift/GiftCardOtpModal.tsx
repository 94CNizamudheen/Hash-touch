import { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useMediaQuery } from "usehooks-ts";
import Keyboard from "@/ui/components/common/keyboard";
import { cn } from "@/lib/utils";

interface GiftCardOtpModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;

  onSendOtp: (username: string) => Promise<void>;
  onVerifyOtp: (data: {
    username: string;
    otp: string;
  }) => Promise<void>;
}

export default function GiftCardOtpModal({
  open,
  loading = false,
  onClose,
  onSendOtp,
  onVerifyOtp,
}: GiftCardOtpModalProps) {
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4",
        showKeyboard && "pb-[320px]"
      )}
    >
      <div className="bg-secondary rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <h2 className="text-lg font-bold text-center">
          Gift Card Verification
        </h2>

        {/* Username */}
        <input
          ref={inputRef}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Email or phone"
          value={username}
          disabled={otpSent || loading}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => setShowKeyboard(true)}
        />

        {/* OTP input */}
        {otpSent && (
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter OTP"
            value={otp}
            disabled={loading}
            onChange={(e) => setOtp(e.target.value)}
            onFocus={() => setShowKeyboard(true)}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>

          {!otpSent ? (
            <Button
              className="flex-1"
              disabled={loading || !username}
              onClick={async () => {
                await onSendOtp(username);
                setOtpSent(true);
              }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          ) : (
            <Button
              className="flex-1"
              disabled={loading || !otp}
              onClick={() =>
                onVerifyOtp({
                  username,
                  otp,
                })
              }
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>
          )}
        </div>
      </div>

      {/* On-screen Keyboard (POS / Desktop) */}
      {matches && showKeyboard && (
        <div
          ref={keyboardRef}
          className="fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-4 bg-background z-[10000]"
        >
          <Keyboard
            initKeyboard={1}
            defaultValue={otpSent ? otp : username}
            onChange={(value) =>
              otpSent ? setOtp(value) : setUsername(value)
            }
          />
        </div>
      )}
    </div>
  );
}
