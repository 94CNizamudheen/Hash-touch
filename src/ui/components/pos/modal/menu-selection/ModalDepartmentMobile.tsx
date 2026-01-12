import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAppState } from "@/ui/hooks/useAppState";
import { useNotification } from "@/ui/context/NotificationContext";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (mode: { id: string; name: string }) => void;
};

const ModalDepartmentMobile = ({ open, onClose, onSelect }: Props) => {
  const { state: appState, loading } = useAppState();
  const { showNotification } = useNotification();
  const { t } = useTranslation();


  if (loading) return null;

  const orderModes =
    appState?.order_mode_names?.map((name, idx) => ({
      id: appState.order_mode_ids?.[idx] ?? String(idx),
      title: name,
    })) ?? [];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* MODAL */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="
              fixed z-50 inset-x-4 top-1/2 -translate-y-1/2
              max-h-[85vh]
              bg-background rounded-2xl shadow-xl
              flex flex-col
            "
          >
            {/* HEADER */}
            <div className="relative px-5 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-primary">
                {t("Departments")}
              </h2>

              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-muted p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BODY */}
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {orderModes.length === 0 ? (
                  <p className="col-span-full text-center text-muted-foreground">
                    {t("No order modes available")}
                  </p>
                ) : (
                  orderModes.map((mode) => {


                    return (
                      <button
                        key={mode.id}
                        onClick={() => {

                          onSelect({
                            id: mode.id,
                            name: mode.title,
                          });

                          showNotification.success(
                            `${t("Order mode changed to")} ${mode.title}`,
                            1500
                          );

                          onClose();
                        }}
                        className={cn(
                          `
                          h-14 rounded-xl
                          flex items-center justify-center
                          text-sm font-semibold
                          transition-all
                          active:scale-95 bg-primary text-white
                          `,
                          
                        )}
                      >
                        {mode.title}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModalDepartmentMobile;
