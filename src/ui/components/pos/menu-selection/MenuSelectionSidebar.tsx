import ModalDepartment from "../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../modal/menu-selection/ModalReasonVoid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";
import { cn } from "@/lib/utils";
import { useWorkShift } from "@/ui/context/WorkShiftContext";

import EndShiftConfirmModal from "../modal/work-shift/EndShiftConfirmModal";

const MenuSelectionSidebar = ({
  onChangeStyle,
  style,
}: {
  onChangeStyle: (value: boolean) => void;
  style: boolean;
}) => {
  const { t } = useTranslation();
  const router = useNavigate();
  const { shift } = useWorkShift();

  const isShiftOpen = !!shift?.isOpen;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [showDineInBoard, setShowDineInBoard] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);

  const openModal = (content: string) => {
    switch (content) {
      case "change-table":
        router("/pos/table-layout");
        break;
      case "change-style":
        onChangeStyle(!style);
        break;
      case "dineIn":
        setShowDineInBoard(true);
        break;
      case "shift":

        if (isShiftOpen) setShowEndShift(true);
        break;
      default:
        setModalContent(content);
        setIsModalOpen(true);
        break;
    }
  };

  return (
    <>
      {/* Existing modals */}
      {isModalOpen && modalContent === "void" && (
        <ModalReasonVoid
          isModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isModalOpen && modalContent === "dineIn" && (
        <ModalDepartment
          isModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {showEndShift && (
        <EndShiftConfirmModal onClose={() => setShowEndShift(false)} />
      )}

      <div
        className={cn(
          "group flex flex-col justify-between h-full transition-all duration-300",
          "w-16 lg:w-36 "
        )}
      >
        {/* ===== Top Navigation ===== */}
        <div className="flex flex-col gap-3">
          {MENUSELECTIONNAVIGATION.map(
            (item) =>
              item.position === "Top" && (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.action) item.action(openModal);
                    if (item.link) router(item.link);
                  }}
                  className={cn(
                    "flex items-center gap-2 p-2 xl:p-3 rounded-lg cursor-pointer hover:bg-sidebar-hover"
                  )}
                >
                  {item.icon}
                  <p
                    className={cn(
                      "text-navigation font-medium whitespace-nowrap transition-all duration-200",
                      "opacity-0 w-0 overflow-hidden",
                      "group-hover:opacity-100 group-hover:w-auto",
                      "lg:opacity-100 lg:w-auto"
                    )}
                  >
                    {t(item.title)}
                  </p>
                </div>
              )
          )}
        </div>

        {/* ===== Bottom ===== */}
        {showDineInBoard ? (
          <div className="flex-1 overflow-y-auto no-scrollbar mt-3 rounded-md border border-border bg-secondary/30">
            helloi
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-auto">
            {MENUSELECTIONNAVIGATION.map(
              (item) =>
                item.position === "Bottom" && (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.link) router(item.link);
                      if (item.action) item.action(openModal);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2 xl:p-3 rounded-lg cursor-pointer hover:bg-sidebar-hover",
                      "justify-center lg:justify-start"
                    )}
                    title={t(item.title)}
                  >
                    {item.icon}
                    <p
                      className={cn(
                        "text-body font-medium whitespace-nowrap transition-all duration-200",
                        "opacity-0 w-0 overflow-hidden",
                        "group-hover:opacity-100 group-hover:w-auto",
                        "lg:opacity-100 lg:w-auto",
                        item.title === "Dine In"
                          ? "text-center"
                          : "text-left"
                      )}
                    >
                      {t(item.title)}
                    </p>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MenuSelectionSidebar;
