import { Routes, Route, Navigate } from "react-router-dom";
import KDSTicketsLayout from "@/ui/components/kds/layouts/KDSTicketsLayout";

export default function KdsRoutes() {
  return (
    <Routes>
      <Route index element={<KDSTicketsLayout />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
