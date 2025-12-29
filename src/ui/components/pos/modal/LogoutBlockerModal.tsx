import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import type { LogoutBlocks } from "@/ui/hooks/useLogoutGuard";

export default function LogoutBlockerModal({
  blocks,
  onClose,
  onEndShift,
  onGoToActivity,
}: {
  blocks: LogoutBlocks;
  onClose: () => void;
  onEndShift: () => void;
  onGoToActivity: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-[400px] p-8 shadow-2xl">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" strokeWidth={2.5} />
        </div>

        {/* Header */}
        <h2 className="text-xl font-bold text-center mb-3 text-foreground">
          Cannot Logout
        </h2>

        {/* Blocker List */}
        <div className="mb-6 space-y-3">
          <p className="text-center text-muted-foreground text-sm mb-4">
            Please resolve the following before logging out:
          </p>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            {blocks.hasOpenShift && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-sm text-foreground">
                  Work shift is currently open
                </span>
              </div>
            )}

            {blocks.totalSyncs > 0 && (
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <div className="text-sm text-foreground">
                  {blocks.pendingCount > 0 && blocks.failedCount > 0 && (
                    <span>
                      {blocks.pendingCount} pending sync{blocks.pendingCount !== 1 ? 's' : ''}, {blocks.failedCount} failed
                    </span>
                  )}
                  {blocks.pendingCount > 0 && blocks.failedCount === 0 && (
                    <span>
                      {blocks.pendingCount} pending sync{blocks.pendingCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {blocks.pendingCount === 0 && blocks.failedCount > 0 && (
                    <span>
                      {blocks.failedCount} failed sync{blocks.failedCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {blocks.totalSyncs > 0 && (
            <button
              onClick={onGoToActivity}
              className="w-full btn-primary font-medium rounded-lg py-3 transition-colors"
            >
              Go to Activity & Sync
            </button>
          )}

          {blocks.hasOpenShift && (
            <button
              onClick={onEndShift}
              className="w-full btn-danger font-medium rounded-lg py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={blocks.totalSyncs > 0}
            >
              {blocks.totalSyncs > 0 ? 'Sync First to End Shift' : 'End Shift'}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full btn-secondary font-medium rounded-lg py-3 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
