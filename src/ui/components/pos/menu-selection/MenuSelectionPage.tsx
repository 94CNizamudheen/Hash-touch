import DineIn from "../_components/DineIn";
import Products from "./Products";
import { useCart } from "@/ui/context/CartContext";
import MenuSelectionSidebar from "./MenuSelectionSidebar";
import { useState } from "react";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import StartShiftModal from "../modal/work-shift/StartShiftModal";
import WorkShiftSuccessModal from "../modal/work-shift/WorkShiftSuccessModal";
import { useLogout } from "@/ui/context/LogoutContext";
import SplashScreen from "@/ui/components/common/SplashScreen";

const MenuSelectionPage = () => {
  const { addItem } = useCart();
  const [tempStyle, setTempStyle] = useState(false);
  const { shift, isHydrated } = useWorkShift();
  const [showSuccess, setShowSuccess] = useState(false);
  const { isLoggingOut } = useLogout();

  if (!isHydrated) return null;

  // If logging out, show splash screen instead of shift modals
  if (isLoggingOut) {
    return <SplashScreen type={1} />;
  }

  // Show StartShiftModal only if there's no shift data at all
  const shouldShowStart = !shift;
  // Show main UI if shift exists (even if closed) - this allows logout flow to complete
  const shouldShowMainUI = !!shift;

  return (
    <>
      {shouldShowStart && (
        <StartShiftModal
          onClose={() => {}}
          onSuccess={() => setShowSuccess(true)}
        />
      )}

      {showSuccess && shift?.isOpen && (
        <WorkShiftSuccessModal onClose={() => setShowSuccess(false)} />
      )}

      {shouldShowMainUI && !showSuccess && (
        <div className="flex w-full h-full overflow-hidden">
          {/* Left Sidebar - Menu Selection */}
          <div className="h-full overflow-hidden border-r border-border flex-shrink-0 bg-background">
            <MenuSelectionSidebar
              onChangeStyle={(value) => {
                setTempStyle(value);
              }}
              style={tempStyle}
            />
          </div>

          {/* Middle Panel - Dine In */}
          <div className="flex-[4] h-full overflow-hidden border-r border-border">
            <DineIn />
          </div>

          {/* Right Panel - Products */}
          <div className="flex-[8] h-full overflow-hidden">
            <Products onAddToOrder={addItem} tempStyle={tempStyle} />
          </div>
        </div>
      )}
    </>
  );
};

export default MenuSelectionPage;