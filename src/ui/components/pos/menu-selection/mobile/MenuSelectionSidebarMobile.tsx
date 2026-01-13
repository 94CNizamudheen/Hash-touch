import ModalDepartment from "../../modal/menu-selection/ModalDepartment";
import ModalReasonVoid from "../../modal/menu-selection/ModalReasonVoid";
import SwitchDeviceModal from "../../modal/menu-selection/SwitchDeviceModal";
import EndShiftConfirmModal from "../../modal/work-shift/EndShiftConfirmModal";
import LogoutConfirmModal from "../../modal/LogoutConfirmModal";
import LanguageModal from "../../modal/LanguageModal";
import { IoLanguageSharp } from "react-icons/io5";
import { MdCloudSync } from "react-icons/md";
import { MENUSELECTIONNAVIGATION } from "@/ui/constants/menu-selections";
import { resyncLocal } from "@/services/local/resync.local.service";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/ui/context/ThemeContext";
import { Moon, Sun, } from "lucide-react";
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
import SyncConfirmModal from "../../modal/SyncConfirmModal";
import { isOnline } from "@/ui/utils/networkDetection";

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
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

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
    if (!(await isOnline())) {
      showNotification.error(t("Network not detected, check connection"));
      return;
    }

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
      await resyncLocal.clearBusinessData();

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
      showNotification.error(
        t("Sync failed") +
        ": " +
        (error instanceof Error ? error.message : "Unknown error")
      );
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
          // Check network before allowing shift end
          if (!navigator.onLine) {
            showNotification.error(t("Network not detected, check connection"));
            return;
          }
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
    if (!(await isOnline())) {
        showNotification.error(t("Network not detected, check connection"));
        return;
      }
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
      {showSyncConfirm && (
        <SyncConfirmModal
          onClose={() => setShowSyncConfirm(false)}
          onConfirm={handleStartSync}
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

      {/* Modern Drawer */}
      <div className="h-full w-full bg-background flex flex-col">


        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-5">
          {/* Quick Actions */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("Quick Actions")}</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-sidebar-hover active:scale-95 transition-all"
            >
              {theme === "dark"
                ? <Sun className="w-5 h-5 text-warning" strokeWidth={2} />
                : <Moon className="w-5 h-5 text-primary" strokeWidth={2} />
              }
              <span className="text-[10px] font-medium text-foreground">
                {theme === "dark" ? t("Light") : t("Dark")}
              </span>
            </button>

            {/* Sync */}
            <button
              onClick={() => setShowSyncConfirm(true)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-sidebar-hover active:scale-95 transition-all"
            >
              <MdCloudSync className="w-5 h-5 text-success" />
              <span className="text-[10px] font-medium text-foreground">{t("Sync")}</span>
            </button>

            {/* Language */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-sidebar-hover active:scale-95 transition-all"
            >
              <IoLanguageSharp className="w-5 h-5 text-primary" />

              <span className="text-[10px] font-medium text-foreground">{t("Language")}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {MENUSELECTIONNAVIGATION.filter(
              (item) => item.position === "Top" && !["Dark Mode", "Start Sync", "Language", "Direction"].includes(item.title)
            ).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.title === "Logout") {
                    handleLogoutClick();
                    return;
                  }
                  item.action?.(openModal);
                  if (item.link) router(item.link);
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98]",
                  "bg-secondary hover:bg-sidebar-hover",
                  item.link && location.pathname === item.link && "bg-primary/10 border border-primary/20"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  item.title === "Logout" ? "bg-destructive/10" : "bg-primary/10"
                )}>
                  <span className={item.title === "Logout" ? "text-destructive" : "text-primary"}>
                    {item.icon}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground flex-1">
                  {t(item.title)}
                </p>
                {item.title === "Activities" && pendingTicketsCount > 0 && (
                  <span className="bg-destructive text-background text-xs font-bold rounded-full px-2 py-0.5">
                    {pendingTicketsCount > 9 ? "9+" : pendingTicketsCount}
                  </span>
                )}
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>

          {/* Direction Toggle */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("Direction")}</p>
            <DirectionToggle className="w-full" />
          </div>

          {/* Settings Section */}
          <div className="mt-6">
            <div className="flex flex-col gap-2">
              {/* Order Mode Button */}
              <div
                onClick={() => setShowDineInBoard(true)}
                className="flex items-center gap-3 p-3 bg-primary rounded-xl cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-primary-foreground">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-background">
                    {t("Order Mode")}
                  </p>
                  <p className="text-sm font-semibold text-primary-foreground">
                    {selectedOrderModeName || t("Select Mode")}
                  </p>
                </div>
                <svg className="w-4 h-4 text-primary-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {MENUSELECTIONNAVIGATION.filter(
                (item) => item.position === "Bottom" && item.title !== "Dine In"
              ).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    // Call action first for modals
                    if (item.title === "Switch Device") {
                      setShowSwitchDevice(true);
                      return;
                    }

                    item.action?.(openModal);
                    if (item.link) {
                      onClose();
                      router(item.link);
                    }
                  }}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer active:scale-[0.98] transition-all hover:bg-sidebar-hover"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {t(item.title)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {item.title === "Location"
                        ? selectedLocationName
                        : item.title === "Switch Device"
                          ? t("Switch Device")
                          : t(item.title)}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom padding for scroll */}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
};

export default MenuSelectionSidebarMobile;