
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {  Dialog,  DialogContent, DialogHeader,DialogTitle, DialogFooter,} from "@/components/ui/dialog";
import {  RotateCcw, Settings } from "lucide-react";
import { deviceService } from "@core/services/device.service";

export default function QueueSettingsButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetDevice = async () => {
    try {
      setLoading(true);
      await deviceService.clearDevices()
      window.location.reload()
    } catch (err) {
      alert("failed to reset device")
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
      >
        <Settings className="w-6 h-6 text-white" />
      </Button>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-white text-slate-900 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Queue Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-gray-500 text-sm">
              Manage device actions for the Queue Display.
            </p>

            {/* Reset Button */}
            <Button
              onClick={handleResetDevice}
              disabled={loading}
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {loading ? "Resetting..." : "Reset Device"}
            </Button>

          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
