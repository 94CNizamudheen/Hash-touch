import { deviceService } from "@core/services/device.service";

interface ResetProps {
  editId: string;
  onCancel: () => void;
}

const Reset = ({ editId, onCancel }: ResetProps) => {
  return (
    <div className="space-y-4">
      {editId === "reset-device" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          
          <h3 className="font-semibold text-red-700 mb-2">Reset Device</h3>
          <p className="text-sm text-red-600 mb-4">
            This will clear all device info and restart the app.
          </p>

          {/* RESET BUTTON */}
          <button
            onClick={async () => {
              if (confirm("Reset device? This cannot be undone.")) {
                await deviceService.clearDevices();
                alert("Device reset successfully!");
                window.location.href = "/";
              }
            }}
            className="w-full py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 mb-3"
          >
            Reset Device
          </button>

          {/* CANCEL BUTTON */}
          <button
            onClick={onCancel}
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300"
          >
            Cancel
          </button>

        </div>
      )}
    </div>
  );
};

export default Reset;
