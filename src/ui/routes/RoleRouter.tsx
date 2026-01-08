import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/ui/hooks/useAppState";
import type { DeviceRole } from "@/types/app-state";

interface RoleRouterProps {
  overrideRole?: DeviceRole | null;
}

export default function RoleRouter({ overrideRole }: RoleRouterProps) {
  const navigate = useNavigate();
  const { state } = useAppState();
  
  // Use override role if provided, otherwise use app state role
  const role = overrideRole || state.device_role;

  useEffect(() => {
    if (!role) {
      console.warn("[RoleRouter] No role found");
      return;
    }

    console.log(`[RoleRouter] Routing to: /${role.toLowerCase()}`);
    navigate(`/${role.toLowerCase()}`, { replace: true });
  }, [role, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading {role}...</p>
      </div>
    </div>
  );
}