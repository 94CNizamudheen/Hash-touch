import { Outlet } from "react-router-dom";
import { useState } from "react";

import MenuSelectionLayout from "./MenuSelectionLayout";
import { useWorkShift } from "@/ui/context/WorkShiftContext";

import StartShiftModal from "../modal/work-shift/StartShiftModal";
import WorkShiftSuccessModal from "../modal/work-shift/WorkShiftSuccessModal";

const MenuLayout = () => {
  const { shift, isHydrated } = useWorkShift();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isHydrated) return null;

  const shouldShowStart = !shift?.isOpen;

  return (
    <main className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md  ">
      {shouldShowStart && (
        <StartShiftModal
          onClose={() => {}}
          onSuccess={() => setShowSuccess(true)}
        />
      )}


      {showSuccess && shift?.isOpen && (
        <WorkShiftSuccessModal onClose={() => setShowSuccess(false)} />
      )}

      {shift?.isOpen && !showSuccess && (
        <MenuSelectionLayout>
          <Outlet />
        </MenuSelectionLayout>
      )}
    </main>
  );
};

export default MenuLayout;
