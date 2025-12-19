//  const [inputValue, setInputValue] = useState(total.toFixed(2));
//   const [selectedMethod, setSelectedMethod] = useState("Cash");
//   const [showOrderSummary, setShowOrderSummary] = useState(false);
//   const [showPaymentMethods, setShowPaymentMethods] = useState(false);

//   const [showDrawerModal, setShowDrawerModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [finalTotal, setFinalTotal] = useState(0);
//   const [finalBalance, setFinalBalance] = useState(0);
//   const { showNotification } = useNotification();

//   const tendered = parseFloat(inputValue) || 0;
//   const balance = tendered - total;

//   const handleKeyPress = (val: string) => {
//     if (val === "C") {
//       setInputValue("0.00");
//       return;
//     }
//     if (val === ".") {
//       if (inputValue.includes(".")) return;
//       setInputValue((prev) => prev + val);
//       return;
//     }

//     setInputValue((prev) =>
//       prev === "0.00" || prev === "0" ? val : prev + val
//     );
//   };

//   const handleQuickAmount = (amount: number) => {
//     setInputValue(amount.toFixed(2));
//   };

//   const handlePaymentAction = async (action: string) => {
//     if (action === "All") {
//       if (tendered < total) {
//         showNotification("Insufficient payment!");
//         return;
//       }

//       try {
//         await invoke("open_cash_drawer");
//         setShowDrawerModal(true);
//       } catch (err) {
//         console.error("Drawer open failed:", err);
//       }
//     }
//   };

//   const handleCompleteOrder = async () => {
//   setLoading(true);
//   try {
//     onConfirm(selectedMethod);
//     setFinalTotal(total);
//     setFinalBalance(balance);
//     setShowDrawerModal(false);
//     setShowSuccessModal(true);
//     setTimeout(() => {
//       invoke("play_queue_chime").catch(console.error);
//       invoke("update_customer_display", {
//         line1: "Thank You!",
//         line2: `Paid ${total.toFixed(2)}`,
//       }).catch(console.error);
//     }, 100); 

//   } catch (err) {
//     showNotification(`Order failed! ${err}`);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handlePrintReceipt = async () => {
//     try {
//       await invoke("print_receipt", { orderId: "TEMP123", total });
//     } catch (err) {
//       showNotification(`Receipt print failed: ${err}`);
//     }
//   };

//   const handleNewOrder = () => {
//     setShowSuccessModal(false);
//     onClose();
//   };

//   const handleMethodSelect = (method: string) => {
//     setSelectedMethod(method);
//     if (window.innerWidth < 1024) {
//       setShowPaymentMethods(false);
//     }
//   };


import { useState } from "react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Menu, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import PaymentSuccessModal from "./PaymentSuccessModal";
import DrawerOpenedModal from "../DrowerOpenedModal";
import OrderSidebar from "./OrderSidebar";
import PaymentMethodsSidebar from "./PaymentMethodSidebar";
import { useNavigate } from "react-router-dom";

interface PaymentPanelProps {
  total: number;
  onClose: () => void;
  items: { id: string; name: string; quantity: number; price: number }[];
  onConfirm: (paymentMethod: string) => void;
}

export default function PaymentPanel({
  total,
  onClose,
  onConfirm,
  items,
}: PaymentPanelProps) {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState(total.toFixed(2));
  const [selectedMethod, setSelectedMethod] = useState("Cash");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showDrawerModal, setShowDrawerModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);
  const navigate= useNavigate()
  const tendered = parseFloat(inputValue) || 0;
  const balance = tendered - total;

  const handleKeyPress = (val: string) => {
    if (val === "C") return setInputValue("0.00");
    if (val === "." && inputValue.includes(".")) return;
    setInputValue((prev) =>
      prev === "0.00" || prev === "0" ? val : prev + val
    );
  };

  const handleQuickAmount = (amount: number) => {
    setInputValue(amount.toFixed(2));
  };

  const handlePaymentAction = () => {
    if (tendered < total) return alert(t("insufficient_payment"));
    setShowDrawerModal(true);
  };

  const handleCompleteOrder = () => {
    onConfirm(selectedMethod)
    setLoading(true);
    setFinalTotal(total);
    setFinalBalance(balance);
    setShowDrawerModal(false);
    setShowSuccessModal(true);
    setLoading(false);
  };

  const handleNewOrder = () => {
    setShowSuccessModal(false);
    navigate('/pos/table-layout')
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (window.innerWidth < 1024) setShowPaymentMethods(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex h-screen overflow-hidden transition-colors safe-area">
      {/* Sidebar (Desktop) */}
      <div className="hidden lg:block border-r border-border ">
        <OrderSidebar
          items={items}
          total={total}
          isOpen
          onClose={() => {}}
          onBackToMenu={onClose}
        />
      </div>

      {/* Mobile overlay for order summary */}
      {showOrderSummary && (
        <div className="lg:hidden">
          <OrderSidebar
            items={items}
            total={total}
            isOpen
            onClose={() => setShowOrderSummary(false)}
            onBackToMenu={onClose}
          />
        </div>
      )}

      {/* Center Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile buttons */}
        <div className="lg:hidden flex gap-2 p-3 border-b border-border bg-muted">
          <Button
            onClick={() => setShowOrderSummary(true)}
            className="flex-1 bg-primary text-primary-foreground rounded-[var(--radius)]"
          >
            <Menu className="w-4 h-4" />
            <span>{t("order")}</span>
          </Button>
          <Button
            onClick={() => setShowPaymentMethods(true)}
            className="flex-1 bg-primary text-primary-foreground rounded-[var(--radius)]"
          >
            <CreditCard className="w-4 h-4" />
            <span>{t(selectedMethod)}</span>
          </Button>
        </div>

        {/* Main Payment Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto flex flex-col h-full gap-4">
            {/* Totals */}
            <div className="bg-muted p-4 rounded-[var(--radius)] border border-border">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">{t("total")}</div>
                  <div className="text-2xl font-semibold text-primary">
                    ${total.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("balance")}</div>
                  <div className="text-2xl font-semibold text-accent">
                    ${balance >= 0 ? balance.toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tendered input */}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                {t("tender_amount")}
              </label>
              <input
                className="w-full border border-input bg-background rounded-[var(--radius)] p-3 text-2xl font-semibold focus:ring-2 ring-ring outline-none transition-all"
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) setInputValue(val);
                }}
                onBlur={() => {
                  const num = parseFloat(inputValue);
                  if (!isNaN(num)) setInputValue(num.toFixed(2));
                }}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handlePaymentAction} className="bg-primary text-primary-foreground">
                {t("pay_all")}
              </Button>
              <Button variant="outline" className="bg-secondary text-secondary-foreground" disabled>
                {t("split")}
              </Button>
              <Button variant="outline" className="bg-secondary text-secondary-foreground" disabled>
                {t("divide")}
              </Button>
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-3 gap-2">
              {[10, 25, 50].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  onClick={() => handleQuickAmount(amt)}
                  className="bg-secondary hover:bg-primary-hover border border-border"
                >
                  ${amt}
                </Button>
              ))}
            </div>

            {/* Keypad */}
            <div className="flex-1 flex justify-center items-center">
              <div className="grid grid-cols-3 gap-2 max-w-xs">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "."].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`w-20 h-16 text-xl font-bold rounded-[var(--radius)] border border-border bg-muted hover:bg-primary-hover hover:text-primary-foreground transition-all ${
                      key === "C"
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/80"
                        : ""
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="hidden lg:block border-l border-border">
        <PaymentMethodsSidebar
          selectedMethod={selectedMethod}
          isOpen
          onClose={() => {}}
          onMethodSelect={handleMethodSelect}
          onCancel={onClose}
        />
      </div>

      {/* Mobile Overlay */}
      {showPaymentMethods && (
        <PaymentMethodsSidebar
          selectedMethod={selectedMethod}
          isOpen={showPaymentMethods}
          onClose={() => setShowPaymentMethods(false)}
          onMethodSelect={handleMethodSelect}
          onCancel={onClose}
        />
      )}

      {/* Modals */}
      {showDrawerModal && (
        <DrawerOpenedModal
          isOpen={showDrawerModal}
          loading={loading}
          onCompleteOrder={handleCompleteOrder}
        />
      )}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        total={finalTotal}
        balance={finalBalance}
        onPrintReceipt={() => console.log("print")}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
