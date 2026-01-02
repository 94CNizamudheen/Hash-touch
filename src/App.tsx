
import { useEffect, useState, useRef } from "react";
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

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced">("syncing");

  // WebSocket state
  const [wsReady, setWsReady] = useState(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "failed" | "retrying">("connecting");
  const [wsRetryCount, setWsRetryCount] = useState(0);
  const wsInitializedRef = useRef(false);
  const wsInitFunctionRef = useRef<(() => void) | null>(null);

  /* =========================
     BOOTSTRAP (Rust → Redux)
  ========================= */
  useEffect(() => {
    async function bootstrap() {
      const state: AppState = await appStateApi.get();
      dispatch(hydrateAppState(state));
      await refreshAppStateContext();
      let device = await deviceService.getDevice();
      if (!device && state.device_role) {
        console.log("[App] No device found but role exists, creating device with role:", state.device_role);
        device = await deviceService.registerDevices({
          name: `${state.device_role}-Device-${Date.now()}`,
          role: state.device_role
        });
        console.log("[App] Created device:", device.id);
      }

      if (device) {
        setDeviceId(device.id);
        console.log("[App] Device ID set to:", device.id);
      } else {
        console.log("[App] No device found and no role set yet");
      }

      setBooting(false);
    }
    bootstrap();
  }, [dispatch, refreshAppStateContext]);

  useEffect(() => {
    const initializeWebSocket = async () => {
      setWsStatus("connecting");
      setWsReady(false);

      const maxRetries = 5;
      let attempts = 0;

      const attemptConnection = async (): Promise<boolean> => {
        try {
          const [_, configuredWsUrl] = await appStateApi.getWsSettings();
          const wsUrl = configuredWsUrl || "ws://localhost:9001";

          console.log(`[App] Connecting to: ${wsUrl}`);

          const client = new WebSocketClient(
            wsUrl,
            deviceId,
            appState.device_role || "POS"
          );

          await client.connect();
          await client.waitForRegisterAck();

          websocketService.setClient(client);

          setWsStatus("connected");
          setWsReady(true);

          return true;
        } catch (error) {
          attempts++;

          console.error(`❌ WS failed (${attempts}/${maxRetries})`, error);

          if (attempts < maxRetries) {
            setWsStatus("retrying");
            setWsRetryCount(attempts);
            await new Promise((r) => setTimeout(r, 3000));
            return attemptConnection();
          }

          setWsStatus("failed");
          return false;
        }
      };


      await attemptConnection();
    };

    // Store function in ref for retry handler
    wsInitFunctionRef.current = initializeWebSocket;

    if (
      appState.device_role &&
      deviceId &&
      appState.selected_location_id &&
      !wsInitializedRef.current &&
      !booting
    ) {
      console.log("[App] ✅ All conditions met! Initializing WebSocket...");
      wsInitializedRef.current = true;
      initializeWebSocket();
    } else {
      console.log("[App] ❌ Conditions not met, skipping initialization");
    }
  }, [appState.device_role, deviceId, appState.selected_location_id, booting]);



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

      // Start syncing
      setIsSyncing(true);
      setSyncStatus("syncing");

      await initialSync(appState.tenant_domain, appState.access_token, {
        channel: appState.device_role ?? "POS",
        locationId: location.id,
        brandId: location.brand_id,
        orderModeIds,
      });

      // Sync complete
      setSyncStatus("synced");

      // Show synced message briefly
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      setIsSyncing(false);
      setLoadingLocation(false);
    }
  };

  const handleRoleSelected = async (role: DeviceRole) => {
    setLoadingRole(true);
    try {
      await appStateApi.setDeviceRole(role);
      dispatch(setDeviceRole(role));
      await refreshAppStateContext();

      let device = await deviceService.getDevice();
      if (!device) {
        console.log("[App] Creating new device with role:", role);
        device = await deviceService.registerDevices({
          name: `${role}-Device-${Date.now()}`,
          role: role
        });
        console.log("[App] Created device:", device.id);
      }
      setDeviceId(device.id);

      if (role === "POS") {

        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
    } finally {

      setTimeout(() => setLoadingRole(false), 500);
    }
  };

  const handleWebSocketRetry = () => {
    // Reset the ref to allow re-initialization
    wsInitializedRef.current = false;
    setWsRetryCount(0);
    // Call the initialization function
    if (wsInitFunctionRef.current) {
      wsInitFunctionRef.current();
    }
  };



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

  // Show syncing screen during initial sync
  if (isSyncing) {
    return <SplashScreen type={4} syncStatus={syncStatus} />;
  }
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
  if (loadingRole) {
    return <SplashScreen type={1} />;
  }

  if (!appState.device_role) {
    return <Home onRoleSelected={handleRoleSelected} />;
  }

  if (!wsReady) {
    return (
      <SplashScreen
        type={3}
        connectionStatus={wsStatus}
        retryCount={wsRetryCount}
        onRetry={handleWebSocketRetry}
      />
    );
  }

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
