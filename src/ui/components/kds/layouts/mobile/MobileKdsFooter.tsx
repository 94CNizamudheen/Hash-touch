import LeftSyncNetwork from "../../tickets/mobile/LeftSyncNetwork";
import RightBottomSidebar from "../../tickets/mobile/RightBottomSidebar";

interface MobileKdsFooterProps {
  wsConnected: boolean;
  lastSync?: string;
}

const MobileKdsFooter = ({ wsConnected, lastSync }: MobileKdsFooterProps) => {
  return (
    <div className="flex items-center justify-between p-2 border-t bg-gray-100">
      <LeftSyncNetwork />

      <div className="text-xs text-gray-700 flex-1 text-center">
        <span className="text-green-500 font-semibold">●</span> Local DB |{" "}
        <span
          className={`font-semibold ${
            wsConnected ? "text-green-500" : "text-red-500"
          }`}
        >
          ●
        </span>{" "}
        POS {wsConnected ? "Online" : "Offline"} | Last Sync:{" "}
        {lastSync ?? "--:--"}
      </div>

      <RightBottomSidebar />
    </div>
  );
};

export default MobileKdsFooter;
