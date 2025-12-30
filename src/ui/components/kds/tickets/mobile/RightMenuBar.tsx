import { Menu } from "lucide-react";
import { useState } from "react";
import MobileRightSidebar from "./MobileRightSidebar";

const RightMenuBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded bg-amber-300 shadow"
      >
        <Menu size={22} className="stroke-primary" />
      </button>

      <MobileRightSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default RightMenuBar;
