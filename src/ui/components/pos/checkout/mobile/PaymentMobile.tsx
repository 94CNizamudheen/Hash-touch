import { useState, useEffect } from "react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Menu, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DrawerOpenedModal from "../../DrowerOpenedModal";
import PaymentSuccessModal from "../PaymentSuccessModal";
import OrderSidebar from "../OrderSidebar";
import PaymentMethodsSidebar from "../PaymentMethodSidebar";
import CenterPaymentContent from "../CenterPaymentContent";
import { useCart } from "@/ui/context/CartContext";
import { useCharges } from "@/ui/hooks/useCharges";
import { useAppState } from "@/ui/hooks/useAppState";
import { buildTicketRequest } from "@/ui/utils/ticketBuilder";
import { ticketService } from "@/services/data/ticket.service";
import LeftActionRail from "../LeftActionRail";

export default function PaymentMobile() {
    const navigate = useNavigate();
    const { items, clear, isHydrated } = useCart();
    const { state: appState } = useAppState();

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const { charges, totalCharges } = useCharges(items, subtotal);
    const total = subtotal + totalCharges;

    const [inputValue, setInputValue] = useState(() => total.toFixed(2));
    const [selectedMethod, setSelectedMethod] = useState("Cash");
    const [showOrder, setShowOrder] = useState(false);
    const [showMethods, setShowMethods] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [final, setFinal] = useState({ total: 0, balance: 0 });
    const [showActions, setShowActions] = useState(false);
    const [loading, setLoading] = useState(false);

    // Update inputValue when total changes
    useEffect(() => {
        setInputValue(total.toFixed(2));
    }, [total]);

    if (!isHydrated) return null;

    const tendered = parseFloat(inputValue) || 0;
    const balance = tendered - total;

    const onKey = (k: string) => {
        if (k === "C") return setInputValue("0.00");
        if (k === "." && inputValue.includes(".")) return;
        setInputValue((p) => (p === "0.00" || p === "0" ? k : p + k));
    };

    const onPay = async () => {
        if (tendered < total) {
            alert("Insufficient payment");
            return;
        }

        setLoading(true);

        try {
            // Validate appState
            if (
                !appState?.tenant_domain ||
                !appState?.access_token ||
                !appState?.selected_location_id ||
                !appState?.selected_location_name ||
                !appState?.selected_order_mode_name
            ) {
                throw new Error("Missing required application state");
            }

            // Build ticket request
            const ticketRequest = buildTicketRequest({
                items,
                charges,
                subtotal,
                total,
                paymentMethod: selectedMethod,
                tenderedAmount: tendered,
                locationId: appState.selected_location_id,
                locationName: appState.selected_location_name,
                orderModeName: appState.selected_order_mode_name,
                channelName: "POS",
                userName: "POS User",
            });

            console.log("📝 Creating ticket:", ticketRequest);

            // Create ticket (will handle online/offline automatically)
            const result = await ticketService.createTicket(
                appState.tenant_domain,
                appState.access_token,
                ticketRequest
            );

            if (result.offline) {
                console.log("📴 Ticket saved offline for later sync");
                alert("Ticket saved offline and will sync when internet is available");
            } else {
                console.log("✅ Ticket created successfully online");
            }

            setShowDrawer(true);
        } catch (error) {
            console.error("❌ Failed to create ticket:", error);
            alert(`Failed to create ticket: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    const onComplete = async () => {
        setFinal({ total, balance });
        setShowDrawer(false);
        setShowSuccess(true);
        await clear();
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-background safe-area">
            {/* Top mobile buttons */}
            <div className="flex gap-2 p-3 border-b border-border">
                <Button onClick={() => setShowActions(true)} className="flex-1">
                    Actions
                </Button>

                <Button onClick={() => setShowOrder(true)} className="flex-1">
                    <Menu className="w-4 h-4 mr-1" /> Order
                </Button>

                <Button onClick={() => setShowMethods(true)} className="flex-1">
                    <CreditCard className="w-4 h-4 mr-1" /> {selectedMethod}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 safe-area">
                <CenterPaymentContent
                    total={total}
                    balance={balance}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onPay={onPay}
                    onQuick={(n) => setInputValue(n.toFixed(2))}
                    onKey={onKey}
                />
            </div>

            {showOrder && (
                <OrderSidebar
                    items={items}
                    total={subtotal}
                    isOpen
                    onClose={() => setShowOrder(false)}
                    onBackToMenu={() => navigate("/pos")}
                />
            )}

            {showMethods && (
                <PaymentMethodsSidebar
                    selectedMethod={selectedMethod}
                    isOpen
                    onClose={() => setShowMethods(false)}
                    onMethodSelect={(m) => {
                        setSelectedMethod(m);
                        setShowMethods(false);
                    }}
                    onCancel={() => setShowMethods(false)}
                />
            )}

            {showDrawer && (
                <DrawerOpenedModal
                    isOpen
                    loading={loading}
                    onCompleteOrder={onComplete}
                />
            )}
            {showActions && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowActions(false);
                    }}
                >
                    <div className="w-[120px] h-full bg-background shadow-lg">
                        <LeftActionRail
                            onBackToMenu={() => {
                                setShowActions(false);
                                navigate("/pos");
                            }}
                        />
                    </div>
                </div>
            )}

            <PaymentSuccessModal
                isOpen={showSuccess}
                total={final.total}
                balance={final.balance}
                onPrintReceipt={() => { }}
                onNewOrder={() => navigate("/pos")}
            />
        </div>
    );
}
