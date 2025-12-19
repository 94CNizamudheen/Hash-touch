
import { Routes, Route, Navigate } from "react-router-dom";

const QueueHome = () => <div>Queue Display</div>;

export default function QueueRoutes() {
  return (
    <Routes>
      <Route index element={<QueueHome />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
