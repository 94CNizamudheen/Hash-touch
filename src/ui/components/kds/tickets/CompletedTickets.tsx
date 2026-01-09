import { useState, useEffect, useCallback } from "react";
import { useKdsSettings } from "@/ui/context/KdsSettingsContext";
import TicketCard from "./TicketCard";
import { useMediaQuery } from "usehooks-ts";
import MobileTicketCard from "./mobile/MobileTicketCard";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";
import type { Ticket, TicketItem } from "./ticket.types";
import type { KDSTicketData, KDSTicketItem } from "@/types/kds";

/**
 * Transform KDSTicketData from database to Ticket format for UI
 */
function transformKdsTicketToTicket(kdsTicket: KDSTicketData): Ticket {
  let items: TicketItem[] = [];

  try {
    const parsedItems: KDSTicketItem[] = JSON.parse(kdsTicket.items);
    items = parsedItems.map((item, index) => ({
      id: item.id || `item-${index}`,
      name: item.name,
      quantity: item.quantity,
      status: 'completed' as const, // All items in completed tickets are completed
      notes: item.notes || '',
      modifiers: item.modifiers || [],
    }));
  } catch (error) {
    console.error('[CompletedTickets] Failed to parse items:', error);
  }

  return {
    id: kdsTicket.id,
    orderNumber: kdsTicket.ticketNumber,
    orderMode: kdsTicket.orderModeName || 'Dine In',
    receivedTime: new Date(kdsTicket.createdAt),
    preparationTime: '10 min',
    items,
    queueNumber: kdsTicket.tokenNumber || 0,
    status: kdsTicket.status
  };
}

const CompletedTickets = () => {
  const { settings } = useKdsSettings();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Load completed tickets from database
  const loadCompletedTickets = useCallback(async () => {
    try {
      console.log('[CompletedTickets] Loading completed tickets from database');
      const completedKdsTickets = await kdsTicketLocal.getTicketsByStatus('READY');
      console.log(`[CompletedTickets] Loaded ${completedKdsTickets.length} completed tickets`);

      const transformedTickets = completedKdsTickets.map(transformKdsTicketToTicket);
      setTickets(transformedTickets);
    } catch (error) {
      console.error('[CompletedTickets] Failed to load completed tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadCompletedTickets();
  }, [loadCompletedTickets]);

  // Listen for status changes to refresh completed tickets
  useEffect(() => {
    const unsubscribe = localEventBus.subscribe(LocalEventTypes.KDS_STATUS_CHANGED, async (event) => {
      console.log('[CompletedTickets] Status changed event received:', event.payload);
      // Reload if a ticket was marked as READY
      if (event.payload?.newStatus === 'READY') {
        await loadCompletedTickets();
      }
    });

    return unsubscribe;
  }, [loadCompletedTickets]);

  // Handle removing completed ticket (delete from database)
  // const handleRemoveTicket = async (ticketId: string) => {
  //   console.log('[CompletedTickets] Removing completed ticket:', ticketId);

  //   try {
  //     // Optimistically remove from UI
  //     setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));

  //     // Delete from database
  //     await kdsTicketLocal.deleteTicket(ticketId);

  //     console.log('[CompletedTickets] ✅ Ticket deleted from database');
  //   } catch (error) {
  //     console.error('[CompletedTickets] Failed to delete ticket:', error);
  //     // Reload tickets to restore UI state on error
  //     await loadCompletedTickets();
  //   }
  // };

  // Dummy handler for toggle item (completed tickets don't allow toggling)
  const handleToggleItem = () => {
    // No-op for completed tickets
  };

  if (loading) {
    return (
      <div
        className="min-h-full p-3 flex items-center justify-center"
        style={{ backgroundColor: settings.pageBgColor }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading completed tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full p-3"
      style={{ backgroundColor: settings.pageBgColor }}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Completed Orders</h2>
        <p className="text-gray-600 text-sm">View all completed and ready orders</p>
      </div>

      {/* MOBILE */}
      {!isDesktop && (
        <div className="flex flex-col gap-5 pb-4">
          {tickets.map((t) => (
            <div key={t.id} className="w-full">
              <MobileTicketCard
                ticket={t}
                theme={settings}
                onToggleItem={handleToggleItem}
              />
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP */}
      {isDesktop && (
        <div
          className="flex overflow-x-auto pb-4"
          style={{
            gap: settings.pageGap,
          }}
        >
          {tickets.map((t) => (
            <div key={t.id} className="flex-shrink-0 w-96">
              <TicketCard
                ticket={t}
                theme={settings}
                onToggleItem={handleToggleItem}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tickets.length === 0 && !loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 text-lg font-medium">No completed tickets</p>
            <p className="text-gray-400 text-sm mt-2">
              Completed orders will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedTickets;
