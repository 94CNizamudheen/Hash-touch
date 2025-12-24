import ModalDepartment from "../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../modal/menu-selection/ModalReasonVoid";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";
import { cn } from "@/lib/utils";
import { useWorkShift } from "@/ui/context/WorkShiftContext";

import EndShiftConfirmModal from "../modal/work-shift/EndShiftConfirmModal";
import { useTheme } from "@/ui/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useAppState } from "@/ui/hooks/useAppState";
import { productLocal } from "@/services/local/product.local.service";
import { appStateApi } from "@/services/tauri/appState";
import LogoutConfirmModal from "../modal/LogoutConfirmModal";



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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { theme, setTheme, isHydrated } = useTheme();
  const { state: appState, loading, setOrderMode } = useAppState();

  if (!isHydrated || loading) return null;


  const locationName = appState?.selected_location_name ?? "";
  const selectedOrderModeName =
    appState?.selected_order_mode_name ?? "";

  const openModal = (content: string) => {

    switch (content) {
      case "change-table":
        router("/pos/table-layout");
        break;
      case "layout":
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

  const handleLogoutClick = () => {
    if (isShiftOpen) {
      setShowLogoutConfirm(true)
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const toggleTheme = () => { setTheme(theme === "dark" ? "light" : "dark"); };

  const handleOrderModeSelect = async (mode: { id: string; name: string }) => {
    if (!appState) return;

    const {  order_mode_ids,  order_mode_names, } = appState;

    if (!order_mode_ids || !order_mode_names) return;
    console.log("🟦 Calling setOrderMode with:", mode.id);

    await setOrderMode(
      order_mode_ids ?? [],
      order_mode_names ?? [] ,
      mode.id,
      mode.name
    );

    // ProductContext will automatically apply overrides via useEffect
    // when appState.selected_order_mode_id changes

    setShowDineInBoard(false);
  };



  const handleConfirmLogout = async () => {
    try {
      await productLocal.clearCache();
      await appStateApi.clear();
      router("/");
      window.location.reload();
    } catch (e) {
      console.error("Logout failed:", e);
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

      {showEndShift && (
        <EndShiftConfirmModal
          onClose={() => setShowEndShift(false)}
          onConfirm={() => {
            setShowEndShift(false);
            setShowLogoutConfirm(true);
          }}
        />
      )}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
      <div
        className={cn(
          "group flex flex-col justify-between h-full transition-all duration-300 safe-area",
          "w-16 lg:w-36 "
        )}
      >
        {/* ===== Top Navigation ===== */}
        <div className="flex flex-col gap-1">
          {MENUSELECTIONNAVIGATION.map(
            (item) =>
              item.position === "Top" && (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.title === "Dark Mode") {
                      toggleTheme();
                      return;
                    }
                    if (item.action) item.action(openModal);
                    if (item.link) router(item.link);
                    if (item.title === "Logout") {
                      handleLogoutClick();
                      return;
                    };
                  }}

                  className={cn(
                    "flex items-center gap-2 p-2 xl:p-3 rounded-lg cursor-pointer hover:bg-sidebar-hover"
                  )}
                >
                  {item.title === "Dark Mode" ? (
                    theme === "dark" ? (
                      <Sun className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />
                    ) : (
                      <Moon className="lg:w-5 lg:h-5 w-6 h-6 stroke-primary" />
                    )
                  ) : (
                    item.icon
                  )}

                  <p
                    className={cn(
                      "text-navigation font-medium whitespace-nowrap transition-all duration-200",
                      "opacity-0 w-0 overflow-hidden",
                      "group-hover:opacity-100 group-hover:w-auto",
                      "lg:opacity-100 lg:w-auto"
                    )}
                  >
                    {item.title === "Dark Mode" ? theme === "dark" ? t("Light Mode") : t("Dark Mode") : t(item.title)}
                  </p>
                </div>
              )
          )}
        </div>

        {/* ===== Bottom ===== */}
        {showDineInBoard ? (
          <div className="flex-1 overflow-y-auto no-scrollbar mt-3 rounded-md border border-border bg-secondary/30 p-3">
            <ModalDepartment
              isModal={showDineInBoard}
              onClose={() => setShowDineInBoard(false)}
              onSelect={handleOrderModeSelect}
            />
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
                      {item.title === "Location"
                        ? locationName
                        : item.title === "Dine In"
                          ? selectedOrderModeName || t("Select Mode")
                          : t(item.title)}
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
