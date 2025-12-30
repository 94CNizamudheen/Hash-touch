import {  ListOrdered } from "lucide-react";
import { useState } from "react";
import MobileLeftSidebar from "../../layouts/mobile/MobileLeftSidebar";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded bg-amber-300 shadow"
      >
        <ListOrdered size={22} className="stroke-primary" />
      </button>

      <MobileLeftSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default LeftSidebar;
