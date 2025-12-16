
import { deviceService, type DeviceRole } from "@/services/local/device.local.service";
import { useState } from "react";


const ROLES: { key: DeviceRole; label: string }[] = [
  { key: "POS", label: "Point of Sale" },
  { key: "KIOSK", label: "Self-Ordering Kiosk" },
  { key: "KDS", label: "Kitchen Display System" },
  { key: "QUEUE", label: "Queue Display" },
];

interface Props {
  onRoleSelected: (role: DeviceRole) => void;
}

export default function Home({ onRoleSelected }: Props) {
  const [selectedRole, setSelectedRole] = useState<DeviceRole | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (role: DeviceRole) => {
    setSelectedRole(role);
  };

  const createAndContinue = async () => {
    if (!selectedRole) return;
    setBusy(true);
    try {
      const label = ROLES.find((r) => r.key === selectedRole)?.label || selectedRole;
      const device = await deviceService.registerDevices({
        name: `${label} Device`,
        role: selectedRole,
      });
      onRoleSelected(device.role as DeviceRole);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("role select error:", err);
      setError(err.message || "Failed to save device profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-300 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold mb-2">Welcome to HashOne</h1>
          <p className="text-sm text-zinc-600 mb-4">Select the device role for this installation.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => handleRoleSelect(r.key)}
                className={`p-4 rounded-lg border hover:shadow-sm text-left transition ${
                  selectedRole === r.key ? "border-blue-600 bg-blue-50" : "border-zinc-200 bg-white"
                }`}
              >
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-xs text-zinc-500 mt-1">{r.key}</div>
              </button>
            ))}
          </div>

          <button
            onClick={createAndContinue}
            disabled={busy || !selectedRole}
            className="w-full px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save & Continue"}
          </button>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
