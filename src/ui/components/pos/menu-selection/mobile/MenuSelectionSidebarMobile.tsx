
import ModalDepartment from "../../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../../modal/menu-selection/ModalReasonVoid";
import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const MenuSelectionSidebarMobile = (
) => {
  const { t } = useTranslation();
  const router = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState("");

  const openModal = (content: string) => {
    switch (content) {
      case "change-table":
        router("/pos/table-layout");
        break;
      default:
        setModalContent(content);
        setIsModalOpen(true);
        break;
    }
  };

  return (
    <>
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

      <div className="rounded-2xl bg-background flex flex-col justify-between overflow-y-auto no-scrollbar px-4 pb-4">
        {/* Top Section */}
        <div className="flex flex-col gap-3  mt-4 ">
          {MENUSELECTIONNAVIGATION.map(
            (item) =>
              item.position === "Top" && (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.action) item.action(openModal);
                  }}
                  className="flex items-center gap-3 p-3 bg-navigation rounded-lg cursor-pointer hover:bg-sidebar-hover"
                >
                  {item.icon}
                  <p className={cn("text-navigation font-medium text-sm")}>
                    {t(item.title)}
                  </p>
                </div>
              )
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-3 mt-[40%]">
          {MENUSELECTIONNAVIGATION.map(
            (item) =>
              item.position === "Bottom" && (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.link) router(item.link);
                    if (item.action) item.action(openModal);
                  }}
                  className="flex items-center gap-3 p-3 bg-navigation rounded-lg cursor-pointer hover:bg-sidebar-hover"
                >
                  {item.icon}
                  <p className={cn("text-body font-medium text-sm")}>
                    {t(item.title)}
                  </p>
                </div>
              )
          )}
        </div>
      </div>
    </>
  );
};

export default MenuSelectionSidebarMobile;
