import { Routes, Route, Navigate } from "react-router-dom";
import MenuLayout from "../components/pos/layouts/MenuLayout";

import { CartProvider } from "@/ui/context/CartContext";
import { ProductProvider } from "@/ui/context/ProductContext";
import { AnimationProvider } from "@/ui/context/AnimationContext";

import MenuSelectionPage from "../components/pos/menu-selection/MenuSelectionPage";
import PaymentPanel from "../components/pos/checkout/PaymentPanel";
import { WorkShiftProvider } from "../context/WorkShiftContext";
import { LogoutProvider } from "../context/LogoutContext";
import ActivityPage from "../components/pos/activity/ActivityPage";
import SettingsPage from "../components/pos/settings/SettingsPage";
import PrinterSettingsPage from "../components/pos/printer/PrinterSettingsPage";
import DeviceCommunicationPage from "../components/pos/settings/DeviceCommunicationPage";


export default function PosRoutes() {
  return (
    <LogoutProvider>
      <CartProvider>
        <ProductProvider>
          <AnimationProvider>
            <WorkShiftProvider>

              <Routes>
                <Route element={<MenuLayout />}>
                  <Route index element={<MenuSelectionPage />} />
                  <Route path="activity" element={<ActivityPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="settings/printers" element={<PrinterSettingsPage />} />
                  <Route path="settings/devices" element={<DeviceCommunicationPage />} />

                </Route>
                <Route path="payment-panel" element={<PaymentPanel />} />

                <Route path="*" element={<Navigate to="" replace />} />
              </Routes>
            </WorkShiftProvider>

          </AnimationProvider>
        </ProductProvider>
      </CartProvider>
    </LogoutProvider>
  );
}
