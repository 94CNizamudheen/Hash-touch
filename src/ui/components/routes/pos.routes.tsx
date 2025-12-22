import { Routes, Route, Navigate } from "react-router-dom";
import MenuLayout from "../pos/layouts/MenuLayout";

import { CartProvider } from "@/ui/context/CartContext";
import { ProductProvider } from "@/ui/context/ProductContext";
import { AnimationProvider } from "@/ui/context/AnimationContext";

import MenuSelectionPage from "../pos/menu-selection/MenuSelectionPage";
import PaymentPanel from "../pos/checkout/PaymentPanel";

export default function PosRoutes() {
  return (
    <CartProvider>
      <ProductProvider>
        <AnimationProvider>
          <Routes>
            {/* Layout route */}
            <Route element={<MenuLayout />}>
              {/* default page → /pos */}
              <Route index element={<MenuSelectionPage tempStyle={false} />} />
            </Route>
            <Route path="payment-panel" element= {<PaymentPanel  />} />

            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </AnimationProvider>
      </ProductProvider>
    </CartProvider>
  );
}
