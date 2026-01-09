import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useSearchParams, useNavigate } from "react-router-dom";

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
import { setupLocal } from "@/services/local/setup.local.service";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [booting, setBooting] = useState(true);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [, setDeviceId] = useState<string>("");
  const [windowRole, setWindowRole] = useState<DeviceRole | null>(null);
  const [isSecondaryWindow, setIsSecondaryWindow] = useState(false);
  const [isSwitchingDevice, setIsSwitchingDevice] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "synced">("syncing");

  // Check for role parameter in URL
  useEffect(() => {
    const roleParam = searchParams.get('role') as DeviceRole;
    if (roleParam && ['POS', 'KDS', 'KIOSK', 'QUEUE'].includes(roleParam)) {
      console.log('[App] Window role from URL:', roleParam);
      setWindowRole(roleParam);
      setIsSecondaryWindow(true); // Mark as secondary window
    }
  }, [searchParams]);

  /* BOOTSTRAP */
  useEffect(() => {
    async function bootstrap() {
      const state: AppState = await appStateApi.get();
      dispatch(hydrateAppState(state));
      await refreshAppStateContext();

      let device = await deviceService.getDevice();

      // If this is a role-specific window, create device for that role if needed
      if (windowRole && !device) {
        console.log(`[App] Creating device for ${windowRole} window`);
        device = await deviceService.registerDevices({
          name: `${windowRole}-Device-${Date.now()}`,
          role: windowRole
        });
      } else if (!device && state.device_role) {
        console.log("[App] No device found but role exists, creating device");
        device = await deviceService.registerDevices({
          name: `${state.device_role}-Device-${Date.now()}`,
          role: state.device_role
        });
      }

      if (device) {
        setDeviceId(device.id);
        console.log("[App] Device ID set to:", device.id);
      }

      setBooting(false);
    }
    bootstrap();
  }, [dispatch, refreshAppStateContext, windowRole]);

  // Handle device role switching (without losing data)
  const handleSwitchRole = useCallback(async (newRole: DeviceRole) => {
    console.log("[App] Switching device role to:", newRole);
    setIsSwitchingDevice(true);

    try {
      // Update device role in backend (this preserves all other data)
      await appStateApi.setDeviceRole(newRole);

      // Update Redux state
      dispatch(setDeviceRole(newRole));

      // Refresh context
      await refreshAppStateContext();

      // Navigate to the new role's route (replace history to prevent back button going to previous role)
      const routeMap: Record<DeviceRole, string> = {
        POS: "/pos",
        KDS: "/kds",
        KIOSK: "/kiosk",
        QUEUE: "/queue",
      };

      navigate(routeMap[newRole] || "/", { replace: true });

      console.log("[App] Successfully switched to", newRole);
    } catch (error) {
      console.error("[App] Failed to switch role:", error);
    } finally {
      setIsSwitchingDevice(false);
    }
  }, [dispatch, navigate, refreshAppStateContext]);

  // Listen for device switch events from sidebar
  useEffect(() => {
    const unsubscribe = localEventBus.subscribe(
      LocalEventTypes.DEVICE_SWITCH_ROLE,
      (event) => {
        const { role } = event.payload as { role: DeviceRole };
        if (role) {
          handleSwitchRole(role);
        }
      }
    );

    return () => unsubscribe();
  }, [handleSwitchRole]);

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
          channel: windowRole || appState.device_role || "POS",
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
        channel: windowRole || appState.device_role || "POS",
        locationId: location.id,
        brandId: location.brand_id,
        orderModeIds,
      });

      setSyncStatus("synced");
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

  const handleRoleSelected = async (role: DeviceRole, setup: any) => {
    setLoadingRole(true);

    try {
      // Only set device role in DB for the first role (main window)
      if (!appState.device_role) {
        await appStateApi.setDeviceRole(role);
        dispatch(setDeviceRole(role));
      }
      
      await appStateApi.setSetupCode(setup.code);
      await refreshAppStateContext();

      let device = await deviceService.getDevice();
      if (!device) {
        device = await deviceService.registerDevices({
          name: `${role}-Device-${Date.now()}`,
          role,
        });
      }
      setDeviceId(device.id);

      await setupLocal.save({
        id: setup.id,
        code: setup.code,
        name: setup.name,
        setup_type: setup.setup_type,
        channel: setup.channel,
        settings: setup.settings,
        country_code: setup.country?.code ?? null,
        currency_code: setup.currency?.code ?? null,
        currency_symbol: setup.currency?.symbol ?? null,
        active: setup.active ? 1 : 0,
        sort_order: setup.sort_order ?? 0,
        created_at: setup.created_at,
        updated_at: setup.updated_at,
      });

      // If configuring POS, it will start the WebSocket server
      if (role === "POS") {
        // setTimeout(() => window.location.reload(), 500);
        return;
      }
    } catch (err) {
      console.error("handleRoleSelected error:", err);
    } finally {
      setTimeout(() => setLoadingRole(false), 500);
    }
  };

  if (booting || isSwitchingDevice) {
    return <SplashScreen type={1} />;
  }

  // Secondary windows (opened via open_role_window) skip auth checks
  if (isSecondaryWindow && windowRole) {
    if (!appState.tenant_domain || !appState.selected_location_id) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Configuration Required
            </h2>
            <p className="text-gray-600">
              Please configure the main window first before opening {windowRole} window.
            </p>
          </div>
        </div>
      );
    }

    // Directly render the routes for secondary windows
    return (
      <Routes>
        <Route path="/" element={<RoleRouter overrideRole={windowRole} />} />
        <Route path="/pos/*" element={<PosRoutes />} />
        <Route path="/kiosk/*" element={<KioskRoutes />} />
        <Route path="/kds/*" element={<KdsRoutes />} />
        <Route path="/queue/*" element={<QueueRoutes />} />
      </Routes>
    );
  }

  // Main window flow (normal authentication)
  if (loadingTenant) {
    return <SplashScreen type={1} />;
  }

  if (!appState.tenant_domain) {
    return <TenantLogin onTenantSelected={handleTenantSelected} />;
  }

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

  // Check if we need to show role selection (main window only)
  const effectiveRole = appState.device_role;

  if (!effectiveRole) {
    return (
      <Home
        tenantDomain={appState.tenant_domain!}
        accessToken={appState.access_token!}
        onRoleSelected={handleRoleSelected}
      />
    );
  }

  // Render routes based on the effective role
  return (
    <Routes>
      <Route path="/" element={<RoleRouter overrideRole={null} />} />
      <Route path="/pos/*" element={<PosRoutes />} />
      <Route path="/kiosk/*" element={<KioskRoutes />} />
      <Route path="/kds/*" element={<KdsRoutes />} />
      <Route path="/queue/*" element={<QueueRoutes />} />
    </Routes>
  );
}