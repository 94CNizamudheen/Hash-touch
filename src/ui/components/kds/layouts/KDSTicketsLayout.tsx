import { useMediaQuery } from "usehooks-ts";
import KdsMobileLayout from "./mobile/KdsMobileLayout";
import KDSTicketsDesktopLayout from "./KDSTicketsDesktopLayout";


const KDSTicketsWrapper = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? <KDSTicketsDesktopLayout /> : <KdsMobileLayout />;
};

export default KDSTicketsWrapper;
