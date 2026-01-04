

import { Button } from "@/ui/shadcn/components/ui/button";

export default function LogoutConfirmModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-background p-6 rounded-xl w-[500px] space-y-4">
        <h3 className="font-semibold text-lg">Confirm Logout</h3>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to logout?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>Logout</Button>
        </div>
      </div>
    </div>
  );
}
