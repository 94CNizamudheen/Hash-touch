import { useState } from "react";
import { Button } from "@/ui/shadcn/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/shadcn/components/ui/dialog";
import { LogOut, Settings } from "lucide-react";
import { useLogout } from "@/ui/context/LogoutContext";
import { logoutService } from "@/services/auth/logout.service";

export default function QueueSettingsButton() {
  const [open, setOpen] = useState(false);
  const { isLoggingOut, setIsLoggingOut } = useLogout();

    const handleLogout = async () => {
        if (!confirm("Are you sure you want to logout? All data will be cleared.")) {
            return;
        }

        setIsLoggingOut(true);
        try {
            await logoutService.logout();
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
            alert("Logout failed. Please try again.");
        }
    };

  return (
    <>
      {/* Floating Settings Button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
      >
        <Settings className="w-6 h-6 text-white" />
      </Button>

      {/* Settings Dialog */}
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

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="w-full"
              disabled={isLoggingOut}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
