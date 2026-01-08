import ModalDepartment from "../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../modal/menu-selection/ModalReasonVoid";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";
import { cn } from "@/lib/utils";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { useTranslation } from "react-i18next";

import EndShiftConfirmModal from "../modal/work-shift/EndShiftConfirmModal";
import LogoutConfirmModal from "../modal/LogoutConfirmModal";
import { useTheme } from "@/ui/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useAppState } from "@/ui/hooks/useAppState";
import LanguageModal from "../modal/LanguageModal";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { useLogoutGuard } from "@/ui/hooks/useLogoutGuard";
import SplashScreen from "@/ui/components/common/SplashScreen";
import { useLogout } from "@/ui/context/LogoutContext";
import { useNotification } from "@/ui/context/NotificationContext";
import { logoutService } from "@/services/auth/logout.service";
import DirectionToggle from "@/ui/components/common/DirectionToggle";
import { initialSync } from "@/services/data/initialSync.service";



const MenuSelectionSidebar = ({
  onChangeStyle,
  style,

}: {
  onChangeStyle: (value: boolean) => void;
  style: boolean;

}) => {
  const { t } = useTranslation();
  const router = useNavigate();
  const { shift, } = useWorkShift();

  const isShiftOpen = !!shift?.isOpen;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [showDineInBoard, setShowDineInBoard] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);
  const { isLoggingOut, setIsLoggingOut } = useLogout();
  const { showNotification } = useNotification();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced">("syncing");


  const { theme, setTheme, isHydrated } = useTheme();
  const {
    state: appState,
    loading,
    setOrderMode,
    selectedLocationName,
    selectedOrderModeName,
  } = useAppState();
  const { checkBlocks } = useLogoutGuard();

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

  if (!isHydrated || loading) return null;

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
      case "layout":
        onChangeStyle(!style);
        break;
      case "dineIn":
        setShowDineInBoard(true);
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


  const handleLogoutClick = async () => {
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



  const toggleTheme = () => { setTheme(theme === "dark" ? "light" : "dark"); };

  const handleOrderModeSelect = async (mode: { id: string; name: string }) => {
    if (!appState) return;

    const { order_mode_ids, order_mode_names, } = appState;

    if (!order_mode_ids || !order_mode_names) return;

    await setOrderMode(
      order_mode_ids ?? [],
      order_mode_names ?? [],
      mode.id,
      mode.name
    );
    setShowDineInBoard(false);

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
            showNotification.success(t("Work shift ended successfully"), 3000);
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

      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />

      <div
        className={cn(
          "group flex flex-col justify-between h-full transition-all  duration-300 ",
          "w-16 lg:w-36 "
        )}
      >
        {/* ===== Top Navigation ===== */}
        <div className="flex flex-col gap-1 mt-2 mx-2">
          {MENUSELECTIONNAVIGATION.map(
            (item) =>
              item.position === "Top" && (
                <div
                  key={item.id}
                  onClick={() => {
                    // ❌ Direction handled only by switch
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

                    if (item.action) item.action(openModal);
                    if (item.link) router(item.link);
                  }}
                  className={cn(
                    "bg-secondary flex items-center gap-2 p-2 xl:p-3 rounded-lg cursor-pointer hover:bg-sidebar-hover"
                  )}
                >
                  {/* Direction Toggle - Full Width */}
                  {item.title === "Direction" ? (
                    <DirectionToggle className="w-full" />
                  ) : (
                    <>
                      {/* LEFT ICON */}
                      <div className="relative flex-shrink-0">
                        {item.title === "Dark Mode" ? (
                          theme === "dark" ? (
                            <Sun className="lg:w-5 lg:h-4 w-4 h-4" strokeWidth={2.5} />
                          ) : (
                            <Moon className="lg:w-5 lg:h-4 w-4 h-4" strokeWidth={2.5} />
                          )
                        ) : (
                          item.icon
                        )}

                        {item.title === "Activities" && pendingTicketsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {pendingTicketsCount > 9 ? "9+" : pendingTicketsCount}
                          </span>
                        )}
                      </div>

                      {/* LABEL */}
                      <p
                        className={cn(
                          "text-navigation font-normal text-sm truncate transition-all duration-200",
                          "opacity-0 w-0 overflow-hidden",
                          "group-hover:opacity-100 group-hover:w-auto",
                          "lg:opacity-100 lg:w-auto"
                        )}
                      >
                        {item.title === "Dark Mode"
                          ? theme === "dark"
                            ? t("Light Mode")
                            : t("Dark Mode")
                          : t(item.title)}
                      </p>
                    </>
                  )}
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
          <div className="flex flex-col gap-3  mb-2 mx-1">
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
                      "flex items-center gap-2  p-2 rounded-lg cursor-pointer",
                      "justify-center lg:justify-start",
                      item.title === "Location"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary hover:bg-sidebar-hover"
                    )}
                    title={
                      item.title === "Location"
                        ? selectedLocationName
                        : item.title === "Dine In"
                          ? selectedOrderModeName || t("Select Mode")
                          : t(item.title)
                    }
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <p
                      className={cn(
                        "text-body font-medium text-sm truncate transition-all duration-200 max-w-[120px]",
                        "opacity-0 w-0 overflow-hidden",
                        "group-hover:opacity-100 group-hover:w-auto",
                        "lg:opacity-100 lg:w-auto",
                        item.title === "Dine In"
                          ? "text-center"
                          : "text-left"
                      )}
                    >
                      {item.title === "Location"
                        ? selectedLocationName
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
