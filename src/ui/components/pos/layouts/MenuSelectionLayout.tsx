import { useMediaQuery } from "usehooks-ts";
import WebView from "../menu-selection/WebView";
import MobileView from "../menu-selection/mobile/MobileView";
import { type ReactNode, type ComponentType } from "react";

const MenuSelectionLayout = ({ children }: { children: ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Desktop = WebView as ComponentType<{ children?: ReactNode }>;
  const Mobile = MobileView as ComponentType<{ children?: ReactNode }>;
  console.log("isDesktop:", isDesktop, "width:", window.innerWidth);

  return (
    <div className="w-full h-full">
      {isDesktop ? <Desktop>{children}</Desktop> : <Mobile>{children}</Mobile>}
    </div>
  );
};

export default MenuSelectionLayout;
