import { useState, useEffect, useCallback } from "react";
import { useKdsSettings } from "@/ui/context/KdsSettingsContext";
import TicketCard from "./TicketCard";
import { useMediaQuery } from "usehooks-ts";
import MobileTicketCard from "./mobile/MobileTicketCard";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { kdsService } from "@/services/core/kds.service";
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
      status: (item.completed ? 'completed' : 'pending') as 'pending' | 'completed',
      notes: item.notes || '',
      modifiers: item.modifiers || [],
    }));
  } catch (error) {
    console.error('[Tickets] Failed to parse items:', error);
  }

  return {
    id: kdsTicket.id,
    orderNumber: kdsTicket.ticketNumber,
    receivedTime: new Date(kdsTicket.createdAt),
    preparationTime: '10 min', 
    orderMode: kdsTicket.orderModeName || 'Dine In',
    items,
    queueNumber:kdsTicket.tokenNumber||0,
    status:kdsTicket.status
  };
}

const Tickets = () => {
  const { settings } = useKdsSettings();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [kdsTicketsMap, setKdsTicketsMap] = useState<Map<string, KDSTicketData>>(new Map());
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Load tickets from database
  const loadTickets = useCallback(async () => {
    try {
      console.log('[Tickets] Loading active tickets from database');
      const kdsTickets = await kdsTicketLocal.getActiveTickets();
      console.log(`[Tickets] Loaded ${kdsTickets.length} active tickets`);

      // Create a map for quick lookup
      const ticketsMap = new Map<string, KDSTicketData>();
      kdsTickets.forEach(ticket => {
        ticketsMap.set(ticket.id, ticket);
      });
      setKdsTicketsMap(ticketsMap);

      const transformedTickets = kdsTickets.map(transformKdsTicketToTicket);
      const inProgressTickets = transformedTickets.filter((t) => t.status === "IN_PROGRESS");
      setTickets(inProgressTickets);
    } catch (error) {
      console.error('[Tickets] Failed to load tickets:', error);
      setTickets([]);
      setKdsTicketsMap(new Map());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LocalEventBus listener for new tickets (created via global WebSocket listener in KdsWebSocketContext)
  useEffect(() => {
    const unsubscribe = localEventBus.subscribe(LocalEventTypes.TICKET_CREATED, async () => {
      console.log('[Tickets] Ticket created event received, reloading...');
      await loadTickets();
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LocalEventBus listener for ticket removal
  useEffect(() => {
    const unsubscribe = localEventBus.subscribe(LocalEventTypes.KDS_TICKET_REMOVED, () => {
      console.log('[Tickets] Ticket removed, reloading...');
      loadTickets();
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle marking ticket as done
  const handleMarkAsDone = useCallback(async (ticketId: string) => {
  try {
    const kdsTicket = kdsTicketsMap.get(ticketId);

    if (!kdsTicket) {
      console.error('[KDS] Ticket not found:', ticketId);
      return;
    }

    // Optimistic UI update
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));

    // KDS → POS (READY)
    await kdsService.markTicketReady(
      ticketId,
      kdsTicket.ticketNumber,
      kdsTicket.orderId,
      kdsTicket.tokenNumber
    );

    console.log('[KDS] ✅ Ticket marked READY and sent to POS');
  } catch (error) {
    console.error('[KDS] Failed to mark ticket READY:', error);
    await loadTickets(); 
  }
}, [kdsTicketsMap, loadTickets]);


  // Handle toggling item status
  const handleToggleItem = (ticketId: string, itemId: string) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            items: ticket.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status: item.status === 'completed' ? 'pending' : ('completed' as const),
                  }
                : item
            ),
          };
        }
        return ticket;
      })
    );

    // TODO: Persist item status changes to database if needed
  };

  // Auto mark as done when all items are completed
  useEffect(() => {
    if (settings.autoMarkDone) {
      tickets.forEach((ticket) => {
        const allCompleted = ticket.items.every((item) => item.status === 'completed');
        if (allCompleted) {
          console.log('[Tickets] All items completed, auto-marking ticket as done:', ticket.id);
          setTimeout(() => handleMarkAsDone(ticket.id), 2000);
        }
      });
    }
  }, [tickets, settings.autoMarkDone,handleMarkAsDone]);

  if (loading) {
    return (
      <div
        className="min-h-full p-3 flex items-center justify-center"
        style={{ backgroundColor: settings.pageBgColor }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full p-3"
      style={{ backgroundColor: settings.pageBgColor }}
    >
      {/* MOBILE */}
      {!isDesktop && (
        <div className="flex flex-col gap-5 pb-4">
          {tickets.map((t) => (
            <div key={t.id} className="w-full">
              <MobileTicketCard
                ticket={t}
                theme={settings}
                onToggleItem={handleToggleItem}
                onMarkAsDone={handleMarkAsDone}
              />
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP */}
      {isDesktop && (
        <div
          className="flex overflow-x-auto no-scrollbar pb-4 my-7 "
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
                onMarkAsDone={handleMarkAsDone}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tickets.length === 0 && !loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 text-lg font-medium">No active tickets</p>
            <p className="text-gray-400 text-sm mt-2">
              New orders will appear here automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;