/* eslint-disable @typescript-eslint/no-explicit-any */
import {  useEffect, useState } from "react";
import TenantLogin from "@ui/components/auth/TenantLogin";

import RoleRouter from "./ui/components/routes/RoleRouter";
import SelectLocationPage from "./ui/components/auth/SelectLocationPage"; 
import { deviceService, type DeviceRole } from "./services/local/device.local.service";
import Home from "./ui/Home";


export default function App() {
  const [tenant, setTenant] = useState<string | null>(() =>
    localStorage.getItem("tenant_domain")
  );

  const [locationId, setLocationId] = useState<string | null>(() =>
    localStorage.getItem("selected_location_id")
  );

   const [deviceRole, setDeviceRole] = useState<DeviceRole | null>(null);
  const [checkingDevice, setCheckingDevice] = useState(true);

  useEffect(() => {
    deviceService
      .getDevice()
      .then((device) => {
        if (device) {
          setDeviceRole(device.role);
          (window as any).screenType = device.role;
        }
      })
      .finally(() => setCheckingDevice(false));
  }, []);


  if (!tenant) {
    return (
      <TenantLogin
        onTenantSelected={(domain) => {
          localStorage.setItem("tenant_domain", domain);
          setTenant(domain);
          
        }}
      />
    );
  }


  if (!locationId) {
    return (
      <SelectLocationPage
        onSelect={(location) => {
          localStorage.setItem("selected_location_id", location.id);
          setLocationId(location.id);
        }}
      />
    );
  }

   if (checkingDevice) {
    return <div className="min-h-screen flex items-center justify-center">Loading device…</div>;
  }
  
  if (!deviceRole) {
    return (
      <Home
        onRoleSelected={(role) => {
          setDeviceRole(role);
          (window as any).screenType = role;
        }}
      />
    );
  }


  return <RoleRouter />;
}
