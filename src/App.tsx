
import  { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";

import TenantLogin from "@/ui/components/auth/TenantLogin";
import SelectLocationPage from "@/ui/components/auth/SelectLocationPage";
import Home from "@/ui/Home";
import RoleRouter from "@/ui/routes/RoleRouter";
import SplashScreen from "@/ui/components/common/SplashScreen";

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
import { useAppState } from "@/ui/hooks/useAppState";
import { deviceService } from "./services/local/device.local.service";
import { WebSocketClient } from "@services/websocket/WebSocketClient";
import { websocketService } from "@services/websocket/websocket.service";


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
  const { refresh: refreshAppStateContext } = useAppState();
  const [booting, setBooting] = useState(true);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  // WebSocket state
  const [wsReady, setWsReady] = useState(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "failed" | "retrying">("connecting");
  const [wsRetryCount, setWsRetryCount] = useState(0);

  /* =========================
     BOOTSTRAP (Rust → Redux)
  ========================= */
  useEffect(() => {
    async function bootstrap() {
      const state: AppState = await appStateApi.get();
      dispatch(hydrateAppState(state));
      await refreshAppStateContext();

      // Get or create device ID
      const device = await deviceService.getDevice();
      if (device) {
        setDeviceId(device.id);
      }

      setBooting(false);
    }
    bootstrap();
  }, [dispatch, refreshAppStateContext]);


  const initializeWebSocket = useCallback(async () => {
    if (!appState.device_role || !deviceId) return;

    console.log("[App] Initializing WebSocket...");
    setWsStatus("connecting");
    setWsReady(false);

    const maxRetries = 5;
    let attempts = 0;

    const attemptConnection = async (): Promise<boolean> => {
      try {
        // The WebSocket server runs as part of the Tauri app (on the same device)
        // So we always connect to localhost, regardless of platform
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:9001";

        const isAndroid = navigator.userAgent.toLowerCase().includes('android');
        console.log(`[App] Platform: ${isAndroid ? 'Android' : 'Desktop'}`);
        console.log(`[App] Connecting to: ${wsUrl} (Attempt ${attempts + 1}/${maxRetries})`);

        const client = new WebSocketClient(wsUrl, deviceId, appState.device_role || "POS");
        await client.connect();

        // Store client in service for global access
        websocketService.setClient(client);

        console.log("✅ WebSocket connected successfully");
        setWsStatus("connected");

        // Give brief moment before transitioning
        setTimeout(() => setWsReady(true), 800);
        return true;
      } catch (error) {
        console.error(`❌ WebSocket connection failed (Attempt ${attempts + 1}):`, error);
        attempts++;

        if (attempts < maxRetries) {
          setWsStatus("retrying");
          setWsRetryCount(attempts);
          console.log(`[App] Retrying in 3s... (${attempts}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return attemptConnection();
        } else {
          setWsStatus("failed");
          return false;
        }
      }
    };

    await attemptConnection();
  }, [appState.device_role, deviceId]);

  // Initialize WebSocket after role is selected
  useEffect(() => {
    if (appState.device_role && deviceId && !wsReady && wsStatus === "connecting") {
      initializeWebSocket();
    }
  }, [appState.device_role, deviceId,wsReady,wsStatus,initializeWebSocket]);

  /* =========================
     HANDLERS
  ========================= */

  const handleTenantSelected = async (domain: string, token: string) => {
    setLoadingTenant(true);
    try {
      await appStateApi.setTenant(domain, token);
      dispatch(
        hydrateAppState({
          ...appState,
          tenant_domain: domain,
          access_token: token,
        })
      );
    } finally {
      setLoadingTenant(false);
    }
  };

  const handleLocationSelected = async (location: Location) => {
    if (!appState.tenant_domain || !appState.access_token) {
      throw new Error("Missing tenant or token");
    }

    setLoadingLocation(true);
    try {
      await appStateApi.setLocation(location.id, location.brand_id, location.name);

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
      const orderModeNames = orderModesResponse.map((om: any) => om.name);
      const defaultMode = orderModesResponse[0];
      await appStateApi.setOrderMode(orderModeIds, orderModeNames, defaultMode.id, defaultMode.name);

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
          selected_location_name: location.name,
          brand_id: location.brand_id,
          order_mode_ids: orderModeIds,
          order_mode_names: orderModeNames,
          selected_order_mode_id: defaultMode.id,
          selected_order_mode_name: defaultMode.name,
        })
      );

      await refreshAppStateContext();
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRoleSelected = async (role: DeviceRole) => {
    setLoadingRole(true);
    try {
      await appStateApi.setDeviceRole(role);
      dispatch(setDeviceRole(role));
      await refreshAppStateContext();
    } finally {
      // Keep loading true until navigation completes
      setTimeout(() => setLoadingRole(false), 500);
    }
  };

  /* =========================
     BOOT / AUTH FLOW
  ========================= */

  if (booting) {
    return <SplashScreen type={1} />;
  }

  // Show loading after tenant login
  if (loadingTenant) {
    return <SplashScreen type={1} />;
  }

  if (!appState.tenant_domain) {
    return <TenantLogin onTenantSelected={handleTenantSelected} />;
  }

  // Show loading after location selection (during initial sync)
  if (loadingLocation) {
    return <SplashScreen type={1} />;
  }

  if (!appState.selected_location_id) {
    return (
      <SelectLocationPage
        onSelect={handleLocationSelected}
        tenantDomain={appState.tenant_domain!}
        accessToken={appState.access_token!}
      />
    );
  }

  // Show loading after role selection
  if (loadingRole) {
    return <SplashScreen type={1} />;
  }

  if (!appState.device_role) {
    return <Home onRoleSelected={handleRoleSelected} />;
  }

  // Show WebSocket connection screen
  if (!wsReady) {
    return (
      <SplashScreen
        type={3}
        connectionStatus={wsStatus}
        retryCount={wsRetryCount}
        onRetry={initializeWebSocket}
      />
    );
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
