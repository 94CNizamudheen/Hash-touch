import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Card } from "@/ui/shadcn/components/ui/card";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { ticketLocal, type DbTicket } from "@/services/local/ticket.local.service";
import { ticketService } from "@/services/data/ticket.service";
import { useAppState } from "@/ui/hooks/useAppState";

export default function ActivityPage() {
  const navigate = useNavigate();
  const { state: appState } = useAppState();

  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [stats, setStats] = useState({ pending: 0, failed: 0, synced: 0 });
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(navigator.onLine);

  const loadData = async () => {
    try {
      const [allTickets, syncStats] = await Promise.all([
        ticketLocal.getAll(),
        ticketLocal.getSyncStats(),
      ]);

      setTickets(allTickets);
      setStats(syncStats);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log("🟢 Device is now ONLINE");
      setIsConnected(true);
    };
    const handleOffline = () => {
      console.log("🔴 Device is now OFFLINE");
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!appState?.tenant_domain || !appState?.access_token) {
      console.error("❌ Missing authentication:", {
        domain: appState?.tenant_domain,
        hasToken: !!appState?.access_token,
      });
      alert("Missing authentication. Please login again.");
      return;
    }

    console.log("🚀 Initiating manual sync from Activity Page");
    setSyncing(true);
    try {
      const result = await ticketService.syncPendingTickets(
        appState.tenant_domain,
        appState.access_token
      );

      await loadData();

      if (result.synced.length > 0) {
        console.log(`✅ Sync successful: ${result.synced.length} tickets synced`);
        alert(`Successfully synced ${result.synced.length} tickets`);
      }

      if (result.failed.length > 0) {
        console.warn(`⚠️ Some tickets failed: ${result.failed.length} tickets`);
        alert(`Failed to sync ${result.failed.length} tickets. Check console for details.`);
      }

      if (result.synced.length === 0 && result.failed.length === 0) {
        alert("No pending tickets to sync");
      }
    } catch (error) {
      console.error("❌ Sync failed with error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Sync failed: ${errorMessage}\n\nCheck browser console (F12) for detailed logs.`);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SYNCED":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "SYNCING":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SYNCED":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "SYNCING":
        return "text-blue-600 bg-blue-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number | null | undefined) => {
    if (!amount) return "$0.00";
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/pos")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Activity & Sync</h1>
            <div className="flex items-center gap-2 text-sm mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
              {appState?.tenant_domain && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-xs">
                    {appState.tenant_domain}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing || stats.pending === 0 || !isConnected}
          className="gap-2"
        >
          {syncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync Pending ({stats.pending})
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{stats.failed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Synced</p>
              <p className="text-2xl font-bold">{stats.synced}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(ticket.sync_status)}
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          ticket.sync_status
                        )}`}
                      >
                        {ticket.sync_status}
                      </span>
                      {ticket.sync_attempts > 0 && (
                        <span className="text-xs text-muted-foreground">
                          (Attempts: {ticket.sync_attempts})
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Ticket ID:
                        </span>
                        <p className="font-mono text-xs">{ticket.id}</p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">
                          Location:
                        </span>
                        <p className="truncate">
                          {ticket.location_id || "N/A"}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">
                          Order Mode:
                        </span>
                        <p>{ticket.order_mode_name || "N/A"}</p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-semibold">
                          {formatAmount(ticket.ticket_amount)}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <p>{ticket.items_count || 0}</p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="text-xs">
                          {formatDate(ticket.created_at)}
                        </p>
                      </div>
                    </div>

                    {ticket.sync_error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-600">
                          <strong>Error:</strong> {ticket.sync_error}
                        </p>
                      </div>
                    )}

                    {ticket.synced_at && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Synced at: {formatDate(ticket.synced_at)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
