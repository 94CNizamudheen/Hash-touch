
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { deviceService, type DeviceRole } from "@services/local/device.local.service";

const RoleRouter = () => {
  const [role, setRole] = useState<DeviceRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deviceService
      .getDevice()
      .then((device) => {
        if (device) {
          setRole(device.role);
          (window as any).screenType = device.role;
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading device…</div>;

  switch (role) {
    case "POS":
      return <Navigate to="/pos" replace />;
    case "KIOSK":
      return <Navigate to="/kiosk" replace />;
    case "KDS":
      return <Navigate to="/kds" replace />;
    case "QUEUE":
      return <Navigate to="/queue" replace />;
    default:
      return <div>No device configured</div>;
  }
};

export default RoleRouter;
