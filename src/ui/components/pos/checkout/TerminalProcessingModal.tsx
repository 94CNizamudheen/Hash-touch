

import { Loader2, X } from "lucide-react";
import { Button } from "@/ui/shadcn/components/ui/button";

interface TerminalProcessingModalProps {
  open: boolean;
  message?: string;
  isCancelling?: boolean;
  onCancel: () => void;
  onRetry: () => void;
}

export default function TerminalProcessingModal({
  open,
  message = "Waiting for card payment approval...",
  isCancelling = false,
  onCancel,
  onRetry,
}: TerminalProcessingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center safe-area">
      <div className="bg-background rounded-2xl w-full max-w-md p-6 shadow-2xl relative">

        {/* Close (optional UX) */}
        <button
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          onClick={onCancel}
          disabled={isCancelling}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Spinner */}
        <div className="flex flex-col items-center text-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />

          <h2 className="text-lg font-semibold">
            Processing Terminal Payment
          </h2>

          <p className="text-muted-foreground text-sm">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isCancelling}
            onClick={onCancel}
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Button>

          <Button
            variant="destructive"
            className="flex-1"
            disabled={isCancelling}
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
