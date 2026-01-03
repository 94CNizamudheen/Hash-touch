// StartShiftModal.tsx
import { useState } from "react";
import { useWorkShift } from "@/ui/context/WorkShiftContext";

export default function StartShiftModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess:()=>void;
}) {
  const { startShift } = useWorkShift();

  const [user] = useState("Admin");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

   return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-secondary rounded-2xl w-full max-w-[500px] p-8 shadow-2xl">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-600 flex items-center justify-center">
          {isLoading ? (
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-gray-900">
          Start Work Shift
        </h2>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Open Till Amount:
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {/* <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-medium rounded-lg py-3 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button> */}
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const amt = Number(amount || 0);
                await startShift(user, amt);
                onClose();
                onSuccess();
              } catch (error) {
                console.error("Failed to start shift:", error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white font-medium rounded-lg py-3 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Starting..." : "Start Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}
