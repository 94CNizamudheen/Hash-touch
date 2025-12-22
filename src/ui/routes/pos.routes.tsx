import { Routes, Route, Navigate } from "react-router-dom";
import MenuLayout from "../components/pos/layouts/MenuLayout";

import { CartProvider } from "@/ui/context/CartContext";
import { ProductProvider } from "@/ui/context/ProductContext";
import { AnimationProvider } from "@/ui/context/AnimationContext";

import MenuSelectionPage from "../components/pos/menu-selection/MenuSelectionPage";
import PaymentPanel from "../components/pos/checkout/PaymentPanel";
import { WorkShiftProvider } from "../context/WorkShiftContext";

export default function PosRoutes() {
  return (
    <CartProvider>
      <ProductProvider>
        <AnimationProvider>
          <WorkShiftProvider>
            <Routes>
              <Route element={<MenuLayout />}>
                <Route index element={<MenuSelectionPage tempStyle={false} />} />
              </Route>
              <Route path="payment-panel" element={<PaymentPanel />} />

              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </WorkShiftProvider>

        </AnimationProvider>
      </ProductProvider>
    </CartProvider>
  );
}
