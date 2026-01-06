
import { CheckCircle, X, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { cn } from "@/lib/utils";
import { KDS_FOOTER_NAVIGATION } from "@/ui/constants/kdsFooterNavigation";
import { useNavigate, useLocation } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  wsConnected: boolean;
}

const MobileBottomRightSidebar = ({ open, onClose, wsConnected }: Props) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path?: string) => path ? pathname === path : false;

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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Navigation & Status</h3>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONNECTION STATUS */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">System Status</h4>
          <div className="space-y-3">
            {/* Local Database */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Local Database</span>
            </div>

            {/* POS Connection */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  wsConnected ? "bg-success" : "bg-destructive"
                )}
              >
                {wsConnected ? (
                  <Wifi size={16} className="text-white" />
                ) : (
                  <WifiOff size={16} className="text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {wsConnected ? "POS Connected" : "POS Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Navigation</h4>
          {KDS_FOOTER_NAVIGATION.map((item) => {
            const active = isActive(item.link);

            return (
              <Button
                key={item.id}
                onClick={() => {
                  if (item.link) navigate(item.link);
                  if (item.action) item.action();
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg transition-all justify-start",

                  // WARNING (Refresh)
                  item.variant === "warning" &&
                  "bg-warning text-warning-foreground hover:bg-warning/90",

                  // NORMAL NAV ITEMS
                  item.variant !== "warning" &&
                  (active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-navigation hover:bg-sidebar-hover")
                )}
              >
                {/* ICON */}
                <div className="flex-shrink-0">
                  {item.icon}
                </div>

                {/* LABEL */}
                <span className="text-sm font-medium">
                  {item.title}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileBottomRightSidebar;
