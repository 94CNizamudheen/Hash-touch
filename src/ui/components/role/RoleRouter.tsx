import { useEffect, useState } from "react";
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).screenType = device.role;
          console.log("📺 screenType =", device.role);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading device…</div>;

  switch (role) {
    case "POS":
      return <div>POS Screen</div>;
    case "KIOSK":
      return <div>Kiosk Screen</div>;
    case "QUEUE":
      return <div>Queue Screen</div>;
    case "KDS":
      return <div>KDS Screen</div>;
    default:
      return <div>No device configured</div>;
  }
};

export default RoleRouter;
