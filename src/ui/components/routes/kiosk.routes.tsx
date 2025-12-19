import { Routes, Route, Navigate } from "react-router-dom";

const KioskHome = () => <div>Kiosk Home</div>;

export default function KioskRoutes() {
  return (
    <Routes>
      <Route index element={<KioskHome />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
