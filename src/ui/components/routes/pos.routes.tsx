import { Routes, Route, Navigate } from "react-router-dom";
import MenuLayout from "../pos/layouts/MenuLayout";

import { OrderProvider } from "@/ui/context/OrderContext";
import { ProductProvider } from "@/ui/context/ProductContext";
import { AnimationProvider } from "@/ui/context/AnimationContext";

import MenuSelectionPage from "../pos/menu-selection/MenuSelectionPage";

export default function PosRoutes() {
  return (
    <OrderProvider>
      <ProductProvider>
        <AnimationProvider>
          <Routes>
            {/* Layout route */}
            <Route element={<MenuLayout />}>
              {/* default page → /pos */}
              <Route index element={<MenuSelectionPage tempStyle={false} />} />
            </Route>

            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </AnimationProvider>
      </ProductProvider>
    </OrderProvider>
  );
}
