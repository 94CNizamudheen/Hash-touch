import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type DeviceRole } from "@/services/local/device.local.service";
import DeviceSetupModal from "./components/common/DeviceSetupModal";

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
  tenantDomain: string;
  accessToken: string;
  onRoleSelected: (role: DeviceRole, setup: any) => Promise<void>;
}

export default function Home({
  tenantDomain,
  accessToken,
  onRoleSelected,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<DeviceRole | null>(null);
  const [showModal, setShowModal] = useState(false);
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

  const createAndContinue = () => {
    if (!selectedRole) return;
    setShowModal(true);
  };

  const handleSetupSuccess = async (_code: string, setup: any) => {
    if (!selectedRole) return;

    setShowModal(false);
    setBusy(true);

    try {
      await onRoleSelected(selectedRole, setup);
      
      // Add to configured roles
      setConfiguredRoles(prev => new Set(prev).add(selectedRole));
      
      // 🟢 DON'T automatically open window - let user click Launch button
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
        <div className="bg-card rounded-2xl shadow p-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome to HashOne-Touch</h1>
          <p className="text-sm text-muted-foreground mb-4">Select the device role for this installation.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => {
              const isConfigured = configuredRoles.has(r.key);
              
              return (
                <div key={r.key} className="relative">
                  <button
                    onClick={() => handleRoleSelect(r.key)}
                    className={`w-full p-4 rounded-lg border hover:shadow-sm text-left transition ${
                      selectedRole === r.key ? "border-primary bg-tag-selected" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{r.label}</div>
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

          {/* Info for POS device */}
          {selectedRole === "POS" && (
            <div className="mb-6 p-4 bg-success/10 rounded-lg border border-success/30">
              <p className="text-sm text-success">
                ✓ This device will run as the WebSocket server. Other devices (KDS, Queue) will connect to this device.
              </p>
            </div>
          )}

          {/* Info for KDS/Queue devices */}
          {(selectedRole === "KDS" || selectedRole === "QUEUE") && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-primary">
                ℹ️ After setup, go to Settings → Device Communication to connect to your POS device.
              </p>
            </div>
          )}

          <button
            onClick={createAndContinue}
            disabled={busy || !selectedRole}
            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-60 hover:bg-primary-hover transition"
          >
            {busy ? "Saving..." : "Save & Continue"}
          </button>

          {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
        </div>
      </div>

      {/* Setup Modal */}
      {selectedRole && (
        <DeviceSetupModal
          open={showModal}
          role={selectedRole}
          domain={tenantDomain}
          token={accessToken}
          onSuccess={handleSetupSuccess}
          onClose={() => {
            setShowModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}