import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!domain || !token) {
      setError("Tenant is not initialized. Please login again.");
      return;
    }

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

      if (!Array.isArray(setups) || setups.length === 0) {
        throw new Error("Invalid setup code");
      }

      const setup = setups[0];

      onSuccess(code.trim(), setup);
    } catch (e: any) {
      console.error("[DeviceSetupModal] setup fetch error:", e);
      setError(
        e?.message ||
        "Failed to validate setup code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-2">
          Configure {role} Device
        </h2>

        <p className="text-sm text-zinc-600 mb-4">
          Enter the setup code provided by your backend.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter setup code"
          className="w-full border rounded-md px-3 py-2 mb-3"
          disabled={loading}
        />

        {error && (
          <div className="text-sm text-red-600 mb-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-60"
          >
            {loading ? "Validating..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
