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

const ModalDepartment = ({
  isModal,
  onClose,
  onSelect,
}: {
  isModal: boolean;
  onClose: () => void;
  onSelect: (mode: { id: string, name: string }) => void;
}) => {
  const { state: appState, loading } = useAppState();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [choose, setChoose] = useState<string | null>(null);

  if (loading) return null;

  const orderModes =
    appState?.order_mode_names?.map((name, idx) => ({
      id: appState.order_mode_ids?.[idx] ?? String(idx),
      title: name,
    })) ?? [];

  return (
    <Sheet open={isModal} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="max-h-[90%] sm:max-h-[70%] my-auto rounded-r-2xl p-8 sm:w-auto"
      >
        <SheetHeader className="border-b border-accent px-4 sm:px-5 pb-1 sm:pb-4">
          <SheetTitle className="text-foreground font-semibold text-sm sm:text-base md:text-lg">
            What would you like to do?
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100%-140px)] sm:h-[80%] mt-6 sm:mt-10 px-4 sm:px-5 overflow-y-auto ">
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-3 sm:gap-4 md:gap-5">
            {orderModes.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground">
                No order modes available
              </p>
            ) : (
              orderModes.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setChoose((prev) =>
                      prev === item.id ? null : item.id
                    )
                  }
                  className={cn(
                    "col-span-4 sm:col-span-4 md:col-span-6 h-12 sm:h-14 rounded-lg flex items-center justify-center cursor-pointer text-xs sm:text-sm md:text-base font-medium transition-colors",
                    item.id === choose
                      ? "bg-primary text-background"
                      : "bg-accent-foreground text-black hover:bg-accent-foreground/80"
                  )}
                >
                  {item.title}
                </button>
              ))
            )}
          </div>
        </div>

        <SheetFooter className="px-4 sm:px-5 flex-col sm:flex-row gap-2 sm:gap-0">
          <SheetClose asChild>
            <Button
              type="button"
              className="bg-accent-foreground text-black dark:text-white w-full sm:w-auto"
            >
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="button"
            disabled={choose === null}
            onClick={() => {
              if (!choose) return;
              const mode = orderModes.find((m) => m.id === choose);
              if (!mode) {
                console.warn("Selected mode not found:", choose);
                return;
              }
              console.log("🟦 Selected order mode:", mode.id);
              onSelect({ id: mode.id, name: mode.title });
              showNotification.success(`${t("Order mode changed to")} ${mode.title}`, 2000);
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            Save
          </Button>

        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ModalDepartment;
