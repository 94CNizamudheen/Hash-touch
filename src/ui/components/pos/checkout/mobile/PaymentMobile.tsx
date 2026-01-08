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
import { usePaymentMethods } from "@/ui/hooks/usePaymentMethods";
import { useTransactionTypes } from "@/ui/hooks/useTransactionTypes";
import { buildTicketRequest } from "@/ui/utils/ticketBuilder";
import { ticketService } from "@/services/data/ticket.service";
import LeftActionRail from "../LeftActionRail";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { useNotification } from "@/ui/context/NotificationContext";


export default function PaymentMobile() {
    const navigate = useNavigate();
    const { items, clear, isHydrated } = useCart();
    const { state: appState } = useAppState();
    const { paymentMethods } = usePaymentMethods();
    const { transactionTypes } = useTransactionTypes();

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const { charges, totalCharges } = useCharges(items, subtotal);
    const total = subtotal + totalCharges;

    const [inputValue, setInputValue] = useState("0.00");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [showOrder, setShowOrder] = useState(false);
    const [showMethods, setShowMethods] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [final, setFinal] = useState({ total: 0, balance: 0 });
    const [showActions, setShowActions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPaymentReady, _setIsPaymentReady] = useState(false);
    const {showNotification}= useNotification()
    // Set default payment method when payment methods are loaded
    useEffect(() => {
        if (paymentMethods.length > 0 && !selectedMethod) {
            setSelectedMethod(paymentMethods[0].name);
        }
    }, [paymentMethods, selectedMethod]);

    if (!isHydrated) return null;

    const tendered = parseFloat(inputValue) || 0;
    const balance = tendered - total;

    const onKey = (k: string) => {
        if (k === "C") return setInputValue("0.00");
        if (k === "." && inputValue.includes(".")) return;
        setInputValue((p) => (p === "0.00" || p === "0" ? k : p + k));
    };

    const onPay = async (paymentMethodName?: string) => {
        // Use provided payment method or fall back to state
        const methodToUse = paymentMethodName || selectedMethod;

        // Round to 2 decimals for comparison to avoid floating point issues
        const tenderedRounded = Math.round(tendered * 100) / 100;
        const totalRounded = Math.round(total * 100) / 100;

        if (tenderedRounded < totalRounded) {
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

            // Find selected payment method to get its ID
            const selectedPaymentMethod = paymentMethods.find(pm => pm.name === methodToUse);
            if (!selectedPaymentMethod) {
                throw new Error(`Payment method "${methodToUse}" not found`);
            }

            // Find SALE and PAYMENT transaction types
            const saleTransactionType = transactionTypes.find(tt => tt.name === "SALE");
            const paymentTransactionType = transactionTypes.find(tt => tt.name === "PAYMENT");

            if (!saleTransactionType || !paymentTransactionType) {
                throw new Error("Required transaction types (SALE, PAYMENT) not found. Please sync data.");
            }
            const businessDate = new Date().toISOString().split("T")[0];
            const queueNumber = await ticketLocal.getNextQueueNumber(
                appState.selected_location_id,
                businessDate
            );

            // Build ticket request
            const ticketRequest = buildTicketRequest({
                items,
                charges,
                subtotal,
                total,
                paymentMethod: selectedPaymentMethod.name,
                paymentMethodId: selectedPaymentMethod.id,
                tenderedAmount: tendered,
                locationId: appState.selected_location_id,
                locationName: appState.selected_location_name,
                orderModeName: appState.selected_order_mode_name,
                channelName: "POS",
                userName: "POS User",
                saleTransactionTypeId: saleTransactionType.id,
                paymentTransactionTypeId: paymentTransactionType.id,
                transactionTypes,
                queueNumber
            });

            console.log("📝 Creating ticket:", ticketRequest);

            // Create ticket (will handle online/offline automatically)
            const result = await ticketService.createTicket(
                appState.tenant_domain,
                appState.access_token,
                ticketRequest
            );

            if (result.offline) {
                showNotification.info("Ticket saved offline and will sync when internet is available");
            } else {
               showNotification.info("✅ Ticket created successfully online");
            }

            // Dispatch custom event to notify Activity page
            window.dispatchEvent(new CustomEvent("ticketCreated"));

            // Check if payment method is cash (handle variations)
            const paymentMethodName = selectedPaymentMethod.name.toLowerCase().trim();
            const isCashPayment = paymentMethodName === "cash" || paymentMethodName.includes("cash");

            if (isCashPayment) {
                setShowDrawer(true);
            } else {
                setFinal({ total, balance });
                await clear();
                setShowSuccess(true);
            }
        } catch (error) {
            showNotification.warning(`Failed to create ticket: ${error instanceof Error ? error.message : "Unknown error"}`);
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
                    tenderedAmount={tendered}
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
                    isPaymentReady={isPaymentReady}
                    onPay={onPay}
                    isProcessing={loading}
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
