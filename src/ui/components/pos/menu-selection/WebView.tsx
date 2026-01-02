import { type ReactNode } from "react";
import MenuSelectionSidebar from "./MenuSelectionSidebar";
import { useTempStyle } from "@/ui/context/TempStyleContext";

const WebView = ({ children }: { children?: ReactNode }) => {
  const { tempStyle, setTempStyle } = useTempStyle();

  return (
    <div className="flex w-full h-full overflow-hidden safe-area">
      {/* Left Sidebar - Menu Selection */}
      <div className="h-full overflow-hidden border-r border-border flex-shrink-0 bg-background">
        <MenuSelectionSidebar
          onChangeStyle={(value) => {
            setTempStyle(value);
          }}
          style={tempStyle}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default WebView;