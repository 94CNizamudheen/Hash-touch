import ModalDepartment from "../../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../../modal/menu-selection/ModalReasonVoid";
import EndShiftConfirmModal from "../../modal/work-shift/EndShiftConfirmModal";

import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/ui/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { useAppState } from "@/ui/hooks/useAppState";

const MenuSelectionSidebarMobile = () => {
  const { t } = useTranslation();
  const router = useNavigate();

  const { theme, setTheme } = useTheme();
  const { shift } = useWorkShift();
  const { state: appState, loading, setOrderMode } = useAppState();

  const isShiftOpen = !!shift?.isOpen;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [showDineInBoard, setShowDineInBoard] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);

  const locationName = appState?.selected_location_name ?? "";
  const selectedOrderModeName =
    appState?.selected_order_mode_name ?? "";

  if (loading) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };


  const openModal = (content: string) => {
    switch (content) {
      case "change-table":
        router("/pos/table-layout");
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

  const handleOrderModeSelect = async (mode: {
    id: string;
    name: string;
  }) => {
    if (!appState) return;

    const { order_mode_ids, order_mode_names } = appState;

    if (!order_mode_ids || !order_mode_names) return;

    console.log("🟦 Mobile: Calling setOrderMode with:", mode.id);

    await setOrderMode(
      order_mode_ids ?? [],
      order_mode_names ?? [],
      mode.id,
      mode.name
    );

    // ProductContext will automatically apply overrides via useEffect
    // when appState.selected_order_mode_id changes

    setShowDineInBoard(false);
  };

  return (
    <>
      {isModalOpen && modalContent === "void" && (
        <ModalReasonVoid
          isModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {showEndShift && (
        <EndShiftConfirmModal onClose={() => setShowEndShift(false)} />
      )}

      {showDineInBoard && (
        <ModalDepartment
          isModal={showDineInBoard}
          onClose={() => setShowDineInBoard(false)}
          onSelect={handleOrderModeSelect}
        />
      )}

      {/* Drawer – keep safe area unchanged */}
      <div
        className="safe-area fixed right-0 top-0 bottom-0 w-60
                   bg-background z-40 shadow-xl flex flex-col
                   rounded-l-2xl"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Menu Actions
          </h3>

          {/* Dark mode toggle */}
          <button onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="w-5 h-5 stroke-primary" />
            ) : (
              <Moon className="w-5 h-5 stroke-primary" />
            )}
          </button>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
          <div className="flex flex-col gap-3">
            {MENUSELECTIONNAVIGATION.filter(
              (item) => item.position === "Top"
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.title === "Dark Mode") {
                    toggleTheme();
                    return;
                  }
                  item.action?.(openModal);
                  if (item.link) router(item.link);
                }}
                className="flex items-center gap-3 p-3 bg-navigation rounded-lg cursor-pointer active:scale-[0.98]"
              >
                {item.title === "Dark Mode"
                  ? theme === "dark"
                    ? <Sun className="w-5 h-5 stroke-primary" />
                    : <Moon className="w-5 h-5 stroke-primary" />
                  : item.icon}

                <p className="text-navigation font-medium text-sm">
                  {item.title === "Dark Mode"
                    ? theme === "dark"
                      ? t("Light Mode")
                      : t("Dark Mode")
                    : t(item.title)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 border-t border-border bg-background">
          <div className="flex flex-col gap-3 pt-4">
            {MENUSELECTIONNAVIGATION.filter(
              (item) => item.position === "Bottom"
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.link) router(item.link);
                  item.action?.(openModal);
                }}
                className="flex items-center gap-3 p-3 bg-navigation rounded-lg cursor-pointer active:scale-[0.98]"
              >
                {item.icon}
                <p className="text-body font-medium text-sm">
                  {item.title === "Location"
                    ? locationName
                    : item.title === "Dine In"
                      ? selectedOrderModeName || t("Select Mode")
                      : t(item.title)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuSelectionSidebarMobile;
