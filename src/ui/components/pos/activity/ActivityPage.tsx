import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ticketLocal, type DbTicket } from "@/services/local/ticket.local.service";
import { ticketService } from "@/services/data/ticket.service";
import { useAppState } from "@/ui/hooks/useAppState";
import { isOnline } from "@/ui/utils/networkDetection";
import { useNotification } from "@/ui/context/NotificationContext";

type TabType = "ALL" | "SYNCED" | "UNSYNCED";

export default function ActivityPage() {
  const navigate = useNavigate();
  const { state: appState } = useAppState();

  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tab, setTab] = useState<TabType>("ALL");
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  /* -------------------- LOAD DATA -------------------- */
  const loadData = async () => {
    setLoading(true);
    const data = await ticketLocal.getAll();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const onOnline = () => setIsConnected(true);
    const onOffline = () => setIsConnected(false);
    const onTicketCreated = () => loadData();

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("ticketCreated", onTicketCreated);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("ticketCreated", onTicketCreated);
    };
  }, []);

  /* -------------------- FILTER -------------------- */
  const filteredTickets = tickets.filter((t) => {
    if (tab === "SYNCED") return t.sync_status === "SYNCED";
    if (tab === "UNSYNCED") return t.sync_status !== "SYNCED";
    return true;
  });

  /* -------------------- SYNC -------------------- */
  const handleSync = async () => {
    if (!(await isOnline())) {
            showNotification.error(t("Network not detected, check connection"));
            return;
          }
    if (!appState?.tenant_domain || !appState?.access_token) return;

    setSyncing(true);
    try {
      await ticketService.syncPendingTickets(
        appState.tenant_domain,
        appState.access_token
      );
      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  /* -------------------- TOTALS -------------------- */
  const totalAmount =
    filteredTickets.reduce(
      (sum, t) => sum + (t.ticket_amount ?? 0),
      0
    ) / 100;

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-center relative py-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/pos")}
          className="absolute left-2"
        >
          <ArrowLeft />
        </Button>

        <h1 className="text-xl font-semibold">{t("Activities")}</h1>
      </div>

      {/* ================= TABS ================= */}
      <div className="grid grid-cols-3 border-b">
        {[
          { key: "ALL", label: t("All") },
          { key: "SYNCED", label: t("Synced") },
          { key: "UNSYNCED", label: t("Un Synced") }, 
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as TabType)}
            className={`py-3 text-sm font-medium border border-border ${tab === t.key
                ? "bg-primary text-white"
                : "bg-secondary text-black"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= LIST ================= */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 ">
        {filteredTickets.map((ticket) => {
          const isSynced = ticket.sync_status === "SYNCED";
          const isFailed = ticket.sync_status === "FAILED";

          return (
            <div
              key={ticket.id}
              className={`bg-secondary rounded-lg p-4 border-l-4 ${isSynced
                  ? "border-green-500"
                  : isFailed
                    ? "border-red-500"
                    : "border-yellow-500"
                }`}
            >
              {/* Top row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {ticket.order_mode_name ?? "Delivery"} -{" "}
                    {ticket.queue_number?.toString().padStart(3, "0") ?? "000"}
                  </p>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isSynced
                        ? "bg-green-100 text-green-700"
                        : isFailed
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {isSynced ? "Synced" : isFailed ? "Failed" : "Pending"}
                  </span>
                </div>

                <p className="text-primary font-semibold">
                  S$ {((ticket.ticket_amount ?? 0) / 100).toFixed(2)}
                </p>
              </div>

              {/* Details */}
              <div className="mt-3 grid grid-cols-[90px_1fr] gap-y-1 text-sm">
                <span className="text-primary">Ticket No</span>
                <span>{ticket.ticket_number ?? ticket.id}</span>

                <span className="text-primary">Date</span>
                <span>
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })
                    : "-"}
                </span>

                <span className="text-primary">Time</span>
                <span>
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleTimeString()
                    : "-"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="border-t px-4 py-3 text-sm space-y-2">
        <div className="flex justify-between">
          <span>Total Tickets</span>
          <span>{filteredTickets.length}</span>
        </div>

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>S$ {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* ================= SYNC ================= */}
      <div className="p-3">
        <Button
          className="w-full h-12 text-base"
          onClick={handleSync}
          disabled={syncing || !isConnected}
        >
         {syncing ? t("Syncing...") : t("Sync All")}

        </Button>
      </div>
    </div>
  );
}
