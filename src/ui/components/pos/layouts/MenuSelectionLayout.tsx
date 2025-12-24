import { useMediaQuery } from "usehooks-ts";
import WebView from "../menu-selection/WebView";
import MobileView from "../menu-selection/mobile/MobileView";
import { type ReactNode, type ComponentType } from "react";

const MenuSelectionLayout = ({
  children,
  setSuppressStartShift,
}: {
  children: ReactNode;
  setSuppressStartShift: (v: boolean) => void;
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Desktop = WebView as ComponentType<{
    children?: ReactNode;
    setSuppressStartShift: (v: boolean) => void;
  }>;
  const Mobile = MobileView as ComponentType<{
    children?: ReactNode;
    setSuppressStartShift: (v: boolean) => void;
  }>;

  return (
    <div className="w-full h-full">
      {isDesktop ? (
        <Desktop setSuppressStartShift={setSuppressStartShift}>
          {children}
        </Desktop>
      ) : (
        <Mobile setSuppressStartShift={setSuppressStartShift}>
          {children}
        </Mobile>
      )}
    </div>
  );
};

export default MenuSelectionLayout;
