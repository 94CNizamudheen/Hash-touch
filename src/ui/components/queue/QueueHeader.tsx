
import { Wifi, WifiOff, } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import QueueSettingsButton from "./QueueLogout";
import logo from "@assets/logo.png"

interface QueueHeaderProps {
  wsConnected: boolean;
}

export default function QueueHeader({ wsConnected }: QueueHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border ">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="Logo"
          className="h-10 w-50 object-contain"
        />
      </div>
      

      {/* Right: Wifi + Settings */}
      <div className="flex items-center gap-3">
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
  );
}
