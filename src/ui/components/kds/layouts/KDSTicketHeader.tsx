import { Settings, Power, ListOrdered, Monitor } from "lucide-react";
import logo from '@/assets/logo_2.png';
import { useState, useEffect } from "react";
import MobileLeftSidebar from "./mobile/MobileLeftSidebar";
import { logoutService } from "@/services/auth/logout.service";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import type { Ticket, TicketItem } from "../tickets/ticket.types";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useNavigate } from "react-router-dom";
import SwitchDeviceModal from "@/ui/components/pos/modal/menu-selection/SwitchDeviceModal";
import { localEventBus } from "@/services/eventbus/LocalEventBus";
import type { DeviceRole } from "@/types/app-state";


const KDSTicketHeader = () => {
    const [orderMenuOPen, setIsOrderMenuOPen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [showSwitchDevice, setShowSwitchDevice] = useState(false);
    const navigate = useNavigate();

    // Handle device switch
    const handleDeviceSwitch = (role: DeviceRole) => {
        console.log("[KDSTicketHeader] Switching to role:", role);
        localEventBus.emit("device:switch_role", { role });
    };

    useEffect(() => {
        const loadTickets = async () => {
            try {
                const kdsTickets = await kdsTicketLocal.getActiveTickets();
                const transformedTickets: Ticket[] = kdsTickets.map((kdsTicket) => {
                    let items: TicketItem[] = [];
                    try {
                        const parsedItems = JSON.parse(kdsTicket.items);
                        items = parsedItems.map((item: any, index: number) => ({
                            id: item.id || `item-${index}`,
                            name: item.name,
                            quantity: item.quantity,
                            status: (item.completed ? 'completed' : 'pending') as 'pending' | 'completed',
                            notes: item.notes || '',
                        }));
                    } catch (error) {
                        console.error('[KDSTicketHeader] Failed to parse items:', error);
                    }
                    return {
                        id: kdsTicket.id,
                        orderNumber: kdsTicket.ticketNumber,
                        restaurant: kdsTicket.locationId || 'Location',
                        adminId: kdsTicket.orderId || '',
                        receivedTime: new Date(kdsTicket.createdAt),
                        preparationTime: '10 min',
                        tableNumber: kdsTicket.orderModeName || 'Dine In',
                        items,
                        orderMode:kdsTicket.orderModeName,
                        queueNumber:kdsTicket.tokenNumber,
                        status:kdsTicket.status
                    };
                });
                setTickets(transformedTickets);
            } catch (error) {
                console.error('[KDSTicketHeader] Failed to load tickets:', error);
            }
        };
        loadTickets();

        // Reload when menu opens
        if (orderMenuOPen) {
            loadTickets();
        }
    }, [orderMenuOPen]);




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
                

                    <div className="flex items-center gap-1 ml-2">
                        {/* Switch Device Button */}
                        <Button
                            onClick={() => setShowSwitchDevice(true)}
                            variant="outline"
                            className="rounded hover:bg-gray-100"
                        >
                            <Monitor size={18} />
                            <span className="ml-1 hidden sm:inline">Switch</span>
                        </Button>

                        {/* List of Items Button */}
                        <Button onClick={() => setIsOrderMenuOPen(true)} className="rounded hover:bg-primary-hover">
                            <ListOrdered className="stroke-amber-50" size={20} />
                            <span className="hidden sm:inline ml-1">List of items</span>
                        </Button>

                        {/* Settings Button */}
                        <button
                            onClick={() => navigate('/kds/settings')}
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

                <MobileLeftSidebar open={orderMenuOPen} onClose={() => setIsOrderMenuOPen(false)} tickets={tickets} />
            </header>

            {/* Switch Device Modal */}
            <SwitchDeviceModal
                isOpen={showSwitchDevice}
                onClose={() => setShowSwitchDevice(false)}
                onSwitch={handleDeviceSwitch}
            />
        </>
    );
};

export default KDSTicketHeader;