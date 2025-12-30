
import { Settings, CheckCircle, Power, Grid3x3 } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/shadcn/components/ui/select";
import {  useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import logo from "@/assets/logo_2.png";
import { kdsSettingsLocal } from "@/services/local/kds-settings.local.service";

interface Props {
    open: boolean;
    onClose: () => void;
}

const MobileRightSidebar = ({ open, onClose }: Props) => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState("Classic");

    // Load view mode from SQLite on mount
    useEffect(() => {
        const loadViewMode = async () => {
            try {
                // Migrate from localStorage if exists
                const oldMode = localStorage.getItem("kds_view_mode");
                if (oldMode) {
                    await kdsSettingsLocal.saveViewMode(oldMode);
                    localStorage.removeItem("kds_view_mode");
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

    const handleChange = async (value: string) => {
        setViewMode(value);
        try {
            await kdsSettingsLocal.saveViewMode(value);
        } catch (error) {
            console.error("Failed to save view mode:", error);
        }
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

                {/* View Mode Dropdown */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">View Mode</p>

                    <Select value={viewMode} onValueChange={handleChange}>
                        <SelectTrigger className="w-full border px-3 py-2">
                            <Grid3x3 size={16} className="mr-2 text-gray-600" />
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="Classic">Classic</SelectItem>
                            <SelectItem value="Department">Department</SelectItem>
                            <SelectItem value="Bind Table">Bind Table</SelectItem>
                            <SelectItem value="Tabular">Tabular</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 fixed bottom-5 w-full">
                    {/* Check Button */}
                    <Button className="w-full flex items-center justify-start gap-3 py-5 bg-gray-100 shadow-none">
                        <CheckCircle size={20} className="stroke-primary" />
                        <span className="text-sm text-primary">Synced</span>
                    </Button>

                    {/* Settings */}
                    <Button
                        variant="secondary"
                        className="w-full flex items-center justify-start gap-3 py-5 shadow-none"
                        onClick={() => navigate("/settings")}
                    >
                        <Settings size={20} />
                        <span className="text-sm">Settings</span>
                    </Button>

                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-start gap-3 py-5"
                    >
                        <Power size={20} />
                        <span className="text-sm">Power</span>
                    </Button>
                </div>
            </div>
        </>
    );
};

export default MobileRightSidebar;
