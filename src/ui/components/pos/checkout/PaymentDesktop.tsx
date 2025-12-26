import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DrawerOpenedModal from "../DrowerOpenedModal";

import { useCart } from "@/ui/context/CartContext";
import { useCharges } from "@/ui/hooks/useCharges";
import LeftActionRail from "./LeftActionRail";
import OrderSidebar from "./OrderSidebar";
import CenterPaymentContent from "./CenterPaymentContent";
import PaymentMethodsSidebar from "./PaymentMethodSidebar";
import PaymentSuccessModal from "./PaymentSuccessModal";

export default function PaymentDesktop() {
  const navigate = useNavigate();
  const { items, clear, isHydrated } = useCart();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { totalCharges } = useCharges(items, subtotal);
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

  const onPay = () => {
    if (tendered < total) return alert("Insufficient payment");
    setShowDrawer(true);
  };

  const onComplete = async () => {
    setLoading(true);
    setFinal({ total, balance });
    setShowDrawer(false);
    setShowSuccess(true);
    await clear();
    setLoading(false);
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

      <div className="flex-1 p-6 overflow-hidden">
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
        onPrintReceipt={() => {}}
        onNewOrder={() => navigate("/pos")}
      />
    </div>
  );
}
