import { Routes, Route, Navigate } from "react-router-dom";

const KdsHome = () => <div>KDS Screen</div>;

export default function KdsRoutes() {
  return (
    <Routes>
      <Route index element={<KdsHome />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
