import { Routes, Route, Navigate } from "react-router-dom";
import KDSTicketsWrapper from "@/ui/components/kds/layouts/KDSTicketsLayout";
import Tickets from "@/ui/components/kds/tickets/Tickets";
import CompletedTickets from "@/ui/components/kds/tickets/CompletedTickets";
import KdsSettingsPage from "@/ui/components/kds/settings/KdsSettingsPage";
import KdsConnectionPage from "@/ui/components/kds/settings/KdsConnectionPage";
import { KdsSettingsProvider } from "../context/KdsSettingsContext";
import { KdsWebSocketProvider } from "../context/KdsWebSocketContext";

export default function KdsRoutes() {
  return (
    <KdsWebSocketProvider>
      <KdsSettingsProvider>
        <Routes>
          <Route element={<KDSTicketsWrapper />}>
            <Route index element={<Tickets />} />
            <Route path="completed" element={<CompletedTickets />} />
            <Route path="settings" element={<KdsSettingsPage />} />
          </Route>
          <Route path="settings/connection" element={<KdsConnectionPage />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </KdsSettingsProvider>
    </KdsWebSocketProvider>
  );
}
