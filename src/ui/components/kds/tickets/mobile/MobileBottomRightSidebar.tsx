
import { RefreshCcw, CheckCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const MobileBottomRightSidebar = ({ open, onClose }: Props) => {
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLastSync(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed right-0 bottom-11 top-6 w-[65%] bg-white z-50 shadow-xl p-4
                    transform transition-transform duration-300 rounded-l-xl
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-4">

          {/* Count */}
          <div className="flex items-center gap-2">
            <RefreshCcw size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Count: <span className="text-blue-600">5</span>
            </span>
          </div>

          {/* Local Database */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Local Database</span>
          </div>

          {/* Server Database */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
            <span className="text-sm text-gray-900 font-medium">Server Database</span>
          </div>

          {/* Last Sync */}
          <div className="text-sm text-gray-700">
            Last Sync:{" "}
            <span className="font-semibold text-blue-600">
              {lastSync.toLocaleTimeString("en-US", { hour12: true })}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 space-y-3 fixed bottom-5">

          <button className="w-full border border-gray-300 bg-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Recall Item
          </button>

          <button className="w-full border border-gray-300 bg-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Recall Ticket
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-700"
          >
            <RefreshCcw size={16} /> Refresh
          </button>

        </div>
      </div>
    </>
  );
};

export default MobileBottomRightSidebar;
