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
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { queueTokenLocal } from "@/services/local/queue-token.local.service";
import { printerService, type ReceiptData } from "@/services/local/printer.local.service";
import { websocketService } from "@services/websocket/websocket.service";
import { useSetup } from "@/ui/context/SetupContext";

import LeftActionRail from "./LeftActionRail";
import OrderSidebar, { type PaymentEntry } from "./OrderSidebar";
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

  const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  const { charges, totalCharges } = useCharges(items, subtotal);
  const total = Math.round((subtotal + totalCharges) * 100) / 100;

  const [inputValue, setInputValue] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [final, setFinal] = useState({ total: 0, balance: 0 });
  const { currencyCode } = useSetup();

  // NEW: Multi-payment state
  const [payments, setPayments] = useState<PaymentEntry[]>([]);



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

  const totalPaid = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
  const remainingBalance = Math.round((total - totalPaid) * 100) / 100;
  const tendered = parseFloat(inputValue) || 0;
  const changeAmount = tendered > 0 ? tendered - remainingBalance : 0;

  const isPaymentReady = !isNaN(tendered) && tendered > 0;

  /* Keypad handler */
  const onKey = (k: string) => {
    if (k === "C") return setInputValue("");
    if (k === "." && inputValue.includes(".")) return;

    setInputValue((p) => (p === "" || p === "0" ? k : p + k));
  };

  const onAddPayment = async (paymentMethodName?: string, amountOverride?: number) => {
    // Use amountOverride if provided (for direct payment), otherwise use tendered from input
    const paymentAmount = amountOverride !== undefined ? amountOverride : tendered;

    // Allow payment if amount is valid and > 0
    if (!paymentAmount || paymentAmount <= 0) {
      showNotification.error("Please enter a valid payment amount");
      return;
    }

    const methodToUse = paymentMethodName || selectedMethod;
    const selectedPaymentMethod = paymentMethods.find(
      (pm) => pm.name === methodToUse
    );

    if (!selectedPaymentMethod) {
      showNotification.error(`Payment method "${methodToUse}" not found`);
      return;
    }

    // Check if payment method already exists - merge amounts instead of duplicating
    const existingPaymentIndex = payments.findIndex(
      (p) => p.paymentMethodId === selectedPaymentMethod.id
    );

    let updatedPayments: PaymentEntry[];

    if (existingPaymentIndex >= 0) {
      // Update existing payment - add amount to it
      updatedPayments = payments.map((p, index) =>
        index === existingPaymentIndex
          ? {
            ...p,
            amount: p.amount + paymentAmount,
            timestamp: new Date().toISOString(), // Update timestamp
          }
          : p
      );
    } else {
      // Add new payment entry
      const newPayment: PaymentEntry = {
        id: crypto.randomUUID(),
        paymentMethodId: selectedPaymentMethod.id,
        paymentMethodName: selectedPaymentMethod.name,
        amount: paymentAmount,
        timestamp: new Date().toISOString(),
      };
      updatedPayments = [...payments, newPayment];
    }

    setPayments(updatedPayments);
    setInputValue(""); // Clear input after adding payment

    // Calculate new remaining balance after this payment (round to avoid floating point issues)
    const newTotalPaid = Math.round(updatedPayments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
    const newRemainingBalance = Math.round((total - newTotalPaid) * 100) / 100;

    // If fully paid or overpaid, auto-complete the order (use small epsilon for floating point safety)
    if (newRemainingBalance <= 0.01) {
      showNotification.success(`${methodToUse}: ${paymentAmount.toFixed(2)} added - Completing order...`);
      // Auto-complete with the updated payments
      await processOrderCompletion(updatedPayments, newRemainingBalance);
    } else {
      const action = existingPaymentIndex >= 0 ? "updated" : "added";
      showNotification.success(`${methodToUse}: ${paymentAmount.toFixed(2)} ${action}`);
    }
  };


  const onRemovePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    showNotification.info("Payment removed");
  };

  const onClearAllPayments = () => {
    setPayments([]);
    setInputValue("");
    showNotification.info("All payments cleared");
  };

  const processOrderCompletion = async (paymentsToProcess: PaymentEntry[], finalRemainingBalance: number) => {
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

      // Calculate totals from all payment entries
      const totalTendered = paymentsToProcess.reduce((sum, p) => sum + p.amount, 0);

      // Use first payment method or "SPLIT" if multiple methods
      const uniqueMethods = [...new Set(paymentsToProcess.map(p => p.paymentMethodName))];
      const paymentMethodName = uniqueMethods.length === 1 ? uniqueMethods[0] : "SPLIT";
      const paymentMethodId = paymentsToProcess[0]?.paymentMethodId || "";

      // Build ticket request
      const ticketRequest = buildTicketRequest({
        items,
        charges,
        subtotal,
        total,
        paymentMethod: paymentMethodName,
        paymentMethodId: paymentMethodId,
        tenderedAmount: totalTendered,
        locationId: appState.selected_location_id,
        locationName: appState.selected_location_name,
        orderModeName: appState.selected_order_mode_name,
        channelName: "POS",
        userName: "POS User",
        saleTransactionTypeId: saleTransactionType.id,
        paymentTransactionTypeId: paymentTransactionType.id,
        transactionTypes,
        queueNumber,
        currencyCode,
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

      const ticketId = result.ticketId || `offline-${Date.now()}`;
      const createdAt = new Date().toISOString();

      /* Save to local KDS tickets */
      try {
        await kdsTicketLocal.saveTicket({
          id: ticketId,
          ticketNumber: String(ticketRequest.ticket.ticket_number),
          orderId: ticketId,
          locationId: appState.selected_location_id,
          orderModeName: appState.selected_order_mode_name,
          status: "IN_PROGRESS",
          items: JSON.stringify(items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || "",
            modifiers: item.modifiers || [],
            completed: false,
          }))),
          totalAmount: Math.round(total * 100),
          tokenNumber: queueNumber,
          createdAt,
          updatedAt: createdAt,
        });
        console.log("✅ KDS ticket saved locally");
      } catch (err) {
        console.error("Failed to save KDS ticket locally:", err);
      }

      /* Save to local Queue tokens */
      try {
        await queueTokenLocal.saveToken({
          id: crypto.randomUUID(),
          ticket_id: ticketId,
          ticket_number: String(ticketRequest.ticket.ticket_number),
          token_number: queueNumber,
          status: "WAITING",
          source: "POS",
          location_id: appState.selected_location_id,
          order_mode: appState.selected_order_mode_name,
          created_at: createdAt,
        });
        console.log("✅ Queue token saved locally");
      } catch (err) {
        console.error("Failed to save queue token locally:", err);
      }

      /* Broadcast via WebSocket */
      try {
        await websocketService.broadcastOrder({
          ticket_id: ticketId,
          ticket_number: String(ticketRequest.ticket.ticket_number),
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
          created_at: createdAt,
        });
        console.log("✅ Order broadcast via WebSocket");
      } catch (err) {
        console.warn("WebSocket broadcast skipped (no connected devices)");
      }

      // Check if any payment is cash
      const hasCashPayment = paymentsToProcess.some(p =>
        p.paymentMethodName.toLowerCase().includes("cash")
      );

      if (hasCashPayment) {
        setShowDrawer(true);
      } else {
        const changeAmount = Math.abs(finalRemainingBalance);
        setFinal({ total, balance: changeAmount });
        await clear();
        setPayments([]); // Clear payments
        setShowSuccess(true);
      }
    } catch (error: any) {
      showNotification.error(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const onComplete = async () => {
    const finalBalance = Math.abs(remainingBalance);
    setFinal({ total, balance: finalBalance });
    setShowDrawer(false);
    setShowSuccess(true);
    await clear();
    setPayments([]); // Clear payments
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
        payment_method: payments.map(p => p.paymentMethodName).join(", "),
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

const handleSendEmail = async (email: string) => {
  if (!appState?.tenant_domain || !appState?.access_token) {
    showNotification.error("Missing application state");
    return;
  }

  try {
    const ticketRequest = buildTicketRequest({
      items,
      charges,
      subtotal,
      total,
      paymentMethod: payments.map(p => p.paymentMethodName).join(", "),
      paymentMethodId: payments[0]?.paymentMethodId || "",
      tenderedAmount: final.total + final.balance,
      locationId: appState.selected_location_id,
      locationName: appState.selected_location_name,
      orderModeName: appState.selected_order_mode_name,
      channelName: "POS",
      userName: "POS User",
      saleTransactionTypeId: transactionTypes.find(t => t.name === "SALE")!.id,
      paymentTransactionTypeId: transactionTypes.find(t => t.name === "PAYMENT")!.id,
      transactionTypes,
      queueNumber: 0,
      currencyCode,
    });

    await ticketService.sendEmail(
      appState.tenant_domain,
      appState.access_token,
      email,               
      [ticketRequest]       
    );

    showNotification.success("Receipt sent successfully");
  } catch (error) {
    console.error("Send email failed:", error);
    showNotification.error("Failed to send email");
  }
};





  return (
    <div className="fixed inset-0 flex bg-background text-foreground safe-area">
      <LeftActionRail onBackToMenu={() => navigate("/pos")} />

      <OrderSidebar
        items={items}
        total={subtotal}
        isOpen
        onClose={() => { }}
        onBackToMenu={() => navigate("/pos")}
        payments={payments}
        onRemovePayment={onRemovePayment}
        onClearAllPayments={onClearAllPayments}
      />

      <div className="flex-1 p-6 overflow-hidden">
        <CenterPaymentContent
          total={total}
          balance={changeAmount}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onQuick={(n) => setInputValue(n.toFixed(2))}
          onKey={onKey}
          remainingAmount={remainingBalance}
        />
      </div>

      <PaymentMethodsSidebar
        selectedMethod={selectedMethod}
        isOpen
        onClose={() => { }}
        onMethodSelect={setSelectedMethod}
        onCancel={() => navigate("/pos")}
        isPaymentReady={isPaymentReady}
        onPay={onAddPayment}
        isProcessing={loading}
        remainingBalance={remainingBalance}
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
        onSendEmail={handleSendEmail}
      />
    </div>
  );
}