// import { useEffect, useState } from "react";
// import { Button } from "@/ui/shadcn/components/ui/button";
// import { Menu, CreditCard } from "lucide-react";
// import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";

// import PaymentSuccessModal from "./PaymentSuccessModal";
// import DrawerOpenedModal from "../DrowerOpenedModal";
// import OrderSidebar from "./OrderSidebar";
// import PaymentMethodsSidebar from "./PaymentMethodSidebar";
// import LeftActionRail from "./LeftActionRail";

// import { useCart } from "@/ui/context/CartContext";

// export default function PaymentPanel() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();

//   const { items, clear, isHydrated } = useCart();

//   const total = items.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const [inputValue, setInputValue] = useState(total.toFixed(2));
//   const [selectedMethod, setSelectedMethod] = useState("Cash");
//   const [showOrderSummary, setShowOrderSummary] = useState(false);
//   const [showPaymentMethods, setShowPaymentMethods] = useState(false);
//   const [showDrawerModal, setShowDrawerModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [finalTotal, setFinalTotal] = useState(0);
//   const [finalBalance, setFinalBalance] = useState(0);


//   useEffect(() => {
//     setInputValue(total.toFixed(2));
//   }, [total]);

//   if (!isHydrated) return null;

//   const tendered = parseFloat(inputValue) || 0;
//   const balance = tendered - total;

//   const handleKeyPress = (val: string) => {
//     if (val === "C") return setInputValue("0.00");
//     if (val === "." && inputValue.includes(".")) return;
//     setInputValue((prev) =>
//       prev === "0.00" || prev === "0" ? val : prev + val
//     );
//   };

//   const handleQuickAmount = (amount: number) => {
//     setInputValue(amount.toFixed(2));
//   };

//   const handlePaymentAction = () => {
//     if (tendered < total) {
//       alert(t("insufficient_payment"));
//       return;
//     }
//     setShowDrawerModal(true);
//   };

//   const handleCompleteOrder = async () => {
//     setLoading(true);
//     try {
//       // TODO: backend order API, print, etc.
//       setFinalTotal(total);
//       setFinalBalance(balance);
//       setShowDrawerModal(false);
//       setShowSuccessModal(true);
//       await clear();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleNewOrder = () => {
//     setShowSuccessModal(false);
//     navigate("/pos");
//   };

//   const handleMethodSelect = (method: string) => {
//     setSelectedMethod(method);
//     if (window.innerWidth < 1024) setShowPaymentMethods(false);
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-background text-foreground flex h-screen overflow-hidden safe-area">
//       {/* 🟦 Left Action Rail (Figma) */}
//       <div className="hidden lg:block">
//         <LeftActionRail onBackToMenu={() => navigate("/pos")} />
//       </div>

//       {/* 🧾 Order List (uses CardDineIn inside) */}
//       <div className="hidden lg:block border-r border-border">
//         <OrderSidebar
//           items={items}
//           total={total}
//           isOpen
//           onClose={() => {}}
//           onBackToMenu={() => navigate("/pos")}
//         />
//       </div>

//       {/* Mobile Order Overlay */}
//       {showOrderSummary && (
//         <div className="lg:hidden">
//           <OrderSidebar
//             items={items}
//             total={total}
//             isOpen
//             onClose={() => setShowOrderSummary(false)}
//             onBackToMenu={() => navigate("/pos")}
//           />
//         </div>
//       )}

//       {/* 🔢 Center Section */}
//       <div className="flex-1 flex flex-col h-full overflow-hidden">
//         {/* Mobile header buttons */}
//         <div className="lg:hidden flex gap-2 p-3 border-b border-border bg-muted">
//           <Button
//             onClick={() => setShowOrderSummary(true)}
//             className="flex-1 bg-primary text-primary-foreground"
//           >
//             <Menu className="w-4 h-4 mr-1" />
//             {t("order")}
//           </Button>
//           <Button
//             onClick={() => setShowPaymentMethods(true)}
//             className="flex-1 bg-primary text-primary-foreground"
//           >
//             <CreditCard className="w-4 h-4 mr-1" />
//             {t(selectedMethod)}
//           </Button>
//         </div>

//         {/* Main payment area */}
//         <div className="flex-1 overflow-y-auto p-4 lg:p-6">
//           <div className="max-w-2xl mx-auto flex flex-col h-full gap-4">
//             {/* Totals */}
//             <div className="bg-muted p-4 rounded-xl border border-border">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <div className="text-sm text-muted-foreground">
//                     {t("total")}
//                   </div>
//                   <div className="text-3xl font-bold text-primary">
//                     ${total.toFixed(2)}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-muted-foreground">
//                     {t("balance")}
//                   </div>
//                   <div className="text-3xl font-bold text-accent">
//                     ${balance >= 0 ? balance.toFixed(2) : "0.00"}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Tender input */}
//             <div>
//               <label className="block text-sm text-muted-foreground mb-1">
//                 {t("tender_amount")}
//               </label>
//               <input
//                 className="w-full border border-input bg-background rounded-xl p-3 text-2xl font-semibold focus:ring-2 ring-ring outline-none"
//                 value={inputValue}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (/^\d*\.?\d*$/.test(val)) setInputValue(val);
//                 }}
//                 onBlur={() => {
//                   const num = parseFloat(inputValue);
//                   if (!isNaN(num)) setInputValue(num.toFixed(2));
//                 }}
//               />
//             </div>

//             {/* Actions */}
//             <div className="grid grid-cols-3 gap-2  ">
//               <Button
//                 onClick={handlePaymentAction}
//                 className="bg-primary text-primary-foreground"
//               >
//                 {t("All")}
//               </Button>
//               <Button variant="outline" disabled>
//                 {t("split")}
//               </Button>
//               <Button variant="outline" disabled>
//                 {t("divide")}
//               </Button>
//             </div>

//             {/* Quick amounts */}
//             <div className="grid grid-cols-3 gap-2">
//               {[10, 25, 50].map((amt) => (
//                 <Button
//                   key={amt}
//                   variant="outline"
//                   onClick={() => handleQuickAmount(amt)}
//                 >
//                   ${amt}
//                 </Button>
//               ))}
//             </div>

//             {/* Keypad */}
//             <div className="flex-1 flex justify-evenly ">
//               <div className="grid grid-cols-3 gap-2 ">
//                 {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "."].map(
//                   (key) => (
//                     <button
//                       key={key}
//                       onClick={() => handleKeyPress(key)}
//                       className={`w-30 h-26 text-xl font-bold rounded-xl border border-border bg-muted hover:bg-primary-hover transition ${
//                         key === "C"
//                           ? "bg-destructive text-destructive-foreground hover:bg-destructive/80"
//                           : ""
//                       }`}
//                     >
//                       {key}
//                     </button>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 💳 Payment Methods (Desktop) */}
//       <div className="hidden lg:block border-l border-border">
//         <PaymentMethodsSidebar
//           selectedMethod={selectedMethod}
//           isOpen
//           onClose={() => {}}
//           onMethodSelect={handleMethodSelect}
//           onCancel={() => navigate("/pos")}
//         />
//       </div>

//       {/* Mobile Methods Overlay */}
//       {showPaymentMethods && (
//         <PaymentMethodsSidebar
//           selectedMethod={selectedMethod}
//           isOpen={showPaymentMethods}
//           onClose={() => setShowPaymentMethods(false)}
//           onMethodSelect={handleMethodSelect}
//           onCancel={() => navigate("/pos")}
//         />
//       )}

//       {/* Modals */}
//       {showDrawerModal && (
//         <DrawerOpenedModal
//           isOpen={showDrawerModal}
//           loading={loading}
//           onCompleteOrder={handleCompleteOrder}
//         />
//       )}

//       <PaymentSuccessModal
//         isOpen={showSuccessModal}
//         total={finalTotal}
//         balance={finalBalance}
//         onPrintReceipt={() => console.log("print")}
//         onNewOrder={handleNewOrder}
//       />
//     </div>
//   );
// }

import { useMediaQuery } from "usehooks-ts";
import PaymentMobile from "./mobile/PaymentMobile";
import PaymentDesktop from "./PaymentDesktop";


export default function PaymentPanel() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return isDesktop ? <PaymentDesktop /> : <PaymentMobile />;
}

