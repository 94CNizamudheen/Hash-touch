
import { Routes, Route, Navigate } from "react-router-dom";
import QueueDisplay from "../components/queue/Queue";
import { QueueWebSocketProvider } from "../context/QueueWebSocketContext";
import { LogoutProvider } from "../context/LogoutContext";



export default function QueueRoutes() {
  return (
    <LogoutProvider>
      <QueueWebSocketProvider>
        <Routes>
          <Route index element={<QueueDisplay />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </QueueWebSocketProvider>
    </LogoutProvider>

  );
}
