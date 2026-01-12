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
import { ChefHat, Users, ShoppingCart } from "lucide-react";
import type { DeviceRole } from "@/types/app-state";

const DEVICE_ROLES: {
  key: DeviceRole;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "POS",
    label: "Point of Sale",
    icon: <ShoppingCart className="w-5 h-5 stroke-primary" />,
  },
  {
    key: "KDS",
    label: "Kitchen Display",
    icon: <ChefHat className="w-5 h-5 stroke-primary" />,
  },
  {
    key: "QUEUE",
    label: "Queue Display",
    icon: <Users className="w-5 h-5 stroke-primary" />,
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
        className="max-h-[50%] my-auto rounded-r-2xl p-8 sm:w-auto bg-secondary"
      >
        {/* ===== Header ===== */}
        <SheetHeader className="border-b border-accent px-4 sm:px-5 pb-1 sm:pb-4">
          <SheetTitle className="text-foreground font-semibold text-sm sm:text-base md:text-lg">
            {t("Switch Device Mode")}
          </SheetTitle>
        </SheetHeader>

        {/* ===== Role List ===== */}
        <div className="mt-6 sm:mt-10 px-4 sm:px-5 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {availableRoles.map((role) => (
              <button
                key={role.key}
                onClick={() => handleRoleSelect(role)}
                className={cn(
                  "w-full p-4 rounded-lg flex items-center gap-4 cursor-pointer transition-all",
                  "border-2 rtl:flex-row-reverse",
                  "bg-sidebar-hover hover:bg-primary hover:text-primary-foreground border-transparent"
                )}
              >
                <div className="p-2 rounded-lg bg-background">
                  {role.icon}
                </div>

                <div className="text-left rtl:text-right">
                  <p className="font-medium">
                    {t(role.label)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {role.key}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SwitchDeviceModal;
