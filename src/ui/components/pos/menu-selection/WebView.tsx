import { type ReactNode, useState } from "react";
import MenuSelectionSidebar from "./MenuSelectionSidebar";
import { useTempStyle } from "@/ui/context/TempStyleContext";
import { GoSidebarCollapse ,GoSidebarExpand} from "react-icons/go";
const WebView = ({ children }: { children?: ReactNode }) => {
  const { tempStyle, setTempStyle } = useTempStyle();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      {/* Left Sidebar - Hidden below 1060px, visible above */}
      <div className="hidden min-[1060px]:block h-full overflow-hidden border-r border-border bg-background">
        <MenuSelectionSidebar
          onChangeStyle={(value) => {
            setTempStyle(value);
          }}
          style={tempStyle}
        />
      </div>

      {/* Modern Swipe Toggle Tab - Only visible below 1060px */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`
          min-[1060px]:hidden fixed top-10 -translate-y-1/2 z-50
          bg-background  h-14 w-8 r shadow-lg
          ${sidebarOpen
            ? "left-36 rounded-r-full"
            : "left-0 rounded-r-full"
          }
        `}
      >
        {sidebarOpen ? (
          <GoSidebarExpand className=" stroke-primary " size={25} strokeWidth={2.5} />
        ) : (
          <GoSidebarCollapse className=" stroke-primary " size={25} strokeWidth={2.5} />
        )}
      </button>

      {/* Overlay Sidebar for smaller screens */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="min-[1060px]:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)} 
          />
          {/* Sidebar Overlay */}
          <div className="min-[1060px]:hidden fixed left-0 top-0 h-full z-40 overflow-hidden border-r border-border bg-background shadow-xl">
            <MenuSelectionSidebar
              onChangeStyle={(value) => {
                setTempStyle(value);
              }}
              style={tempStyle}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default WebView;