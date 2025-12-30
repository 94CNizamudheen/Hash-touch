import ModalDepartment from "../../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../../modal/menu-selection/ModalReasonVoid";
import EndShiftConfirmModal from "../../modal/work-shift/EndShiftConfirmModal";
import LogoutConfirmModal from "../../modal/LogoutConfirmModal";
import LanguageModal from "../../modal/LanguageModal";

import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/ui/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { useAppState } from "@/ui/hooks/useAppState";
import { productLocal } from "@/services/local/product.local.service";
import { appStateApi } from "@/services/tauri/appState";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { useLogoutGuard, type LogoutBlocks } from "@/ui/hooks/useLogoutGuard";
import LogoutBlockerModal from "../../modal/LogoutBlockerModal";
import SplashScreen from "@/ui/components/common/SplashScreen";
import { useLogout } from "@/ui/context/LogoutContext";
import { deviceService } from "@/services/device/device.service";

const MenuSelectionSidebarMobile = () => {
  const { t } = useTranslation();
  const router = useNavigate();

  const { theme, setTheme } = useTheme();
  const {
    state: appState,
    loading,
    setOrderMode,
    selectedLocationName,
    selectedOrderModeName
  } = useAppState();
  const { shift, clear: clearShift } = useWorkShift();
  const { checkBlocks } = useLogoutGuard();

  const isShiftOpen = !!shift?.isOpen;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [showDineInBoard, setShowDineInBoard] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);
  const [showLogoutBlocker, setShowLogoutBlocker] = useState(false);
  const [logoutBlocks, setLogoutBlocks] = useState<LogoutBlocks | null>(null);
  const { isLoggingOut, setIsLoggingOut } = useLogout();

  // Load pending tickets count
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const stats = await ticketLocal.getSyncStats();
        setPendingTicketsCount(stats.pending);
      } catch (error) {
        console.error("Failed to load pending tickets count:", error);
      }
    };

    loadPendingCount();

    // Refresh count every 30 seconds
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const openModal = async (content: string) => {
    switch (content) {
      case "change-table":
        router("/pos/table-layout");
        break;
      case "dineIn":
        setShowDineInBoard(true);
        break;
      case "shift":
        if (isShiftOpen) {
          // Check for pending syncs before allowing shift end
          const blocks = await checkBlocks();
          if (blocks.totalSyncs > 0) {
            setLogoutBlocks(blocks);
            setShowLogoutBlocker(true);
          } else {
            setShowEndShift(true);
          }
        }
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
    setShowDineInBoard(false);
  };

  const handleLogoutClick = async () => {
    const blocks = await checkBlocks();

    if (!blocks.canLogout) {
      setLogoutBlocks(blocks);
      setShowLogoutBlocker(true);
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear all data
      await productLocal.clearCache();
      await ticketLocal.clearAll();
      await appStateApi.clear();
      await clearShift();

      // Clear device-specific data (KDS tickets, settings, cart, etc.)
      await deviceService.clearDeviceData();

      // Small delay to show splash screen
      await new Promise(resolve => setTimeout(resolve, 300));

      // Full page navigation/reload to avoid UI flash
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
      setIsLoggingOut(false);
    }
  };

  // Show splash screen during logout
  if (isLoggingOut) {
    return <SplashScreen type={1} />;
  }

  return (
    <>
      {isModalOpen && modalContent === "void" && (
        <ModalReasonVoid
          isModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {showEndShift && (
        <EndShiftConfirmModal
          onClose={() => setShowEndShift(false)}
          onConfirm={async () => {
            setShowEndShift(false);

            // After ending shift, check only for pending syncs
            // (shift is now closed, so no need to check it again)
            const blocks = await checkBlocks();
            if (blocks.totalSyncs > 0) {
              // Still have pending syncs
              setLogoutBlocks(blocks);
              setShowLogoutBlocker(true);
            } else {
              // All clear, proceed to logout
              setShowLogoutConfirm(true);
            }
          }}
        />
      )}

      {showLogoutBlocker && logoutBlocks && (
        <LogoutBlockerModal
          blocks={logoutBlocks}
          onClose={() => setShowLogoutBlocker(false)}
          onEndShift={() => {
            setShowLogoutBlocker(false);
            setShowEndShift(true);
          }}
          onGoToActivity={() => {
            setShowLogoutBlocker(false);
            router("/pos/activity");
          }}
        />
      )}

      {showDineInBoard && (
        <ModalDepartment
          isModal={showDineInBoard}
          onClose={() => setShowDineInBoard(false)}
          onSelect={handleOrderModeSelect}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      )}

      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

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
              <Sun className="w-5 h-5 stroke-primary" strokeWidth={2.5} />
            ) : (
              <Moon className="w-5 h-5 stroke-primary" strokeWidth={2.5} />
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
                  
                  if (item.title === "Logout") {
                    handleLogoutClick();
                    return;
                  }

                  if (item.title === "Language") {
                    setShowLanguageModal(true);
                    return;
                  }

                  item.action?.(openModal);
                  if (item.link) router(item.link);
                  
                }}
                className="flex items-center gap-3 p-3 bg-navigation rounded-lg cursor-pointer active:scale-[0.98]"
              >
                {item.title === "Dark Mode"
                  ? theme === "dark"
                    ? <Sun className="w-5 h-5" strokeWidth={2.5} />
                    : <Moon className="w-5 h-5" strokeWidth={2.5} />
                  : item.icon}

                <p className="text-navigation font-medium text-sm">
                  {item.title === "Dark Mode"
                    ? theme === "dark"
                      ? t("Light Mode")
                      : t("Dark Mode")
                    : t(item.title)}
                </p>
                {item.title === "Activities" && pendingTicketsCount > 0 && (
                      <span className="-right-1 bg-destructive text-background text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {pendingTicketsCount > 9 ? "9+" : pendingTicketsCount}
                      </span>
                    )}
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
                    ? selectedLocationName
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