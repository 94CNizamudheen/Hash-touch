import { useState, useEffect, useRef } from "react";
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
import { buildUpdatedPayments, calculateSurcharge, isTerminalApproved } from "@/services/local/payment-method.local.service";
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
import type { TicketRequest } from "@/types/ticket";


import GiftCardOtpModal from "../gift/GiftCardOtpModal";

import { sendGiftCardOtp, verifyOtpAndApplyGiftCard } from "@/services/Gift/utils/giftCard.utils";
import GiftCardUserDetailsModal from "../gift/GiftCardUserDetailsModal";
import { terminalService } from "@/services/local/terminal.local.service";
import { getRbsPayConfig, pollTerminalTransaction } from "@/services/utils/rbsPayConfig";
import TerminalProcessingModal from "./TerminalProcessingModal";



export default function PaymentDesktop() {
  const navigate = useNavigate();
  const { items, clear, isHydrated } = useCart();
  const { state: appState } = useAppState();
  const { paymentMethods } = usePaymentMethods();
  const { transactionTypes } = useTransactionTypes();
  const { showNotification } = useNotification();
  const [savedReceiptData, setSavedReceiptData] = useState<ReceiptData | null>(null);
  const [savedTicketRequest, setSavedTicketRequest] = useState<TicketRequest | null>(null);

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
  const [confirmedMethod, setConfirmedMethod] = useState<string>("");
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [giftCardMethod, setGiftCardMethod] = useState<any>(null);
  const [giftCardReferenceId, setGiftCardReferenceId] = useState<string | null>(null);

  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const userDetailsResolverRef = useRef<((value: { firstName: string; lastName: string } | null) => void) | null>(null);

  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [activeTerminalTxId, setActiveTerminalTxId] = useState<string | null>(null);
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const [isCancellingTerminal, setIsCancellingTerminal] = useState(false);





  // NEW: Multi-payment state
  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  // Surcharge calculation based on selected payment method
  const primaryPaymentMethod = payments.length > 0
    ? paymentMethods.find(pm => pm.id === payments[0].paymentMethodId)
    : null;

  const surchargeInfo = payments.length > 0 && primaryPaymentMethod
    ? calculateSurcharge(total, primaryPaymentMethod.processor)
    : {
      hasSurcharge: false,
      surchargeAmount: 0,
      adjustedTotal: total,
    };

  const effectiveTotal = surchargeInfo.adjustedTotal;



  /* Load transaction types */
  useEffect(() => {
    transactionTypeLocal.getAllTransactionTypes();
  }, []);


  /* Default payment method */
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setConfirmedMethod(paymentMethods[0].name);
      setSelectedMethod(paymentMethods[0].name);

    }
  }, [paymentMethods, selectedMethod]);

  if (!isHydrated) return null;


  const totalPaid = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
  const remainingBalance = Math.round((effectiveTotal - totalPaid) * 100) / 100;
  const tendered = parseFloat(inputValue) || 0;
  const changeAmount = tendered > 0 ? tendered - remainingBalance : 0;

  const isPaymentReady = !isNaN(tendered) && tendered > 0;

  /* Keypad handler */
  const onKey = (k: string) => {
    if (k === "C") return setInputValue("");
    if (k === "." && inputValue.includes(".")) return;

    setInputValue((p) => (p === "" || p === "0" ? k : p + k));
  };

  const onAddPayment = async (
    paymentMethodName?: string,
    amountOverride?: number
  ) => {
    const paymentAmount =
      amountOverride !== undefined ? amountOverride : tendered;

    if (!paymentAmount || paymentAmount <= 0) {
      showNotification.error("Please enter a valid payment amount");
      return;
    }

    const methodToUse = paymentMethodName ?? confirmedMethod;
    const selectedPaymentMethod = paymentMethods.find(
      (pm) => pm.name === methodToUse
    );

    if (!selectedPaymentMethod) {
      showNotification.error(`Payment method "${methodToUse}" not found`);
      return;
    }

    if (selectedPaymentMethod.code === "RBS_PAY") {
      const config = getRbsPayConfig(selectedPaymentMethod.processor);
      if (!config) {
        showNotification.error("RBSPay configuration missing");
        return;
      }

      setShowTerminalModal(true);
      setLoading(true);

      try {
        // 1️⃣ Initiate terminal
        const { transaction_id } = await terminalService.initiate({
          config,
          amount: paymentAmount,
          currency: currencyCode,
          payment_method: "card",
          invoice_number: `POS-${Date.now()}`,
          description: "POS Terminal Payment",
          tax_amount: 0,
          tip_amount: 0,
          triggered_by: "pos_system",
        });

        setActiveTerminalTxId(transaction_id);

        // 2️⃣ Poll terminal status
        showNotification.info("Polling terminal for payment status...");
        const status = await pollTerminalTransaction({
          config,
          transactionId: transaction_id,
          onStatusUpdate: (currentStatus) => {
            // Update modal message in real-time
            const statusText = `${currentStatus.status || 'Processing'}${currentStatus.response ? ` • ${currentStatus.response}` : ''
              }`;
            setTerminalError(statusText);
          },
        });

        console.log("Terminal final status:", status);

        if (!isTerminalApproved(status)) {
          const errorMessage = `Payment ${status.status}: ${status.response || status.processor_response_code || 'Unknown error'
            }`;
          setTerminalError(errorMessage);
          showNotification.error(errorMessage);
          return; // ← IMPORTANT: Exit without closing modal yet
        }

        // Clear error message on success
        setTerminalError(null);

        // 3️⃣ Add payment
        const updatedPayments = buildUpdatedPayments(
          payments,
          selectedPaymentMethod,
          paymentAmount
        );

        setPayments(updatedPayments);
        setInputValue("");
        setTerminalError(null);

        const totalPaid = updatedPayments.reduce((s, p) => s + p.amount, 0);
        const remaining = Math.round((effectiveTotal - totalPaid) * 100) / 100;

        showNotification.success("Terminal payment approved");

        // 4️⃣ Close modal AFTER successful approval
        setShowTerminalModal(false);
        setActiveTerminalTxId(null);

        if (remaining <= 0.01) {
          await processOrderCompletion(updatedPayments, remaining);
        }
      } catch (err: any) {
        console.error("Terminal error:", err);
        setTerminalError(err.message || "Terminal payment failed");
        setShowTerminalModal(false);
        showNotification.error(err.message || "Terminal payment failed");
      } finally {
        setLoading(false);
      }

      return;
    }

    /* ------------------------------------------------------------------ */
    /*                  🟩 NORMAL PAYMENT FLOW (UNCHANGED)                */
    /* ------------------------------------------------------------------ */

    const updatedPayments = buildUpdatedPayments(
      payments,
      selectedPaymentMethod,
      paymentAmount
    );

    setPayments(updatedPayments);
    setInputValue("");

    const totalPaid = Math.round(
      updatedPayments.reduce((sum, p) => sum + p.amount, 0) * 100
    ) / 100;

    const remainingBalance = Math.round(
      (effectiveTotal - totalPaid) * 100
    ) / 100;

    if (remainingBalance <= 0.01) {
      showNotification.success(
        `${methodToUse}: ${paymentAmount.toFixed(2)} added — completing order`
      );
      await processOrderCompletion(updatedPayments, remainingBalance);
    } else {
      showNotification.success(
        `${methodToUse}: ${paymentAmount.toFixed(2)} added`
      );
    }
  };

  const handleCancelTerminal = async () => {
    if (!activeTerminalTxId) {
      setShowTerminalModal(false);
      return;
    }

    try {
      setIsCancellingTerminal(true);

      const method = paymentMethods.find(pm => pm.code === "RBS_PAY");
      if (!method) return;

      const config = getRbsPayConfig(method.processor);
      if (!config) return;

      await terminalService.cancel(config, activeTerminalTxId);

      showNotification.info("Terminal transaction cancelled");
    } catch {
      showNotification.error("Failed to cancel terminal transaction");
    } finally {
      setIsCancellingTerminal(false);
      setActiveTerminalTxId(null);
      setShowTerminalModal(false);
    }
  };

  const handleRetryTerminal = () => {
    setShowTerminalModal(false);
    setActiveTerminalTxId(null);
    setTerminalError(null);
  };


  const handleMethodSelect = (methodName: string) => {
    const method = paymentMethods.find(pm => pm.name === methodName);
    if (!method) return;
    setConfirmedMethod(methodName);
    setSelectedMethod(methodName);
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

      // Calculate surcharge based on the primary payment method
      const primaryPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
      const orderSurcharge = calculateSurcharge(total, primaryPaymentMethod?.processor);
      const finalTotal = orderSurcharge.adjustedTotal;

      // Build ticket request
      const ticketRequest = buildTicketRequest({
        items,
        charges,
        subtotal,
        total: finalTotal,
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
      setSavedTicketRequest(ticketRequest);

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
          totalAmount: Math.round(finalTotal * 100),
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
          total_amount: Math.round(finalTotal * 100),
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
      // Include surcharge in receipt charges if applicable
      const receiptCharges = charges.filter(c => c.applied).map(c => ({
        name: c.name,
        amount: c.amount,
      }));

      if (orderSurcharge.hasSurcharge) {
        receiptCharges.push({
          name: orderSurcharge.surchargeAmount > 0 ? "Payment Surcharge" : "Payment Discount",
          amount: orderSurcharge.surchargeAmount,
        });
      }



      const receiptDataToSave: ReceiptData = {
        ticket_number: String(ticketRequest.ticket.ticket_number),
        location_name: appState.selected_location_name,
        order_mode: appState.selected_order_mode_name,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal,
        charges: receiptCharges,
        total: finalTotal,
        payment_method: paymentsToProcess
          .map(p => p.paymentMethodName)
          .join(", "),
        tendered: totalTendered,
        change: Math.abs(finalRemainingBalance),
        timestamp: new Date().toLocaleString(),
      };

      setSavedReceiptData(receiptDataToSave);



      if (hasCashPayment) {
        setShowDrawer(true);
      } else {
        const changeAmount = Math.abs(finalRemainingBalance);
        setFinal({ total: finalTotal, balance: changeAmount });
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
    setFinal({ total: effectiveTotal, balance: finalBalance });
    setShowDrawer(false);
    setShowSuccess(true);
    await clear();
    setPayments([]); // Clear payments
  };


  const handlePrintReceipt = async () => {
    try {
      if (!savedReceiptData) {
        showNotification.error("No receipt data available");
        return;
      }

      await printerService.printReceiptToAllActive(savedReceiptData);
      showNotification.success("Receipt printed successfully");
    } catch {
      showNotification.error("Failed to print receipt");
    }
  };


  const handleSendEmail = async (email: string) => {
    if (
      !savedTicketRequest ||
      !appState?.tenant_domain ||
      !appState?.access_token
    ) {
      showNotification.error("No ticket data available");
      return;
    }

    try {
      await ticketService.sendEmail(
        appState.tenant_domain,
        appState.access_token,
        email,
        [savedTicketRequest]
      );

      showNotification.success("Receipt sent successfully");
    } catch {
      showNotification.error("Failed to send email");
    }
  };
  const handleGiftCardSendOtp = async (username: string) => {
    if (!giftCardMethod) return;

    try {
      setLoading(true);
      const { referenceId } = await sendGiftCardOtp({
        username,
        paymentMethod: giftCardMethod,
      });
      setGiftCardReferenceId(referenceId);
      showNotification.success("OTP sent successfully");
    } catch (e: any) {
      showNotification.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGiftCardVerifyOtp = async ({ otp }: { otp: string }) => {
    if (!giftCardMethod || !giftCardReferenceId) return;

    try {
      setLoading(true);

      await verifyOtpAndApplyGiftCard({
        otp,
        referenceId: giftCardReferenceId,
        paymentMethod: giftCardMethod,
        amount: remainingBalance,
        getUserNamesIfRequired: () =>
          new Promise((resolve) => {
            userDetailsResolverRef.current = resolve;
            setShowUserDetailsModal(true);
          }),
      });

      await onAddPayment(giftCardMethod.name, remainingBalance);
      setShowGiftCardModal(false);
      setGiftCardMethod(null);
      setGiftCardReferenceId(null);

      showNotification.success("Gift card applied successfully");
    } catch (e: any) {
      showNotification.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserDetailsSubmit = (data: {
    firstName: string;
    lastName: string;
  }) => {
    setShowUserDetailsModal(false);
    userDetailsResolverRef.current?.(data);
    userDetailsResolverRef.current = null;
  };

  const handleUserDetailsCancel = () => {
    setShowUserDetailsModal(false);
    userDetailsResolverRef.current?.(null);
    userDetailsResolverRef.current = null;
  };



  return (
    <div className="fixed inset-0 flex bg-background text-foreground safe-area">
      <LeftActionRail onBackToMenu={() => navigate("/pos")} />

      <OrderSidebar
        items={items}
        subtotal={subtotal}
        charges={charges}
        totalCharges={totalCharges}
        surcharge={surchargeInfo}
        grandTotal={effectiveTotal}
        payments={payments}
        isOpen
        onClose={() => { }}
        onRemovePayment={onRemovePayment}
        onClearAllPayments={onClearAllPayments}
      />


      <div className="flex-1 p-6 overflow-hidden bg-secondary">
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
        onMethodSelect={handleMethodSelect}
        onCancel={() => navigate("/pos")}
        isPaymentReady={isPaymentReady}
        onPay={(methodName) => {
          const method = paymentMethods.find(pm => pm.name === methodName);

          if (
            method?.code === "Purchase card" ||
            method?.code === "Redeem Card"
          ) {
            setGiftCardMethod(method);
            setShowGiftCardModal(true);
            return;
          }

          onAddPayment(methodName);
        }}


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
      <GiftCardOtpModal
        open={showGiftCardModal}
        loading={loading}
        onClose={() => {
          setShowGiftCardModal(false);
          setGiftCardMethod(null);
          setGiftCardReferenceId(null);
        }}
        onSendOtp={handleGiftCardSendOtp}
        onVerifyOtp={handleGiftCardVerifyOtp}
      />

      <GiftCardUserDetailsModal
        open={showUserDetailsModal}
        onClose={handleUserDetailsCancel}
        onSubmit={handleUserDetailsSubmit}
      />

      <TerminalProcessingModal
        open={showTerminalModal}
        message={
          terminalError ??
          "Please complete the payment on the terminal device"
        }
        isCancelling={isCancellingTerminal}
        onCancel={handleCancelTerminal}
        onRetry={handleRetryTerminal}
      />

    </div>
  );
}