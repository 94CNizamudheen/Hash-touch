import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/ui/shadcn/components/ui/sheet";
import { Button } from "@/ui/shadcn/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    key: "KDS",
    label: "Kitchen Display",
    icon: <ChefHat className="w-5 h-5" />,
  },
  {
    key: "QUEUE",
    label: "Queue Display",
    icon: <Users className="w-5 h-5" />,
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
  const [selectedRole, setSelectedRole] = useState<DeviceRole | null>(null);

  if (loading) return null;

  const currentRole = appState?.device_role;

  // Show all roles except current one
  const availableRoles = DEVICE_ROLES.filter(
    (r) => r.key !== currentRole
  );

  const handleSwitch = () => {
    if (!selectedRole) return;

    const role = DEVICE_ROLES.find((r) => r.key === selectedRole);
    if (!role) return;

    showNotification.info(
      `${t("Switching to")} ${t(role.label)}...`,
      2000
    );

    onSwitch(selectedRole);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="max-h-[90%] sm:max-h-[70%] my-auto rounded-r-2xl p-8 sm:w-auto bg-secondary"
      >
        {/* ===== Header ===== */}
        <SheetHeader className="border-b border-accent px-4 sm:px-5 pb-1 sm:pb-4">
          <SheetTitle className="text-foreground font-semibold text-sm sm:text-base md:text-lg">
            {t("Switch Device Mode")}
          </SheetTitle>
        </SheetHeader>

        {/* ===== Role List ===== */}
        <div className="h-[calc(100%-140px)] sm:h-[80%] mt-6 sm:mt-10 px-4 sm:px-5 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {availableRoles.map((role) => (
              <button
                key={role.key}
                onClick={() => setSelectedRole(role.key)}
                className={cn(
                  "w-full p-4 rounded-lg flex items-center gap-4 cursor-pointer transition-all",
                  "border-2 rtl:flex-row-reverse",
                  selectedRole === role.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-sidebar-hover hover:bg-accent/80 border-transparent"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    selectedRole === role.key
                      ? "bg-primary-foreground/20"
                      : "bg-background"
                  )}
                >
                  {role.icon}
                </div>

                <div className="text-left rtl:text-right">
                  <p className="font-medium">
                    {t(role.label)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      selectedRole === role.key
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {role.key}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ===== Footer ===== */}
        <SheetFooter className="px-4 sm:px-5 flex-col sm:flex-row gap-2 sm:gap-0 rtl:flex-row-reverse">
          <SheetClose asChild>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
            >
              {t("Cancel")}
            </Button>
          </SheetClose>

          <Button
            type="button"
            disabled={!selectedRole}
            onClick={handleSwitch}
            className="w-full sm:w-auto"
          >
            {t("Switch")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SwitchDeviceModal;
