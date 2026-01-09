import { Routes, Route, Navigate } from "react-router-dom";
import QueueDisplay from "../components/queue/Queue";
import { QueueWebSocketProvider } from "../context/web-socket/QueueWebSocketContext";
import { LogoutProvider } from "../context/LogoutContext";
import QueueConnectionPage from "../components/queue/QueueConnectionPage";
import RoleGuard from "../components/common/RoleGuard";


export default function QueueRoutes() {
  return (
    <RoleGuard allowedRole="QUEUE">
      <LogoutProvider>
        <QueueWebSocketProvider>
          <Routes>
            <Route index element={<QueueDisplay />} />
            <Route path="communication" element={<QueueConnectionPage/>} />
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </QueueWebSocketProvider>
      </LogoutProvider>
    </RoleGuard>
  );
}
