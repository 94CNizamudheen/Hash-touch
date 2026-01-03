import { useState } from "react";
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { useLogoutGuard } from "@/ui/hooks/useLogoutGuard";
import { useNotification } from "@/ui/context/NotificationContext";
import { useTranslation } from "react-i18next";

export default function EndShiftConfirmModal({
  onClose,
  onConfirm
}: {
  onClose:()=>void;
  onConfirm?: () => void;
}) {
  const { endShift } = useWorkShift();
  const { checkBlocks } = useLogoutGuard();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[400px] p-8 shadow-2xl">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          {isLoading ? (
            <svg className="w-8 h-8 text-red-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-bold text-center mb-3 text-gray-900">
          End Work Shift?
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Are you sure you want to end the current shift?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-medium rounded-lg py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                // Check for pending syncs before ending shift
                const blocks = await checkBlocks();
                if (blocks.totalSyncs > 0) {
                  showNotification.info(t("Please wait for pending syncs to complete before closing shift"), 4000);
                  return;
                }

                // All clear, proceed with ending shift
                await endShift("Admin");
                onClose();
                onConfirm?.();
              } catch (error) {
                console.error("Failed to end shift:", error);
                showNotification.error("Failed to end shift. Please try again.");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white font-medium rounded-lg py-3 hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Ending..." : "End Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}
