import { Button } from "@/ui/shadcn/components/ui/button";
// import { deviceService } from "@/services/local/device.local.service"; 
import { ExitIcon, ResetIcon } from "@radix-ui/react-icons";
import { RotateCcw, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";


const Top = ({ onReset }: { onReset: () => void }) => {
    const handleResetDevice = async () => {
      if (confirm("Are you sure you want to reset this device?")) {
        try {
          // await deviceService.clearDevices();
          alert("Device reset successfully!");
          window.location.href = "/";
        } catch (err) {
          console.error("Failed to reset device:", err);
          alert("Failed to reset device. Please try again.");
        }
      }
    };
  
  const navigate = useNavigate()
  return (
    <div className="bg-white px-6 py-4 flex items-center justify-between border-b ">
      <div className="flex items-center gap-3">
        <Settings className="text-primary" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">KDS Styling Settings</h1>
      </div>
      <div className="flex justify-evenly gap-3">
        <Button onClick={() => navigate(-1)} className="hover:bg-primary-hover">
          <ExitIcon />
          Back
        </Button>
        <Button
          onClick={onReset}
          className="hover:bg-primary-hover"
        >
          <RotateCcw size={18} />
          <span>Reset to Default</span>
        </Button>
        <Button onClick={handleResetDevice} className="hover:bg-primary-hover">
          <ResetIcon />
          Reset device
        </Button>
      </div>

    </div>
  );
};

export default Top