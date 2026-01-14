import { useState, useEffect } from "react";
import { Loader2, ChevronUp } from "lucide-react";
import { MdAddShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DrawerOpenedModal from "../../DrowerOpenedModal";
import PaymentSuccessModal from "../PaymentSuccessModal";
import { type PaymentEntry } from "../OrderSidebar";
import { useCart } from "@/ui/context/CartContext";
import { useCharges } from "@/ui/hooks/useCharges";
import { useAppState } from "@/ui/hooks/useAppState";
import { usePaymentMethods } from "@/ui/hooks/usePaymentMethods";
import { useTransactionTypes } from "@/ui/hooks/useTransactionTypes";
import { buildTicketRequest } from "@/ui/utils/ticketBuilder";
import { ticketService } from "@/services/data/ticket.service";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { calculateSurcharge } from "@/services/local/payment-method.local.service";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { queueTokenLocal } from "@/services/local/queue-token.local.service";
import { websocketService } from "@/services/websocket/websocket.service";
import { useNotification } from "@/ui/context/NotificationContext";
import { useSetup } from "@/ui/context/SetupContext";
import { transactionTypeLocal } from "@/services/local/transaction-type.local.service";
import { printerService, type ReceiptData } from "@/services/local/printer.local.service";
import { useTranslation } from "react-i18next";
import PaymentEntriesModal from "../PaymentEntriesModal";
import type { TicketRequest } from "@/types/ticket";
import SurchargeConfirmModal from "../SurchargeConfirmModal";

export default function PaymentMobile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, clear, isHydrated } = useCart();
  const { state: appState } = useAppState();
  const { paymentMethods } = usePaymentMethods();
  const { transactionTypes } = useTransactionTypes();
  const { showNotification } = useNotification();
  const { currencyCode, currencySymbol } = useSetup();

  const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  const { charges, totalCharges } = useCharges(items, subtotal);
  const grandTotal = Math.round((subtotal + totalCharges) * 100) / 100;



  const [inputValue, setInputValue] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [final, setFinal] = useState({ total: 0, balance: 0 });
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [savedReceiptData, setSavedReceiptData] = useState<ReceiptData | null>(null);
  const [savedTicketRequest, setSavedTicketRequest] = useState<TicketRequest | null>(null);

  const [pendingMethod, setPendingMethod] = useState<string | null>(null);
  const [confirmedMethod, setConfirmedMethod] = useState("");
  const [showSurchargeConfirm, setShowSurchargeConfirm] = useState(false);

  // Surcharge calculation based on selected payment method
  const selectedPaymentMethodData = paymentMethods.find(pm => pm.name === confirmedMethod);

  const surchargeInfo = calculateSurcharge(grandTotal, selectedPaymentMethodData?.processor);
  const effectiveTotal = surchargeInfo.adjustedTotal;


  useEffect(() => {
    transactionTypeLocal.getAllTransactionTypes();
  }, []);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].name);
      setConfirmedMethod(paymentMethods[0].name);
    }

  }, [paymentMethods, selectedMethod]);


  useEffect(() => {
    if (!isHydrated) return;


    if (showSuccess || showDrawer || loading) return;

    // ✅ Redirect only when cart is empty AND no payment is happening
    if (items.length === 0) {
      navigate("/pos", { replace: true });
    }
  }, [isHydrated, items.length, showSuccess, showDrawer, loading, navigate]);


  if (!isHydrated) return null;

  const totalPaid = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
  const remainingBalance = Math.round((effectiveTotal - totalPaid) * 100) / 100;
  const tendered = parseFloat(inputValue) || 0;

  const isPaymentReady =
    !showSurchargeConfirm &&
    !isNaN(tendered) &&
    tendered > 0;

  const isPaymentsClickable = payments.length > 0;

  // Generate quick amounts
  const generateQuickAmounts = (amount: number): number[] => {
    const roundedAmount = Math.ceil(amount);
    const base = Math.ceil(roundedAmount / 5) * 5;
    return [base, base + 5, base + 10, base + 20];
  };
  const quickAmounts = generateQuickAmounts(remainingBalance);

  const onKey = (k: string) => {
    if (k === "C") return setInputValue("");
    if (k === "." && inputValue.includes(".")) return;
    setInputValue((p) => (p === "" || p === "0" ? k : p + k));
  };

  const onAddPayment = async (paymentMethodName?: string, amountOverride?: number) => {
    if (showSurchargeConfirm) {
      return;
    }
    const paymentAmount = amountOverride !== undefined ? amountOverride : tendered;

    if (!paymentAmount || paymentAmount <= 0) {
      showNotification.error(t("Please enter a valid payment amount"));
      return;
    }

    const methodToUse = paymentMethodName || confirmedMethod;

    const selectedPaymentMethod = paymentMethods.find((pm) => pm.name === methodToUse);

    if (!selectedPaymentMethod) {
      showNotification.error(`${t("Payment method not found")}: ${methodToUse}`);
      return;
    }

    const existingPaymentIndex = payments.findIndex(
      (p) => p.paymentMethodId === selectedPaymentMethod.id
    );

    let updatedPayments: PaymentEntry[];

    if (existingPaymentIndex >= 0) {
      updatedPayments = payments.map((p, index) =>
        index === existingPaymentIndex
          ? { ...p, amount: p.amount + paymentAmount, timestamp: new Date().toISOString() }
          : p
      );
    } else {
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
    setInputValue("");

    // Calculate surcharge for the payment method being used
    const paymentMethodProcessor = selectedPaymentMethod.processor;
    const paymentSurcharge = calculateSurcharge(grandTotal, paymentMethodProcessor);
    const totalWithSurcharge = paymentSurcharge.adjustedTotal;

    const newTotalPaid = Math.round(updatedPayments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
    const newRemainingBalance = Math.round((totalWithSurcharge - newTotalPaid) * 100) / 100;

    if (newRemainingBalance <= 0.01) {
      showNotification.success(`${methodToUse}: ${currencySymbol}${paymentAmount.toFixed(2)} - ${t("Completing order")}...`);
      await processOrderCompletion(updatedPayments, newRemainingBalance);
    } else {
      showNotification.success(`${methodToUse}: ${currencySymbol}${paymentAmount.toFixed(2)}`);
    }
  };

  const onRemovePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    showNotification.info(t("Payment removed"));
  };

  const onClearAllPayments = () => {
    setPayments([]);
    setInputValue("");
    showNotification.info(t("All payments cleared"));
  };

  const processOrderCompletion = async (paymentsToProcess: PaymentEntry[], finalRemainingBalance: number) => {
    setLoading(true);

    try {
      if (!appState?.tenant_domain || !appState?.access_token || !appState?.selected_location_id || !appState?.selected_location_name || !appState?.selected_order_mode_name) {
        throw new Error("Missing required application state");
      }

      const saleTransactionType = transactionTypes.find((tt) => tt.name === "SALE");
      const paymentTransactionType = transactionTypes.find((tt) => tt.name === "PAYMENT");

      if (!saleTransactionType || !paymentTransactionType) {
        throw new Error("Transaction types not found");
      }

      const businessDate = new Date().toISOString().split("T")[0];
      const queueNumber = await ticketLocal.getNextQueueNumber(appState.selected_location_id, businessDate);

      const totalTendered = paymentsToProcess.reduce((sum, p) => sum + p.amount, 0);
      const uniqueMethods = [...new Set(paymentsToProcess.map((p) => p.paymentMethodName))];
      const paymentMethodName = uniqueMethods.length === 1 ? uniqueMethods[0] : "SPLIT";
      const paymentMethodId = paymentsToProcess[0]?.paymentMethodId || "";

      // Calculate surcharge based on the primary payment method
      const primaryPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId);
      const orderSurcharge = calculateSurcharge(grandTotal, primaryPaymentMethod?.processor);
      const finalTotal = orderSurcharge.adjustedTotal;

      const ticketRequest = buildTicketRequest({
        items,
        charges,
        subtotal,
        total: finalTotal,
        paymentMethod: paymentMethodName,
        paymentMethodId,
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

      const result = await ticketService.createTicket(appState.tenant_domain, appState.access_token, ticketRequest);

      if (result.offline) {
        showNotification.warning(t("Ticket saved offline"));
      } else {
        showNotification.success(t("Ticket created successfully"));
      }

      window.dispatchEvent(new CustomEvent("ticketCreated"));

      const ticketId = result.ticketId || `offline-${Date.now()}`;
      const createdAt = new Date().toISOString();

      try {
        await kdsTicketLocal.saveTicket({
          id: ticketId,
          ticketNumber: String(ticketRequest.ticket.ticket_number),
          orderId: ticketId,
          locationId: appState.selected_location_id,
          orderModeName: appState.selected_order_mode_name,
          status: "IN_PROGRESS",
          items: JSON.stringify(items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, notes: item.notes || "", modifiers: item.modifiers || [], completed: false }))),
          totalAmount: Math.round(finalTotal * 100),
          tokenNumber: queueNumber,
          createdAt,
          updatedAt: createdAt,
        });
      } catch (err) {
        console.error("Failed to save KDS ticket:", err);
      }

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
      } catch (err) {
        console.error("Failed to save queue token:", err);
      }

      try {
        await websocketService.broadcastOrder({
          ticket_id: ticketId,
          ticket_number: String(ticketRequest.ticket.ticket_number),
          order_mode: appState.selected_order_mode_name,
          location_id: appState.selected_location_id,
          location: appState.selected_location_name,
          total_amount: Math.round(finalTotal * 100),
          token_number: queueNumber,
          items: items.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price, notes: item.notes || "", modifiers: item.modifiers || [], completed: false })),
          created_at: createdAt,
        });
      } catch (err) {
        console.warn("WebSocket broadcast skipped");
      }

      const hasCashPayment = paymentsToProcess.some((p) => p.paymentMethodName.toLowerCase().includes("cash"));

      // Include surcharge in receipt charges if applicable
      const receiptCharges = charges.filter((c) => c.applied).map((charge) => ({
        name: charge.name,
        amount: charge.amount,
      }));

      if (orderSurcharge.hasSurcharge) {
        receiptCharges.push({
          name: orderSurcharge.surchargeAmount > 0 ? "Payment Surcharge" : "Payment Discount",
          amount: orderSurcharge.surchargeAmount,
        });
      }

      // Save receipt data BEFORE clearing the cart
      const receiptDataToSave: ReceiptData = {
        ticket_number: String(ticketRequest.ticket.ticket_number),
        location_name: appState.selected_location_name,
        order_mode: appState.selected_order_mode_name,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal,
        charges: receiptCharges,
        total: finalTotal,
        payment_method: paymentMethodName,
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
        setPayments([]);
        setShowSuccess(true);
      }
    } catch (error: any) {
      showNotification.error(error.message || t("Payment failed"));
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
    setPayments([]);
  };

  const handlePrintReceipt = async () => {
    try {
      if (!savedReceiptData) {
        showNotification.error(t("No receipt data available"));
        return;
      }
      await printerService.printReceiptToAllActive(savedReceiptData);
      showNotification.success(t("Receipt printed"));
    } catch {
      showNotification.error(t("Failed to print"));
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

  const handleMethodSelect = (method) => {
    const surchargeCheck = calculateSurcharge(
      grandTotal,
      method.processor
    );

    if (surchargeCheck.hasSurcharge) {
      setPendingMethod(method.name);
      setShowSurchargeConfirm(true);
      return;
    }

    setSelectedMethod(method.name);
    setConfirmedMethod(method.name);
  }
  const confirmSurchargeAndApply = async () => {
    if (!pendingMethod) return;

    const method = paymentMethods.find(pm => pm.name === pendingMethod);
    if (!method) return;
    const surchargeCheck = calculateSurcharge(grandTotal, method.processor);
    const adjustedTotal = surchargeCheck.adjustedTotal;

    const alreadyPaid = payments.reduce((s, p) => s + p.amount, 0);
    const amountToPay =
      Math.round((adjustedTotal - alreadyPaid) * 100) / 100;

    setConfirmedMethod(pendingMethod);
    setSelectedMethod(pendingMethod);
    setShowSurchargeConfirm(false);
    setPendingMethod(null);

    await onAddPayment(pendingMethod, amountToPay);
  };



  return (
    <div className="fixed inset-0 flex flex-col bg-background safe-area safe-area-header safe-area-bottom safe-area-bottom-bg">
      {/* Payment Methods - Horizontal Scroll */}
      <div className="flex-shrink-0 p-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.name;
            return (
              <motion.button
                key={method.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMethodSelect(method)}

                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-foreground hover:bg-muted"
                  }`}
              >
                {t(method.name)}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Scrollable with optimized spacing */}
      <div className="flex-1 overflow-y-auto p-4 pb-2">
        {/* Amount Display - More compact */}
        <div className="bg-secondary rounded-2xl p-3 mb-3">
          <div className="text-center mb-2">
            <p className="text-xs text-muted-foreground mb-0.5">{t("Amount to Pay")}</p>
            <p className="text-3xl font-bold text-primary">
              {currencySymbol} {remainingBalance.toFixed(2)}
            </p>
          </div>

          {/* Input Field */}
          <div className="relative">
            <input
              className="w-full h-12 bg-background border border-border rounded-xl px-4 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary"
              value={inputValue}
              placeholder="0.00"
              inputMode="decimal"
              readOnly
            />

          </div>
        </div>

        {/* Quick Amounts - More compact */}
        <div className="grid grid-cols-4 gap-2 mb-3 mt-6">
          <button
            onClick={() => setInputValue(remainingBalance.toFixed(2))}
            className="h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-transform"
          >
            {t("All")}
          </button>
          {quickAmounts.slice(0, 3).map((amount) => (
            <button
              key={amount}
              onClick={() => setInputValue(amount.toFixed(2))}
              className="h-11 rounded-xl bg-secondary text-foreground font-medium text-sm hover:bg-muted active:scale-95 transition-all"
            >
              {currencySymbol}{amount}
            </button>
          ))}
        </div>

        {/* Keypad - Optimized grid without backspace */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "C"].map((key) => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className={`h-12 rounded-xl border border-border text-xl font-semibold transition-all active:scale-95 ${key === "C"
                ? "bg-destructive/10 text-destructive"
                : key === "."
                  ? "bg-secondary text-foreground"
                  : "bg-secondary text-foreground hover:bg-muted"
                }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed Bottom - Totals & Action Buttons */}
      <div className="flex-shrink-0 border-t border-border bg-secondary ">
        {/* Totals Section - More compact */}
        <motion.div
          className={`px-4 py-2.5 text-sm space-y-1 relative ${isPaymentsClickable
            ? "cursor-pointer active:bg-muted/50"
            : ""
            }`}
          onClick={() => {
            if (isPaymentsClickable) setShowPaymentModal(true);
          }}
          whileTap={isPaymentsClickable ? { scale: 0.99 } : {}}
        >
          {/* Chevron indicator when payments exist - centered at top */}
          {isPaymentsClickable && (
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 -top-3"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="bg-primary rounded-full p-1 shadow-md">
                <ChevronUp className="w-4 h-4 text-primary-foreground" />
              </div>
            </motion.div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("Subtotal")} ({items.reduce((a, b) => a + b.quantity, 0)})
            </span>
            <span>{currencyCode} {subtotal.toFixed(2)}</span>
          </div>

          {charges.filter(c => c.applied).map(charge => (
            <div key={charge.id} className="flex justify-between text-muted-foreground text-xs">
              <span>{charge.name}</span>
              <span>+{currencyCode} {charge.amount.toFixed(2)}</span>
            </div>
          ))}

          {/* ✅ NEW: surcharge line */}
          {surchargeInfo.hasSurcharge && (
            <div className="flex justify-between text-warning text-xs">
              <span>{t("Payment Surcharge")}</span>
              <span>+{currencyCode} {surchargeInfo.surchargeAmount.toFixed(2)}</span>
            </div>
          )}

          <hr className="border-border my-1" />

          <div className="flex justify-between font-semibold">
            <span>{t("Total to Pay")}</span>
            <span>{currencyCode} {effectiveTotal.toFixed(2)}</span>
          </div>


          {totalPaid > 0 && (
            <>
              <div className="flex justify-between text-success text-xs">
                <span>{t("Paid")}</span>
                <span>-{currencyCode} {totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-primary">
                <span>{t("Balance")}</span>
                <span>{currencyCode} {remainingBalance.toFixed(2)}</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Action Buttons - Pay (70%) and Home (30%) */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => {
              if (showSurchargeConfirm) return;
              onAddPayment();
            }}
            disabled={!isPaymentReady || loading}
            className={`flex-[6] h-14 rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isPaymentReady && !loading
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-sidebar text-muted-foreground"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("Processing")}...
              </>
            ) : (
              <>
                {t("Pay")} {inputValue ? `${currencySymbol}${inputValue}` : ""} - {selectedMethod}
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/pos")}
            className="flex-[4] h-14 rounded-xl font-semibold text-base bg-warning text-foreground hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <MdAddShoppingCart className="w-5 h-5" />
            {t("Add More")}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showDrawer && (
        <DrawerOpenedModal isOpen loading={loading} onCompleteOrder={onComplete} />
      )}

      <PaymentSuccessModal
        isOpen={showSuccess}
        total={final.total}
        balance={final.balance}
        onPrintReceipt={handlePrintReceipt}
        onNewOrder={() => navigate("/pos")}
        onSendEmail={handleSendEmail}
      />

      {showPaymentModal && (
        <PaymentEntriesModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          payments={payments}
          onRemovePayment={onRemovePayment}
          onClearAllPayments={onClearAllPayments}
          totalPaid={totalPaid}
          grandTotal={grandTotal}
        />
      )}
      {showSurchargeConfirm && pendingMethod && (
        <SurchargeConfirmModal
          surchargeAmount={calculateSurcharge(
            grandTotal,
            paymentMethods.find(pm => pm.name === pendingMethod)?.processor
          ).surchargeAmount}
          currencyCode={currencyCode}
          onConfirm={confirmSurchargeAndApply}
          onClose={() => {
            setShowSurchargeConfirm(false);
            setPendingMethod(null);
          }}
        />
      )}

    </div>
  );
}