import { useState } from "react";
import { Wifi, WifiOff, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import QueueSettingsButton from "./QueueLogout";
import logo from "@assets/logo.png";
import SwitchDeviceModal from "@/ui/components/pos/modal/menu-selection/SwitchDeviceModal";
import { localEventBus } from "@/services/eventbus/LocalEventBus";
import type { DeviceRole } from "@/types/app-state";

interface QueueHeaderProps {
  wsConnected: boolean;
}

export default function QueueHeader({ wsConnected }: QueueHeaderProps) {
  const navigate = useNavigate();
  const [showSwitchDevice, setShowSwitchDevice] = useState(false);

  // Handle device switch
  const handleDeviceSwitch = (role: DeviceRole) => {
    console.log("[QueueHeader] Switching to role:", role);
    localEventBus.emit("device:switch_role", { role });
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-50 object-contain"
          />
        </div>

        {/* Right: Wifi + Switch + Settings */}
        <div className="flex items-center gap-3">
          {/* Switch Device Button */}
          <button
            onClick={() => setShowSwitchDevice(true)}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-1"
            title="Switch Device"
          >
            <Monitor className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Switch</span>
          </button>

          {/* Communication button */}
          <button
            onClick={() => navigate("/queue/communication")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              wsConnected ? "bg-green-600" : "bg-red-600"
            )}
            title={
              wsConnected
                ? "Connected to POS"
                : "Disconnected - Tap to connect"
            }
          >
            {wsConnected ? (
              <Wifi className="w-5 h-5 text-white" />
            ) : (
              <WifiOff className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Settings */}
          <QueueSettingsButton />
        </div>
      </header>

      {/* Switch Device Modal */}
      <SwitchDeviceModal
        isOpen={showSwitchDevice}
        onClose={() => setShowSwitchDevice(false)}
        onSwitch={handleDeviceSwitch}
      />
    </>
  );
}
