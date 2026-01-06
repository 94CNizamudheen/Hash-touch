import { X } from "lucide-react";
import logo from "@/assets/logo_2.png";
import type { Ticket } from "../../tickets/ticket.types";

interface Props {
  open: boolean;
  onClose: () => void;
  tickets: Ticket[];
}

const MobileLeftSidebar = ({ open, onClose, tickets }: Props) => {
  // Aggregate items by name across all tickets
  const itemsMap = new Map<string, { name: string; total: number }>();

  tickets.forEach((ticket) => {
    ticket.items.forEach((item) => {
      const existing = itemsMap.get(item.name);
      if (existing) {
        existing.total += item.quantity;
      } else {
        itemsMap.set(item.name, {
          name: item.name,
          total: item.quantity,
        });
      }
    });
  });

  // Convert map to array and sort by name
  const menuRows = Array.from(itemsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
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
          <h2 className="text-lg font-semibold">List of items </h2>
        </div>

        <h3 className="text-sm font-semibold mb-2">Aggregated Items</h3>

        <div className="border rounded-lg overflow-hidden text-xs flex flex-col h-[calc(100%-80px)]">
          {/* Header */}
          <div className="flex items-center gap-2 p-2 bg-gray-100 border-b font-semibold sticky top-0">
            <span className="flex-1 text-sm">Item Name</span>
            <span className="w-16 text-center text-sm">Total Qty</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {menuRows.length > 0 ? (
              menuRows.map((row, index) => (
                <div
                  key={`${row.name}-${index}`}
                  className="flex items-center gap-2 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <span
                    className="flex-1 text-sm leading-tight overflow-hidden text-ellipsis font-medium"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {row.name}
                  </span>

                  <span className="w-16 text-center text-sm font-bold bg-blue-100 text-blue-700 rounded-md py-1.5 px-2">
                    {row.total}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                No items to display
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {menuRows.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border-t font-semibold sticky bottom-0">
              <span className="flex-1 text-sm">Total Items</span>
              <span className="w-16 text-center text-sm bg-green-100 text-green-700 rounded-md py-1.5 px-2">
                {menuRows.reduce((sum, row) => sum + row.total, 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileLeftSidebar;
