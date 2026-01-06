
import { Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LeftSyncNetworkProps {
  wsConnected: boolean;
}

const LeftSyncNetwork = ({ wsConnected }: LeftSyncNetworkProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/kds/settings/connection")}
      className={cn(
        "p-2 rounded shadow transition-colors",
        wsConnected ? "bg-green-500" : "bg-red-500"
      )}
      title={wsConnected ? "Connected to POS - Click to manage" : "Disconnected - Click to connect"}
    >
      {wsConnected ? (
        <Wifi className="stroke-white" size={20} />
      ) : (
        <WifiOff className="stroke-white" size={20} />
      )}
    </button>
  );
};

export default LeftSyncNetwork;
