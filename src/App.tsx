
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  Routes, Route } from "react-router-dom";

import TenantLogin from "@/ui/components/auth/TenantLogin";
import SelectLocationPage from "@/ui/components/auth/SelectLocationPage";
import Home from "@/ui/Home";
import RoleRouter from "@/ui/routes/RoleRouter";



import { initialSync } from "@/services/data/initialSync.service";
import { appStateApi } from "@/services/tauri/appState";

import type { AppState, DeviceRole } from "@/types/app-state";
import type { RootState, AppDispatch } from "@/ui/store/store";
import {
  hydrateAppState,
  setDeviceRole,
} from "@/ui/store/slices/appStateSlice";
import { commonDataService } from "./services/data/common.data.service";
import PosRoutes from "./ui/routes/pos.routes";
import KioskRoutes from "./ui/routes/kiosk.routes";
import KdsRoutes from "./ui/routes/kds.routes";
import QueueRoutes from "./ui/routes/queue.routes";


/* =========================
   Types
========================= */
interface Location {
  id: string;
  brand_id: string;
  name: string;
  active: boolean;
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const appState = useSelector((state: RootState) => state.appState);
  const [booting, setBooting] = useState(true);

  /* =========================
     BOOTSTRAP (Rust → Redux)
  ========================= */
  useEffect(() => {
    async function bootstrap() {
      const state: AppState = await appStateApi.get();
      dispatch(hydrateAppState(state));
      setBooting(false);
    }
    bootstrap();
  }, [dispatch]);

  /* =========================
     HANDLERS
  ========================= */

  const handleTenantSelected = async (domain: string, token: string) => {
    await appStateApi.setTenant(domain, token);
    dispatch(
      hydrateAppState({
        ...appState,
        tenant_domain: domain,
        access_token: token,
      })
    );
  };

  const handleLocationSelected = async (location: Location) => {
    if (!appState.tenant_domain || !appState.access_token) {
      throw new Error("Missing tenant or token");
    }

    await appStateApi.setLocation(location.id, location.brand_id);

    const orderModesResponse = await commonDataService.getOrderModes(
      appState.tenant_domain,
      appState.access_token,
      {
        channel: appState.device_role ?? "POS",
        location_id: location.id,
        brand_id: location.brand_id,
      }
    );

    const orderModeIds = orderModesResponse.map((om: any) => om.id);
    await appStateApi.setOrderModeIds(orderModeIds);

    await initialSync(appState.tenant_domain, appState.access_token, {
      channel: appState.device_role ?? "POS",
      locationId: location.id,
      brandId: location.brand_id,
      orderModeIds,
    });

    dispatch(
      hydrateAppState({
        ...appState,
        selected_location_id: location.id,
        brand_id: location.brand_id,
        order_mode_ids: orderModeIds,
      })
    );
  };

  const handleRoleSelected = async (role: DeviceRole) => {
    await appStateApi.setDeviceRole(role);
    dispatch(setDeviceRole(role));
  };

  /* =========================
     BOOT / AUTH FLOW
  ========================= */

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Booting device…
      </div>
    );
  }

  if (!appState.tenant_domain) {
    return <TenantLogin onTenantSelected={handleTenantSelected} />;
  }

  if (!appState.selected_location_id) {
    return <SelectLocationPage onSelect={handleLocationSelected} />;
  }

  if (!appState.device_role) {
    return <Home onRoleSelected={handleRoleSelected} />;
  }

  /* =========================
     ROUTER (ROLE BASED)
  ========================= */

  return (
 
      <Routes>
        {/* Entry: decides where to go */}
        <Route path="/" element={<RoleRouter />} />
        {/* Role route trees */}
        <Route path="/pos/*" element={<PosRoutes />} />
        <Route path="/kiosk/*" element={<KioskRoutes />} />
        <Route path="/kds/*" element={<KdsRoutes />} />
        <Route path="/queue/*" element={<QueueRoutes />} />
      </Routes>
 
  );
}
