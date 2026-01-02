
import { deviceService, type DeviceRole } from "@/services/local/device.local.service";
import { useState, useEffect } from "react";
import { appStateApi } from "@/services/tauri/appState";


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
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    // Load saved server URL
    const loadServerUrl = async () => {
      try {
        const [_, url] = await appStateApi.getWsSettings();
        // Load any previously saved URL
        if (url) {
          setServerUrl(url);
        }
      } catch (error) {
        console.error("Failed to load server URL:", error);
      }
    };
    loadServerUrl();
  }, []);

  const handleRoleSelect = (role: DeviceRole) => {
    setSelectedRole(role);
  };

  const createAndContinue = async () => {
    if (!selectedRole) return;

    // For non-POS devices, save the server URL
    if (selectedRole !== "POS") {
      if (!serverUrl.trim()) {
        setError("Please enter the POS server URL");
        return;
      }
      try {
        await appStateApi.setWsServerUrl(serverUrl);
      } catch (err) {
        console.error("Failed to save server URL:", err);
        setError("Failed to save server URL");
        return;
      }
    }

    setBusy(true);
    try {
      const label = ROLES.find((r) => r.key === selectedRole)?.label || selectedRole;
      const device = await deviceService.registerDevices({
        name: `${label} Device`,
        role: selectedRole,
      });
      console.log('device',device)
      onRoleSelected(device.role as DeviceRole);
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

          {/* Server URL input for non-POS devices */}
          {selectedRole && selectedRole !== "POS" && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium mb-2 text-zinc-700">
                POS Server Address
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="ws://192.168.1.100:9001"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm font-mono"
              />
              <p className="text-xs text-zinc-600 mt-2">
                Enter the IP address of the POS device (e.g., ws://192.168.1.100:9001)
              </p>
            </div>
          )}

          {/* Info for POS device */}
          {selectedRole === "POS" && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ This device will run as the WebSocket server. Other devices (KDS, Queue) will connect to this device.
              </p>
            </div>
          )}

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
