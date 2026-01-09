import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppState } from "@/ui/hooks/useAppState";
import type { DeviceRole } from "@/types/app-state";

interface RoleGuardProps {
  allowedRole: DeviceRole;
  children: React.ReactNode;
}

/**
 * RoleGuard - Ensures user can only access pages for their current device role
 * If user tries to access a different role's page (e.g., via browser back button),
 * they will be redirected to their current role's page.
 */
export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, loading } = useAppState();

  const currentRole = state?.device_role;

  useEffect(() => {
    // Wait for app state to load
    if (loading) return;

    // If no role set, don't guard (let App.tsx handle it)
    if (!currentRole) return;

    // If trying to access a page for a different role, redirect to current role
    if (currentRole !== allowedRole) {
      console.log(
        `[RoleGuard] Access denied to ${allowedRole} page. Current role is ${currentRole}. Redirecting...`
      );

      const routeMap: Record<DeviceRole, string> = {
        POS: "/pos",
        KDS: "/kds",
        KIOSK: "/kiosk",
        QUEUE: "/queue",
      };

      navigate(routeMap[currentRole] || "/", { replace: true });
    }
  }, [currentRole, allowedRole, navigate, loading, location.pathname]);

  // Don't render children if role doesn't match (prevents flash of wrong content)
  if (loading) {
    return null;
  }

  if (currentRole && currentRole !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
