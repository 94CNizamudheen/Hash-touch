import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type DeviceRole } from "@/services/local/device.local.service";

const ROLES: { key: DeviceRole; label: string; }[] = [
  {
    key: "POS",
    label: "Point of Sale",
  },
  // {
  //   key: "KIOSK",
  //   label: "Self-Ordering Kiosk",
  // },
  {
    key: "KDS",
    label: "Kitchen Display System",
  },
  {
    key: "QUEUE",
    label: "Queue Display",
  },
];

interface Props {
  onRoleSelected: (role: DeviceRole) => Promise<void>;
}

export default function Home({
  onRoleSelected,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<DeviceRole | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuredRoles, setConfiguredRoles] = useState<Set<DeviceRole>>(new Set());

  // Load configured roles on mount
  useEffect(() => {
    loadConfiguredRoles();
  }, []);

  const loadConfiguredRoles = async () => {
    try {
      const roles = await invoke<string[]>("get_configured_roles");
      setConfiguredRoles(new Set(roles as DeviceRole[]));
      console.log("Configured roles:", roles);
    } catch (err) {
      console.error("Failed to load configured roles:", err);
    }
  };

  const handleRoleSelect = (role: DeviceRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setBusy(true);
    setError(null);

    try {
      await onRoleSelected(selectedRole);

      // Add to configured roles
      setConfiguredRoles(prev => new Set(prev).add(selectedRole));

      console.log(`✅ ${selectedRole} configured successfully`);

    } catch (err: any) {
      console.error("Role setup failed:", err);
      setError(err.message || "Failed to complete setup");
    } finally {
      setBusy(false);
      setSelectedRole(null);
    }
  };

  const handleOpenRole = async (role: DeviceRole) => {
    try {
      setBusy(true);
      setError(null);
      await invoke("open_role_window", { role });
    } catch (err: any) {
      console.error("Failed to open window:", err);
      setError(`Failed to open ${role} window: ${err}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-6">
        <div className="bg-secondary rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Choose Your Device Role</h1>
          <p className="text-sm text-muted-foreground mb-4">Select the device role for this installation.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => {
              const isConfigured = configuredRoles.has(r.key);

              return (
                <div key={r.key} className="relative">
                  <button
                    onClick={() => handleRoleSelect(r.key)}
                    className={`w-full p-4 rounded-lg border  hover:shadow-sm text-left transition ${
                      selectedRole === r.key ? "border-primary bg-primary text-background" : "border-border bg-secondary-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-">{r.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{r.key}</div>
                      </div>
                      {isConfigured && (
                        <span className="text-success text-xs font-semibold">✓ Configured</span>
                      )}
                    </div>
                  </button>

                  {/* Launch button for configured roles */}
                  {isConfigured && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRole(r.key);
                      }}
                      disabled={busy}
                      className="absolute top-2 right-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary-hover disabled:opacity-50 transition"
                    >
                      Launch
                    </button>
                  )}
                </div>
              );
            })}
          </div>



          <button
            onClick={handleContinue}
            disabled={busy || !selectedRole}
            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-60 hover:bg-primary-hover transition"
          >
            {busy ? "Saving..." : "Save & Continue"}
          </button>

          {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
        </div>
      </div>
    </div>
  );
}
