import { X } from "lucide-react";
import logo from "@/assets/logo_2.png";
import type { Ticket } from "../../tickets/ticket.types";

interface Props {
  open: boolean;
  onClose: () => void;
  tickets: Ticket[];
}

const MobileLeftSidebar = ({ open, onClose, tickets }: Props) => {
  // Flatten ticket items
  const menuRows = tickets.flatMap((ticket) =>
    ticket.items.map((item) => ({
      id: item.id,
      name: item.name,
      portion: "Normal",
      total: item.quantity,
    }))
  );

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-6 left-0 h-[92%] w-80 bg-white shadow-xl z-50 p-4 
                    transform transition-transform duration-300 rounded-r-2xl
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close btn */}
        <div className="absolute top-3 right-3">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-4 mt-2">
          <img src={logo} className="w-10 h-10 object-contain" />
          <h2 className="text-lg font-semibold">Kitchen Display</h2>
        </div>

        <h3 className="text-sm font-semibold mb-2">Order list</h3>

        <div className="border rounded-lg overflow-hidden text-xs flex flex-col h-[calc(100%-80px)]">

          <div className="flex-1 overflow-y-auto">
            {menuRows.map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-2 p-2 border-b last:border-b-0 odd:bg-gray-50"
              >
                <span
                  className="flex-1 text-sm leading-tight overflow-hidden text-ellipsis"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {row.name}
                </span>

                <span className="w-16 text-center text-xs bg-gray-200 rounded-md py-1">
                  {row.portion}
                </span>
                <span className="w-10 text-center text-xs bg-gray-200 rounded-md py-1">
                  {row.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileLeftSidebar;
