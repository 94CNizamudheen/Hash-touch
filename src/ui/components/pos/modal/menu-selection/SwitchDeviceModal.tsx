import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAppState } from "@/ui/hooks/useAppState";
import { useNotification } from "@/ui/context/NotificationContext";
import { useTranslation } from "react-i18next";
import { ChefHat, Users, ShoppingCart, Monitor } from "lucide-react";
import type { DeviceRole } from "@/types/app-state";

const DEVICE_ROLES: {
  key: DeviceRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: "POS",
    label: "Point of Sale",
    description: "Take orders & process payments",
    icon: <ShoppingCart className="w-5 h-5" />,
    color: "text-primary",
  },
  {
    key: "KDS",
    label: "Kitchen Display",
    description: "View & manage kitchen orders",
    icon: <ChefHat className="w-5 h-5" />,
    color: "text-warning",
  },
  {
    key: "QUEUE",
    label: "Queue Display",
    description: "Show order status to customers",
    icon: <Users className="w-5 h-5" />,
    color: "text-success",
  },
];

interface SwitchDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitch: (role: DeviceRole) => void;
}

const SwitchDeviceModal = ({
  isOpen,
  onClose,
  onSwitch,
}: SwitchDeviceModalProps) => {
  const { state: appState, loading } = useAppState();
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  if (loading) return null;

  const currentRole = appState?.device_role;

  // Show all roles except current one
  const availableRoles = DEVICE_ROLES.filter(
    (r) => r.key !== currentRole
  );

  const handleRoleSelect = (role: (typeof DEVICE_ROLES)[number]) => {
    showNotification.info(
      `${t("Switching to")} ${t(role.label)}...`,
      2000
    );

    onSwitch(role.key);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="max-h-[60%] my-auto rounded-r-2xl p-0 sm:w-[320px] bg-background border-0 shadow-xl"
      >
        {/* ===== Header ===== */}
        <SheetHeader className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-foreground font-semibold text-base">
                {t("Switch Device")}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("Current")}: {currentRole}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* ===== Role List ===== */}
        <div className="px-4 pb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t("Available Modes")}
          </p>
          <div className="flex flex-col gap-2">
            {availableRoles.map((role) => (
              <button
                key={role.key}
                onClick={() => handleRoleSelect(role)}
                className={cn(
                  "w-full p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all",
                  "rtl:flex-row-reverse",
                  "bg-secondary hover:bg-sidebar-hover active:scale-[0.98]"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  role.key === "POS" && "bg-primary/10",
                  role.key === "KDS" && "bg-warning/10",
                  role.key === "QUEUE" && "bg-success/10"
                )}>
                  <span className={role.color}>{role.icon}</span>
                </div>

                <div className="text-left rtl:text-right flex-1">
                  <p className="font-medium text-sm text-foreground">
                    {t(role.label)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(role.description)}
                  </p>
                </div>

                <svg className="w-4 h-4 text-muted-foreground rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SwitchDeviceModal;
