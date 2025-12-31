import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DrawerOpenedModal from "../DrowerOpenedModal";

import { useCart } from "@/ui/context/CartContext";
import { useCharges } from "@/ui/hooks/useCharges";
import { useAppState } from "@/ui/hooks/useAppState";
import { usePaymentMethods } from "@/ui/hooks/usePaymentMethods";
import { useTransactionTypes } from "@/ui/hooks/useTransactionTypes";
import { buildTicketRequest } from "@/ui/utils/ticketBuilder";
import { ticketService } from "@/services/data/ticket.service";
import { printerService, type ReceiptData } from "@/services/local/printer.local.service";
import { websocketService } from "@services/websocket/websocket.service";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import LeftActionRail from "./LeftActionRail";
import OrderSidebar from "./OrderSidebar";
import CenterPaymentContent from "./CenterPaymentContent";
import PaymentMethodsSidebar from "./PaymentMethodSidebar";
import PaymentSuccessModal from "./PaymentSuccessModal";
import { transactionTypeLocal } from "@/services/local/transaction-type.local.service";

export default function PaymentDesktop() {
  const navigate = useNavigate();
  const { items, clear, isHydrated } = useCart();
  const { state: appState } = useAppState();
  const { paymentMethods } = usePaymentMethods();
  const { transactionTypes } = useTransactionTypes();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { charges, totalCharges } = useCharges(items, subtotal);
  const total = subtotal + totalCharges;

  const [inputValue, setInputValue] = useState(() => total.toFixed(2));
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [final, setFinal] = useState({ total: 0, balance: 0 });
  const [isPaymentReady, setIsPaymentReady] = useState(false);

useEffect(() => {
  const loadTransactionTypes = async () => {
    const transactionTypes = await transactionTypeLocal.getAllTransactionTypes();
    console.log("transaction types stored in db", transactionTypes);
  };

  loadTransactionTypes();
}, []);

  // Update inputValue when total changes
  useEffect(() => {
    setInputValue(total.toFixed(2));
  }, [total]);

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

      // Find selected payment method to get its ID
      const selectedPaymentMethod = paymentMethods.find(pm => pm.name === selectedMethod);
      if (!selectedPaymentMethod) {
        throw new Error(`Payment method "${selectedMethod}" not found`);
      }

      // Find SALE and PAYMENT transaction types
      const saleTransactionType = transactionTypes.find(tt => tt.name === "SALE");
      const paymentTransactionType = transactionTypes.find(tt => tt.name === "PAYMENT");

      if (!saleTransactionType || !paymentTransactionType) {
        throw new Error("Required transaction types (SALE, PAYMENT) not found. Please sync data.");
      }

      console.log("selected payment method", selectedPaymentMethod);

      // Build ticket request
      const ticketRequest = buildTicketRequest({
        items,
        charges,
        subtotal,
        total,
        paymentMethod: selectedMethod,
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

      // Save to KDS tickets table for local display
      try {
        await kdsTicketLocal.saveTicket({
          id: `kds-${Date.now()}`,
          ticketNumber: ticketRequest.ticket.ticket_number.toString(),
          orderId: result.ticketId || `offline-${Date.now()}`,
          locationId: appState.selected_location_id,
          orderModeName: appState.selected_order_mode_name,
          status: 'PENDING',
          items: JSON.stringify(items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            modifiers: item.modifiers || [],
          }))),
          totalAmount: Math.round(total * 100),
          tokenNumber: ticketRequest.ticket.queue_number,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("💾 Saved ticket to KDS table");
      } catch (error) {
        console.error("❌ Failed to save to KDS table:", error);
        // Don't fail the entire transaction if KDS save fails
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

      <div className="flex-1 p-6 overflow-hidden ">
        <CenterPaymentContent
          total={total}
          balance={balance}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onPay={onPay}
          onQuick={(n) => setInputValue(n.toFixed(2))}
          onKey={onKey}
          onPaymentReady={() => setIsPaymentReady(true)}
        />
      </div>

      <PaymentMethodsSidebar
        selectedMethod={selectedMethod}
        isOpen
        onClose={() => {}}
        onMethodSelect={setSelectedMethod}
        onCancel={() => navigate("/pos")}
        isPaymentReady={isPaymentReady}
        onPay={onPay}
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
