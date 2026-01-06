import { cn } from "@/lib/utils";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Wifi, WifiOff, CheckCircle } from "lucide-react";

import { KDS_FOOTER_NAVIGATION } from "@/ui/constants/kdsFooterNavigation";

interface KDSTicketsFooterProps {
  wsConnected: boolean;
}

const KDSTicketsFooter = ({ wsConnected }: KDSTicketsFooterProps) => {
  const [, setLastSync] = useState(new Date());
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path?: string) =>
    path ? pathname === path : false;

  useEffect(() => {
    const timer = setInterval(() => setLastSync(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="flex items-center justify-between px-4 py-3 border-t bg-background">
      {/* LEFT STATUS SECTION */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
            <CheckCircle size={14} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            Local Database
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              wsConnected ? "bg-success" : "bg-destructive"
            )}
          >
            {wsConnected ? (
              <Wifi size={14} className="text-white" />
            ) : (
              <WifiOff size={14} className="text-white" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {wsConnected ? "POS Connected" : "POS Disconnected"}
          </span>
        </div>
      </div>

      {/* RIGHT NAVIGATION (CONFIG DRIVEN) */}
      <div className="flex gap-2">
        {KDS_FOOTER_NAVIGATION.map((item) => {
          const active = isActive(item.link);

          return (
            <Button
              key={item.id}
              onClick={() => {
                if (item.link) navigate(item.link);
                if (item.action) item.action();
              }}
              className={cn(
                "flex items-center gap-2 p-2 xl:p-3 rounded-lg transition-all",
                "cursor-pointer",

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
              <span className="text-sm font-normal truncate">
                {item.title}
              </span>
            </Button>
          );
        })}
      </div>

    </footer>
  );
};

export default KDSTicketsFooter;
