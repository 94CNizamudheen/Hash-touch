
import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { Check } from "lucide-react";

export default function WorkShiftSuccessModal({
    onClose,
}: {
    onClose: () => void;
}) {
    const { shift } = useWorkShift();

    if (!shift) return null;

    const startTime = new Date(shift.startTime).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
    const businessDate = shift.startTime.split("T")[0];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[420px] p-8 shadow-2xl">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <Check className="w-9 h-9 text-white stroke-[3]" />
                </div>

                <h2 className="text-xl font-bold text-center mb-6 text-gray-900">
                    Hello, Your Work Day Started
                </h2>

                {/* Info Grid */}
                <div className="space-y-4 mb-8">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Start User:</p>
                        <p className="text-blue-600 font-semibold">{shift.startedBy}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Open Till:</p>
                        <p className="text-blue-600 font-semibold">{shift.openTillAmount?.toFixed(2)}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">Start Time:</p>
                        <p className="text-blue-600 font-semibold">{startTime}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">Business Date:</p>
                        <p className="text-blue-600 font-semibold">{businessDate}</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
    );
}
