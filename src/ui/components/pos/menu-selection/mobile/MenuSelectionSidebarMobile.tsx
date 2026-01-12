import ModalDepartment from "../../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../../modal/menu-selection/ModalReasonVoid";
import SwitchDeviceModal from "../../modal/menu-selection/SwitchDeviceModal";
import EndShiftConfirmModal from "../../modal/work-shift/EndShiftConfirmModal";
import LogoutConfirmModal from "../../modal/LogoutConfirmModal";
import LanguageModal from "../../modal/LanguageModal";

import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/ui/context/ThemeContext";
import { Moon, Sun, X } from "lucide-react";
import DirectionToggle from "@/ui/components/common/DirectionToggle";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { useAppState } from "@/ui/hooks/useAppState";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { useLogoutGuard } from "@/ui/hooks/useLogoutGuard";
import SplashScreen from "@/ui/components/common/SplashScreen";
import { useLogout } from "@/ui/context/LogoutContext";
import { useNotification } from "@/ui/context/NotificationContext";
import { logoutService } from "@/services/auth/logout.service";
import { initialSync } from "@/services/data/initialSync.service";
import { localEventBus } from "@/services/eventbus/LocalEventBus";
import type { DeviceRole } from "@/types/app-state";
import { cn } from "@/lib/utils";

interface MenuSelectionSidebarMobileProps {
  onClose: () => void;
}

const MenuSelectionSidebarMobile = ({ onClose }: MenuSelectionSidebarMobileProps) => {
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
  const { shift } = useWorkShift();
  const { checkBlocks } = useLogoutGuard();

  const isShiftOpen = !!shift?.isOpen;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [showDineInBoard, setShowDineInBoard] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSwitchDevice, setShowSwitchDevice] = useState(false);
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);
  const { isLoggingOut, setIsLoggingOut } = useLogout();
  const { showNotification } = useNotification();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced">("syncing");
  // const [logoutAfterShift, setLogoutAfterShift] = useState(false);

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

  const handleStartSync = async () => {
    if (!appState?.tenant_domain || !appState?.access_token) {
      showNotification.error(t("Cannot sync: Missing tenant or access token"));

      return;
    }

    if (!appState?.selected_location_id || !appState?.brand_id) {
      showNotification.error(t("Cannot sync: No location selected"));
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus("syncing");

      await initialSync(appState.tenant_domain, appState.access_token, {
        channel: appState.device_role ?? "POS",
        locationId: appState.selected_location_id,
        brandId: appState.brand_id,
        orderModeIds: appState.order_mode_ids ?? [],
      });

      setSyncStatus("synced");
      await new Promise(resolve => setTimeout(resolve, 1000));

      showNotification.success(t("Sync completed successfully"), 3000);
      onClose();

    } catch (error) {
      console.error("Sync failed:", error);
      showNotification.error(t("Sync failed") + ": " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };

  const openModal = async (content: string) => {
    switch (content) {
      case "change-table":
        router("/pos/table-layout");
        break;
      case "dineIn":
        setShowDineInBoard(true);
        break;
      case "switchDevice":
        setShowSwitchDevice(true);
        break;
      case "shift":
        if (isShiftOpen) {
          setShowEndShift(true);
        }
        break;
      default:
        setModalContent(content);
        setIsModalOpen(true);
        break;
    }
  };

  // Handle device switch - emits event for App.tsx to handle
  const handleDeviceSwitch = (role: DeviceRole) => {
    console.log("[MenuSelectionSidebarMobile] Switching to role:", role);
    localEventBus.emit("device:switch_role", { role });
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
    onClose();
  };

  const handleLogoutClick = async () => {
     onClose();
    // Check if shift is open
    if (isShiftOpen) {
      showNotification.info(t("Please close your shift before logging out"), 4000);
      return;
    }

    const blocks = await checkBlocks();

    // Check for pending syncs
    if (blocks.totalSyncs > 0) {
      showNotification.info(t("Please wait for pending syncs to complete before logging out"), 4000);
      return;
    }

    // All clear, show confirmation modal
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Use centralized logout service to clear all data
      await logoutService.logout();
    } catch (e) {
      console.error("Logout failed:", e);
      setIsLoggingOut(false);
    }
  };

  // Show splash screen during logout
  if (isLoggingOut) {
    return <SplashScreen type={1} />;
  }

  // Show splash screen during sync
  if (isSyncing) {
    return <SplashScreen type={4} syncStatus={syncStatus} />;
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
          onClose={() => {
            setShowEndShift(false);
          }}
          onConfirm={async () => {
            setShowEndShift(false);
            showNotification.info(t("Logging out..."), 1000);
            await handleConfirmLogout();
          }}
        />
      )}


      {showLogoutConfirm && (
        <LogoutConfirmModal
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            showNotification.info(t("Logging out..."), 2000);
            handleConfirmLogout();
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

      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <SwitchDeviceModal
        isOpen={showSwitchDevice}
        onClose={() => setShowSwitchDevice(false)}
        onSwitch={handleDeviceSwitch}
      />

      {/* Drawer */}
      <div className="h-full w-full bg-background flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            {t("Menu")}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-foreground" />
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
                  // Direction handled only by switch
                  if (item.title === "Direction") return;

                  if (item.title === "Dark Mode") {
                    toggleTheme();
                    return;
                  }

                  if (item.title === "Start Sync") {
                    handleStartSync();
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
               className={cn(
                                   "bg-secondary flex items-center gap-2 p-2 xl:p-3 rounded-lg cursor-pointer hover:bg-sidebar-hover",
                                   item.link && location.pathname === item.link && "bg-sidebar text-primary-foreground"
                                 )}
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

          {/* Direction Toggle */}
          <div className="px-3 pb-3">
            <DirectionToggle className="w-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 border-t border-border bg-background">
          <div className="flex flex-col gap-2">
            {MENUSELECTIONNAVIGATION.filter(
              (item) => item.position === "Bottom"
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  if (item.link) router(item.link);
                  item.action?.(openModal);
                   
                }}
                className="flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-pointer active:scale-[0.98]"
              >
                {item.icon}
                <p className="text-body font-medium text-sm">
                  {item.title === "Location"
                    ? selectedLocationName
                    : item.title === "Dine In"
                      ? selectedOrderModeName || t("Select Mode")
                      : item.title === "Switch Device"
                        ?  t("Switch Device")
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