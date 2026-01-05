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
import { ticketLocal } from "@/services/local/ticket.local.service";
import { printerService, type ReceiptData } from "@/services/local/printer.local.service";
import { websocketService } from "@services/websocket/websocket.service";
import LeftActionRail from "./LeftActionRail";
import OrderSidebar from "./OrderSidebar";
import CenterPaymentContent from "./CenterPaymentContent";
import PaymentMethodsSidebar from "./PaymentMethodSidebar";
import PaymentSuccessModal from "./PaymentSuccessModal";
import { transactionTypeLocal } from "@/services/local/transaction-type.local.service";
import { useNotification } from "@/ui/context/NotificationContext";

export default function PaymentDesktop() {
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
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [final, setFinal] = useState({ total: 0, balance: 0 });
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const {showNotification}= useNotification();

useEffect(() => {
  const loadTransactionTypes = async () => {
    const transactionTypes = await transactionTypeLocal.getAllTransactionTypes();
    console.log("transaction types stored in db", transactionTypes);
  };

  loadTransactionTypes();
}, []);

  // Set default payment method when payment methods are loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].name);
    }
  }, [paymentMethods, selectedMethod]);

  if (!isHydrated) return null;

  const tendered = parseFloat(inputValue) || 0;
  const balance = tendered - total;

  console.log("tendered amount:", tendered.toFixed(2))
  console.log("total amount:", total.toFixed(2))
  console.log("balance amount:", balance.toFixed(2))

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
      showNotification.error("Insufficient payment")
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
      // Get business date (today in YYYY-MM-DD format)
      const businessDate = new Date().toISOString().split("T")[0];
      // Get sequential queue number for this location and date
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
        showNotification.warning("Ticket saved offline and will sync when internet is available");
      } else {
        showNotification.success("✅ Ticket created successfully online");
      }

      // Dispatch custom event to notify Activity page
      window.dispatchEvent(new CustomEvent("ticketCreated"));

      // Broadcast order to KDS and Queue displays via WebSocket
      // Note: KDS devices will receive this broadcast and save to their local database
      try {
        await websocketService.broadcastOrder({
          ticket_id: result.ticketId || `offline-${Date.now()}`,
          ticket_number: ticketRequest.ticket.ticket_number,
          order_mode: appState.selected_order_mode_name,
          location_id: appState.selected_location_id,
          location: appState.selected_location_name,
          total_amount: Math.round(total * 100),
          token_number: queueNumber,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || '',
            modifiers: item.modifiers || [],
            completed: false,
          })),
          created_at: new Date().toISOString(),
        });
        console.log("📡 Order broadcasted to KDS and Queue displays");
      } catch (error) {
        showNotification.warning(`Failed to broadcast order:${error}`)
      }

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
      showNotification.error(`Failed to create ticket: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        tenderedAmount={tendered}
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
        isProcessing={loading}
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
