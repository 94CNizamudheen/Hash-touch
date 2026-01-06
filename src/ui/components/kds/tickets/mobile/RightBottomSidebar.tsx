import { PanelsRightBottom } from "lucide-react";
import { useState } from "react";
import MobileBottomRightSidebar from "./MobileBottomRightSidebar";

interface RightBottomSidebarProps {
  wsConnected: boolean;
}

const RightBottomSidebar = ({ wsConnected }: RightBottomSidebarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded bg-white shadow"
      >
        <PanelsRightBottom size={20} className="stroke-primary" />
      </button>

      <MobileBottomRightSidebar
        open={open}
        onClose={() => setOpen(false)}
        wsConnected={wsConnected}
      />
    </>
  );
};

export default RightBottomSidebar;
