import { Settings, CheckCircle, Power, Monitor } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import logo from "@/assets/logo_2.png";
import { kdsSettingsLocal } from "@/services/local/kds-settings.local.service";
import { logoutService } from "@/services/auth/logout.service";
import SwitchDeviceModal from "@/ui/components/pos/modal/menu-selection/SwitchDeviceModal";
import { localEventBus } from "@/services/eventbus/LocalEventBus";
import type { DeviceRole } from "@/types/app-state";

interface Props {
    open: boolean;
    onClose: () => void;
}

const MobileRightSidebar = ({ open, onClose }: Props) => {
    const navigate = useNavigate();
    const [_, setViewMode] = useState("Classic");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showSwitchDevice, setShowSwitchDevice] = useState(false);

    // Handle device switch
    const handleDeviceSwitch = (role: DeviceRole) => {
        console.log("[MobileRightSidebar] Switching to role:", role);
        localEventBus.emit("device:switch_role", { role });
    };

    // Load view mode from SQLite on mount
    useEffect(() => {
        const loadViewMode = async () => {
            try {
                // Migrate from localStorage if exists
                const oldMode = localStorage.getItem("kds_view_mode");
                if (oldMode) {
                    await kdsSettingsLocal.saveViewMode(oldMode);
                    setViewMode(oldMode);
                } else {
                    const mode = await kdsSettingsLocal.getViewMode();
                    setViewMode(mode);
                }
            } catch (error) {
                console.error("Failed to load view mode:", error);
            }
        };
        loadViewMode();
    }, []);



    const handleLogout = async () => {
        if (!confirm("Are you sure you want to logout? All data will be cleared.")) {
            return;
        }

        setIsLoggingOut(true);
        try {
            await logoutService.logout();
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
            alert("Logout failed. Please try again.");
        }
    };

    const handleSetiingsClick = async () => {
        navigate('/kds/settings');
        onClose()
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}
            <div
                className={`fixed top-6  right-0 h-[92%] w-72 bg-white shadow-xl z-50 p-4 
                    transform transition-transform duration-300 rounded-l-2xl
                    ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="absolute top-3 right-3">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
                    >
                        <X size={18} className="text-gray-700" />
                    </button>
                </div>

                {/* Logo + Title */}
                <div className="flex items-center gap-2 mb-6">
                    <img src={logo} className="w-10 h-10 object-contain" />
                    <h2 className="text-lg font-semibold">Kitchen Display</h2>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 fixed bottom-5 w-full pr-8">
                    {/* Check Button */}
                    <Button className="w-full flex items-center justify-start gap-3 py-5 bg-background shadow-none">
                        <CheckCircle size={20} className="stroke-primary" />
                        <span className="text-sm text-primary">Synced</span>
                    </Button>

                    {/* Switch Device */}
                    <Button
                        className="w-full flex items-center justify-start gap-3 py-5 shadow-none "
                        onClick={() => setShowSwitchDevice(true)}
                    >
                        <Monitor size={20} />
                        <span className="text-sm">Switch Device</span>
                    </Button>

                    {/* Settings */}
                    <Button
                        className="w-full flex items-center justify-start gap-3 py-5 shadow-none"
                        onClick={handleSetiingsClick}
                    >
                        <Settings size={20} />
                        <span className="text-sm">Settings</span>
                    </Button>

                    {/* Logout */}
                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-start gap-3 py-5"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        <Power size={20} />
                        <span className="text-sm">{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </Button>
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
