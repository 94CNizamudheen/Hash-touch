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
  const { showNotification } = useNotification();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { charges, totalCharges } = useCharges(items, subtotal);
  const total = subtotal + totalCharges;

  const [inputValue, setInputValue] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [final, setFinal] = useState({ total: 0, balance: 0 });

  /* Load transaction types */
  useEffect(() => {
    transactionTypeLocal.getAllTransactionTypes();
  }, []);

  /* Default payment method */
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].name);
    }
  }, [paymentMethods, selectedMethod]);

  if (!isHydrated) return null;

  /* 🔑 DERIVED PAYMENT STATE */
  const tendered = parseFloat(inputValue);
  const isPaymentReady =
    !isNaN(tendered) &&
    tendered > 0 &&
    tendered >= total;

  const balance = isNaN(tendered) ? 0 : tendered - total;

  /* Keypad handler */
  const onKey = (k: string) => {
    if (k === "C") return setInputValue("");
    if (k === "." && inputValue.includes(".")) return;

    setInputValue((p) => (p === "" || p === "0" ? k : p + k));
  };

  /* Payment handler */
  const onPay = async (paymentMethodName?: string) => {
    if (!isPaymentReady) {
      showNotification.error("Insufficient payment");
      return;
    }

    const methodToUse = paymentMethodName || selectedMethod;
    setLoading(true);

    try {
      if (
        !appState?.tenant_domain ||
        !appState?.access_token ||
        !appState?.selected_location_id ||
        !appState?.selected_location_name ||
        !appState?.selected_order_mode_name
      ) {
        throw new Error("Missing required application state");
      }

      const selectedPaymentMethod = paymentMethods.find(
        (pm) => pm.name === methodToUse
      );
      if (!selectedPaymentMethod) {
        throw new Error(`Payment method "${methodToUse}" not found`);
      }

      const saleTransactionType = transactionTypes.find(tt => tt.name === "SALE");
      const paymentTransactionType = transactionTypes.find(tt => tt.name === "PAYMENT");

      if (!saleTransactionType || !paymentTransactionType) {
        throw new Error("Transaction types not found");
      }

      const businessDate = new Date().toISOString().split("T")[0];
      const queueNumber = await ticketLocal.getNextQueueNumber(
        appState.selected_location_id,
        businessDate
      );

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
        queueNumber,
      });

      const result = await ticketService.createTicket(
        appState.tenant_domain,
        appState.access_token,
        ticketRequest
      );

      if (result.offline) {
        showNotification.warning("Ticket saved offline and will sync later");
      } else {
        showNotification.success("Ticket created successfully");
      }

      window.dispatchEvent(new CustomEvent("ticketCreated"));

      /* Broadcast to KDS */
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
            notes: item.notes || "",
            modifiers: item.modifiers || [],
            completed: false,
          })),
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        showNotification.warning("Failed to broadcast order");
      }

      const isCash = selectedPaymentMethod.name
        .toLowerCase()
        .includes("cash");

      if (isCash) {
        setShowDrawer(true);
      } else {
        setFinal({ total, balance });
        await clear();
        setShowSuccess(true);
      }
    } catch (error: any) {
      showNotification.error(error.message || "Payment failed");
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

  /* 🖨️ PRINT RECEIPT */
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
      showNotification.success("Receipt printed successfully");
    } catch (error) {
      showNotification.error("Failed to print receipt");
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
        tenderedAmount={tendered || 0}
      />

      <div className="flex-1 p-6 overflow-hidden">
        <CenterPaymentContent
          total={total}
          balance={balance}
          inputValue={inputValue}
          setInputValue={setInputValue}
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
