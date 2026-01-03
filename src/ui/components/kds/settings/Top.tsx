import { Button } from "@/ui/shadcn/components/ui/button";
import { ExitIcon, } from "@radix-ui/react-icons";
import { RotateCcw, Settings, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";


const Top = ({ onReset }: { onReset: () => void }) => {

  
  const navigate = useNavigate()
  return (
    <div className="bg-white px-6 py-4 flex items-center justify-between border-b ">
      <div className="flex items-center gap-3">
        <Settings className="text-primary" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">KDS Styling Settings</h1>
      </div>
      <div className="flex justify-evenly gap-3">
        <Button onClick={() => navigate('/')} className="hover:bg-primary-hover">
          <ExitIcon />
          Back
        </Button>
        <Button onClick={() => navigate("/kds/settings/connection")} className="hover:bg-primary-hover">
          <Wifi size={18} />
          <span>Connect to POS</span>
        </Button>
        <Button
          onClick={onReset}
          className="hover:bg-primary-hover"
        >
          <RotateCcw size={18} />
          <span>Reset to Default</span>
        </Button>

      </div>

    </div>
  );
};

export default Top