import LeftSyncNetwork from "../../tickets/mobile/LeftSyncNetwork";
import RightBottomSidebar from "../../tickets/mobile/RightBottomSidebar";



const MobileKdsFooter = () => {
  return (
    <div className="flex items-center justify-between p-2 border-t bg-gray-100">
      <LeftSyncNetwork />

      <div className="text-xs text-gray-700 flex-1 text-center">
        <span className="text-green-500 font-semibold">●</span> Local DB |
        <span className="text-green-500 font-semibold"> ●</span> Server DB |
        Last Sync: 12:53 PM
      </div>

      <RightBottomSidebar />
    </div>
  );
};

export default MobileKdsFooter;
