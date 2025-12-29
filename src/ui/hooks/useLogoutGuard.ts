import { useWorkShift } from "@/ui/context/WorkShiftContext";
import { ticketLocal } from "@/services/local/ticket.local.service";

export interface LogoutBlocks {
  hasOpenShift: boolean;
  pendingCount: number;   // PENDING tickets
  failedCount: number;    // FAILED tickets
  totalSyncs: number;     // pending + failed
  canLogout: boolean;     // true if no blockers
}

export function useLogoutGuard() {
  const { shift } = useWorkShift();

  const checkBlocks = async (): Promise<LogoutBlocks> => {
    try {
      const hasOpenShift = !!shift?.isOpen;

      // Get sync statistics
      const stats = await ticketLocal.getSyncStats();
      const pendingCount = stats.pending;
      const failedCount = stats.failed;
      const totalSyncs = pendingCount + failedCount;

      // User can logout only if shift is closed AND no pending/failed syncs
      const canLogout = !hasOpenShift && totalSyncs === 0;

      return {
        hasOpenShift,
        pendingCount,
        failedCount,
        totalSyncs,
        canLogout,
      };
    } catch (error) {
      console.error("Failed to check logout blocks:", error);

      // On error, return conservative response (assume blockers exist)
      // This prevents data loss if we can't verify sync status
      return {
        hasOpenShift: !!shift?.isOpen,
        pendingCount: 0,
        failedCount: 0,
        totalSyncs: 0,
        canLogout: false, // Block logout on error to be safe
      };
    }
  };

  return {
    checkBlocks,
  };
}
