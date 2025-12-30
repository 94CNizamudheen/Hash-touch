import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DrawerOpenedModal from "../DrowerOpenedModal";

import { useCart } from "@/ui/context/CartContext";
import { useCharges } from "@/ui/hooks/useCharges";
import { useAppState } from "@/ui/hooks/useAppState";
import { buildTicketRequest } from "@/ui/utils/ticketBuilder";
import { ticketService } from "@/services/data/ticket.service";
import { printerService, type ReceiptData } from "@/services/local/printer.local.service";
import { websocketService } from "@services/websocket/websocket.service";
import LeftActionRail from "./LeftActionRail";
import OrderSidebar from "./OrderSidebar";
import CenterPaymentContent from "./CenterPaymentContent";
import PaymentMethodsSidebar from "./PaymentMethodSidebar";
import PaymentSuccessModal from "./PaymentSuccessModal";

export default function PaymentDesktop() {
  const navigate = useNavigate();
  const { items, clear, isHydrated } = useCart();
  const { state: appState } = useAppState();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { charges, totalCharges } = useCharges(items, subtotal);
  const total = subtotal + totalCharges;

  const [inputValue, setInputValue] = useState(() => total.toFixed(2));
  const [selectedMethod, setSelectedMethod] = useState("Cash");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [final, setFinal] = useState({ total: 0, balance: 0 });

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

      // Broadcast order to KDS and Queue displays via WebSocket
      try {
        await websocketService.broadcastOrder({
          ticket_id: result.ticketId || `offline-${Date.now()}`,
          ticket_number: ticketRequest.ticket.ticket_number,
          order_mode: appState.selected_order_mode_name,
          location: appState.selected_location_name,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            modifiers: item.modifiers || [],
          })),
          created_at: new Date().toISOString(),
        });
        console.log("📡 Order broadcasted to KDS and Queue displays");
      } catch (error) {
        console.error("❌ Failed to broadcast order:", error);
        // Don't fail the entire transaction if broadcast fails
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
    setLoading(true);
    setFinal({ total, balance });
    setShowDrawer(false);
    setShowSuccess(true);
    await clear();
    setLoading(false);
  };

  const handlePrintReceipt = async () => {
    try {
      const receiptData: ReceiptData = {
        ticket_number: `TKT-${Date.now()}`,
        location_name: appState?.selected_location_name || "Unknown Location",
        order_mode: appState?.selected_order_mode_name || "POS",
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal,
        charges: charges.map(charge => ({
          name: charge.name,
          amount: charge.amount,
        })),
        total: final.total,
        payment_method: selectedMethod,
        tendered: final.total + final.balance,
        change: final.balance,
        timestamp: new Date().toLocaleString(),
      };

      await printerService.printReceiptToAllActive(receiptData);
      alert("Receipt printed successfully!");
    } catch (error) {
      console.error("Failed to print receipt:", error);
      alert(`Failed to print receipt: ${error}`);
    }
  };

  return (
    <div className="fixed inset-0 flex bg-background text-foreground safe-area">
      <LeftActionRail onBackToMenu={() => navigate("/pos")} />

      <OrderSidebar
        items={items}
        total={subtotal}
        isOpen
        onClose={() => {}}
        onBackToMenu={() => navigate("/pos")}
      />

      <div className="flex-1 p-6 overflow-hidden safe-area">
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

      <PaymentMethodsSidebar
        selectedMethod={selectedMethod}
        isOpen
        onClose={() => {}}
        onMethodSelect={setSelectedMethod}
        onCancel={() => navigate("/pos")}
      />

      {showDrawer && (
        <DrawerOpenedModal
          isOpen
          loading={loading}
          onCompleteOrder={onComplete}
        />
      )}

      <PaymentSuccessModal
        isOpen={showSuccess}
        total={final.total}
        balance={final.balance}
        onPrintReceipt={handlePrintReceipt}
        onNewOrder={() => navigate("/pos")}
      />
    </div>
  );
}
