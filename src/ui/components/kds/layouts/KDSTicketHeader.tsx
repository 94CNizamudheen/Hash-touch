import { Settings, CheckCircle, Power, Grid3x3, ListOrdered } from "lucide-react";
import logo from '@/assets/logo_2.png';
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/shadcn/components/ui/select";
import { useState, useEffect } from "react";
import MobileLeftSidebar from "./mobile/MobileLeftSidebar";
import { kdsSettingsLocal } from "@/services/local/kds-settings.local.service";
import { logoutService } from "@/services/auth/logout.service";


const KDSTicketHeader = () => {
    const [viewMode, setViewMode] = useState("Classic");
    const [orderMenuOPen, setIsOrderMenuOPen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const loadViewMode = async () => {
            try {
                const mode = await kdsSettingsLocal.getViewMode();
                setViewMode(mode);
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
            console.log("Selected view:", value);
        } catch (error) {
            console.error("Failed to save view mode:", error);
        }
    };

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

    const navigate = useNavigate();
    return (
        <>
            <header className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                        <img src={logo} alt="logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-lg font-medium text-gray-900">Kitchen display 1</h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Call Number"
                            className="border border-gray-300 rounded-md px-4 py-1.5 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="bg-blue-600 text-white px-6 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                            Submit
                        </button>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                        {/* shadcn Select Dropdown */}
                        <Button onClick={() => setIsOrderMenuOPen(true)} className="w-9 h-9 flex bg-amber-300  items-center justify-center  rounded hover:bg-primary-hover">
                            <ListOrdered className="stroke-primary" size={20} />

                        </Button>
                        <Select value={viewMode} onValueChange={handleChange}>
                            <SelectTrigger className="w-[150px] border border-gray-300 px-3 py-1.5 text-sm font-medium focus:ring-0 focus:outline-none">
                                <Grid3x3 size={16} className="mr-2 text-gray-600" />
                                <SelectValue placeholder="Select View" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-md">
                                <SelectItem value="Classic">Classic</SelectItem>
                                <SelectItem value="Department">Department</SelectItem>
                                <SelectItem value="Bind Table">Bind Table</SelectItem>
                                <SelectItem value="Tabular">Tabular</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* CheckCircle Button */}
                        <Button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary-hover">
                            <CheckCircle size={20} />
                        </Button>

                        {/* Settings Button */}
                        <button
                            onClick={() => navigate("/kds/settings")}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                            <Settings size={20} />
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                            title="Logout"
                        >
                            <Power size={20} />
                        </button>
                    </div>
                </div>

                <MobileLeftSidebar open={orderMenuOPen} onClose={() => setIsOrderMenuOPen(false)} />
            </header>
        </>
    );
};

export default KDSTicketHeader;