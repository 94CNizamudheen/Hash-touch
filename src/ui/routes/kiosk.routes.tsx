import { Routes, Route, Navigate } from "react-router-dom";
import RoleGuard from "../components/common/RoleGuard";

const KioskHome = () => <div>Kiosk Home</div>;

export default function KioskRoutes() {
  return (
    <RoleGuard allowedRole="KIOSK">
      <Routes>
        <Route index element={<KioskHome />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </RoleGuard>
  );
}
