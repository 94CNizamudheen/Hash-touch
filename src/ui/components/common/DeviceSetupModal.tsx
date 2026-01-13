import { useEffect, useRef, useState } from "react";
import { Input } from "@/ui/shadcn/components/ui/input";
import { Button } from "@/ui/shadcn/components/ui/button";
import Keyboard from "./keyboard";
import { commonDataService } from "@/services/data/common.data.service";
import type { DeviceRole } from "@/types/app-state";

interface Props {
  open: boolean;
  role: DeviceRole;
  domain: string;
  token: string;
  onSuccess: (setupCode: string, setup: any) => void;
  onClose: () => void;
}

export default function DeviceSetupModal({
  open,
  role,
  domain,
  token,
  onSuccess,
  onClose,
}: Props) {
  const [code, setCode] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);

  /* close keyboard on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !keyboardRef.current?.contains(e.target as Node)
      ) {
        setShowKeyboard(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Setup code is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const setups = await commonDataService.getSetups(
        domain,
        token,
        code.trim(),
        role
      );

      if (!setups?.length) throw new Error("Invalid setup code");

      onSuccess(code.trim(), setups[0]);
      setShowKeyboard(false);
    } catch (e: any) {
      setError(e.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className={`w-full max-w-lg ${showKeyboard ? "pb-[280px]" : ""}`}>
        <div
          className={`
          bg-background w-full max-w-md rounded-xl p-6
          transition-all
          
        `}
        >
          <h2 className="text-lg font-semibold mb-3">
            Configure {role} Device
          </h2>

          {/* ✅ Plain Input */}
          <Input
            ref={inputRef}
            value={code}
            placeholder="Enter setup code"
            onChange={(e) => setCode(e.target.value)}
            onFocus={() => setShowKeyboard(true)}
            className="mb-2"
          />

          {error && (
            <p className="text-sm text-destructive mb-2">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Validating..." : "Continue"}
            </Button>
          </div>

          {/* ✅ Custom Keyboard */}
          {showKeyboard && (
            <div
              ref={keyboardRef}
              className="fixed bottom-0 left-0 w-full min-h-[300px] px-44 py-4 bg-background z-50"
            >
              <Keyboard
                defaultValue={code}
                initKeyboard={1} // numeric (optional)
                onChange={(value) => setCode(value)}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
