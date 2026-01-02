import { Routes, Route, Navigate } from "react-router-dom";
import KDSTicketsDesktopLayout from "@/ui/components/kds/layouts/KDSTicketsDesktopLayout";
import Tickets from "@/ui/components/kds/tickets/Tickets";
import KdsSettingsPage from "@/ui/components/kds/settings/KdsSettingsPage";
import KdsConnectionPage from "@/ui/components/kds/settings/KdsConnectionPage";
import { KdsSettingsProvider } from "../context/KdsSettingsContext";

export default function KdsRoutes() {
  return (
    <KdsSettingsProvider>
      <Routes>
        <Route element={<KDSTicketsDesktopLayout />}>
          <Route index element={<Tickets />} />
          <Route path="settings" element={<KdsSettingsPage />} />
        </Route>
        <Route path="settings/connection" element={<KdsConnectionPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </KdsSettingsProvider>
  );
}
