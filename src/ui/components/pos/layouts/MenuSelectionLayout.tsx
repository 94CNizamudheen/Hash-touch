import { useMediaQuery } from "usehooks-ts";
import { useLocation } from "react-router-dom";
import WebView from "../menu-selection/WebView";
import MobileView from "../menu-selection/mobile/MobileView";
import { type ReactNode, type ComponentType } from "react";

const MenuSelectionLayout = ({ children }: { children: ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const location = useLocation();

  // Pages that should show full-screen on mobile (without MobileView wrapper)
  const fullScreenMobilePages = ["/pos/activity", "/pos/settings", "/pos/sold-out", "/pos/settings/printers", "/pos/settings/devices"];
  const isFullScreenPage = fullScreenMobilePages.some(page => location.pathname.startsWith(page));

  const Desktop = WebView as ComponentType<{ children?: ReactNode }>;
  const Mobile = MobileView as ComponentType<{ children?: ReactNode }>;

  // On mobile, show full-screen pages without MobileView wrapper
  if (!isDesktop && isFullScreenPage) {
    return (
      <div className="w-full h-full bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {isDesktop ? <Desktop>{children}</Desktop> : <Mobile>{children}</Mobile>}
    </div>
  );
};

export default MenuSelectionLayout;
