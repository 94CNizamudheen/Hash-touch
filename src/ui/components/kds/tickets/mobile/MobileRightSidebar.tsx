import { Settings, Power, Monitor, CheckCircle, Wifi, WifiOff, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { kdsSettingsLocal } from "@/services/local/kds-settings.local.service";
import { logoutService } from "@/services/auth/logout.service";
import SwitchDeviceModal from "@/ui/components/pos/modal/menu-selection/SwitchDeviceModal";
import { localEventBus } from "@/services/eventbus/LocalEventBus";
import { useTheme } from "@/ui/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import SplashScreen from "@/ui/components/common/SplashScreen";
import { cn } from "@/lib/utils";
import type { DeviceRole } from "@/types/app-state";
import LeftSyncNetwork from "./LeftSyncNetwork";
import { useKdsWebSocket } from "@/ui/context/web-socket/KdsWebSocketContext";

interface Props {
    open: boolean;
    onClose: () => void;
    wsConnected?: boolean;
}

const MobileRightSidebar = ({ open, onClose, wsConnected = false }: Props) => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showSwitchDevice, setShowSwitchDevice] = useState(false);
     const { isConnected } = useKdsWebSocket();
    // Handle device switch
    const handleDeviceSwitch = (role: DeviceRole) => {
        console.log("[MobileRightSidebar] Switching to role:", role);
        localEventBus.emit("device:switch_role", { role });
        onClose();
    };

    // Load view mode from SQLite on mount
    useEffect(() => {
        const loadViewMode = async () => {
            try {
                const oldMode = localStorage.getItem("kds_view_mode");
                if (oldMode) {
                    await kdsSettingsLocal.saveViewMode(oldMode);
                } else {
                    await kdsSettingsLocal.getViewMode();
                }
            } catch (error) {
                console.error("Failed to load view mode:", error);
            }
        };
        loadViewMode();
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const handleLogout = async () => {
        if (!confirm("Are you sure you want to logout? All data will be cleared.")) {
            return;
        }

        onClose();
        setIsLoggingOut(true);
        try {
            await logoutService.logout();
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
            alert("Logout failed. Please try again.");
        }
    };

    const handleSettingsClick = () => {
        navigate('/kds/settings');
        onClose();
    };

    // Show splash screen during logout
    if (isLoggingOut) {
        return <SplashScreen type={1} />;
    }

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-80 bg-background shadow-xl z-50",
                    "transform transition-transform duration-300 ease-in-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="h-full w-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Kitchen Display</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-sidebar-hover transition-colors"
                        >
                            <X size={18} className="text-foreground" />
                        </button>
                    </div>

                    {/* Scroll area */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-4 py-5">
                        {/* Quick Actions */}
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Quick Actions
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-6">
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
                                    {theme === "dark" ? "Light" : "Dark"}
                                </span>
                            </button>

                         <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary">
                           <LeftSyncNetwork wsConnected={isConnected} />
                         </div>
                        </div>

                        {/* System Status */}
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            System Status
                        </p>
                        <div className="flex flex-col gap-2 mb-6">
                            {/* Local Database */}
                            <div
                                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                            >
                                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-success" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Database</p>
                                    <p className="text-sm font-semibold text-foreground">Local Storage</p>
                                </div>
                            </div>

                            {/* POS Connection */}
                            <div
                                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center",
                                    wsConnected ? "bg-success/10" : "bg-destructive/10"
                                )}>
                                    {wsConnected ? (
                                        <Wifi className="w-5 h-5 text-success" strokeWidth={2} />
                                    ) : (
                                        <WifiOff className="w-5 h-5 text-destructive" strokeWidth={2} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">POS System</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {wsConnected ? "Connected" : "Disconnected"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Menu */}
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Menu
                        </p>
                        <div className="flex flex-col gap-2 mb-6">
                            {/* Settings */}
                            <div
                                onClick={handleSettingsClick}
                                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] bg-secondary hover:bg-sidebar-hover"
                            >
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-primary" strokeWidth={2} />
                                </div>
                                <p className="text-sm font-medium text-foreground flex-1">
                                    Settings
                                </p>
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>

                            {/* Switch Device */}
                            <div
                                onClick={() => setShowSwitchDevice(true)}
                                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] bg-secondary hover:bg-sidebar-hover"
                            >
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Monitor className="w-5 h-5 text-primary" strokeWidth={2} />
                                </div>
                                <p className="text-sm font-medium text-foreground flex-1">
                                    Switch Device
                                </p>
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>

                            {/* Logout */}
                            <div
                                onClick={handleLogout}
                                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] bg-secondary hover:bg-sidebar-hover"
                            >
                                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                                    <Power className="w-5 h-5 text-destructive" strokeWidth={2} />
                                </div>
                                <p className="text-sm font-medium text-foreground flex-1">
                                    Logout
                                </p>
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Bottom padding for scroll */}
                        <div className="h-4" />
                    </div>
                </div>
            </div>

            {/* Switch Device Modal */}
            <SwitchDeviceModal
                isOpen={showSwitchDevice}
                onClose={() => setShowSwitchDevice(false)}
                onSwitch={handleDeviceSwitch}
            />
        </>
    );
};

export default MobileRightSidebar;