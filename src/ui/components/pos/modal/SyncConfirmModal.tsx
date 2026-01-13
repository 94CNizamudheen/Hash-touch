import { useState } from "react";
import { useNotification } from "@/ui/context/NotificationContext";
import { useTranslation } from "react-i18next";
import { FaSync } from "react-icons/fa";
import { isOnline } from "@/ui/utils/networkDetection";

export default function SyncConfirmModal({
    onClose,
    onConfirm,
}: {
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
}) {
    const { showNotification } = useNotification();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmSync = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            if (!(await isOnline())) {
                showNotification.error(t("Network not detected, check connection"));
                return;
            }
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Sync failed:", error);
            showNotification.error(
                t("Sync failed. Please try again.")
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[550px] p-8 shadow-2xl">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                    {isLoading ? (
                        <svg
                            className="w-8 h-8 text-blue-600 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                    ) : (
                        <FaSync />
                    )}
                </div>

                <h2 className="text-xl font-bold text-center mb-3 text-gray-900">
                    {t("Sync Data?")}
                </h2>



                <p className="text-center text-sm text-orange-600 mb-8">
                    {t("Are you sure to sync data.")}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 border-2 border-gray-300 text-gray-700 font-medium rounded-lg py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t("Cancel")}
                    </button>

                    <button
                        onClick={handleConfirmSync}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white font-medium rounded-lg py-3 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t("Syncing...") : t("Start Sync")}
                    </button>
                </div>
            </div>
        </div>
    );
}
