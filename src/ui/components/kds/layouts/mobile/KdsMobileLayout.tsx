
import { Outlet } from "react-router-dom";
import MobileKdsHeader from "./MobileKdsHeader";
import MobileKdsFooter from "./MobileKdsFooter";

const KdsMobileLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-white safe-area">
      <MobileKdsHeader />

      <main className="flex-1 overflow-auto px-3 py-2">
        <Outlet />
      </main>

      <MobileKdsFooter />
    </div>
  );
};

export default KdsMobileLayout;
