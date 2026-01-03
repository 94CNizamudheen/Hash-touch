import { useState, useEffect, useCallback } from "react";
import { useKdsSettings } from "@/ui/context/KdsSettingsContext";
import { useKdsWebSocket } from "@/ui/context/KdsWebSocketContext";
import TicketCard from "./TicketCard";
import { useMediaQuery } from "usehooks-ts";
import MobileTicketCard from "./mobile/MobileTicketCard";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";
import { useNotificationSound } from "@/ui/hooks/useNotificationSound";
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
    }));
  } catch (error) {
    console.error('[Tickets] Failed to parse items:', error);
  }

  return {
    id: kdsTicket.id,
    orderNumber: kdsTicket.ticketNumber,
    restaurant: kdsTicket.locationId || 'Location',
    adminId: kdsTicket.orderId || '',
    receivedTime: new Date(kdsTicket.createdAt),
    preparationTime: '10 min', // TODO: Calculate from createdAt
    tableNumber: kdsTicket.orderModeName || 'Dine In',
    items,
  };
}

const Tickets = () => {
  const { settings } = useKdsSettings();
  const { isConnected, client } = useKdsWebSocket();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { playSound } = useNotificationSound();

  // Load tickets from database
  const loadTickets = useCallback(async () => {
    try {
      console.log('[Tickets] Loading active tickets from database');
      const kdsTickets = await kdsTicketLocal.getActiveTickets();
      console.log(`[Tickets] Loaded ${kdsTickets.length} active tickets`);

      const transformedTickets = kdsTickets.map(transformKdsTicketToTicket);
      setTickets(transformedTickets);
    } catch (error) {
      console.error('[Tickets] Failed to load tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WebSocket listener for new orders from POS
  useEffect(() => {
    // Wait for WebSocket connection to be established
    if (!isConnected || !client) {
      console.log('[Tickets] Waiting for WebSocket connection...', { isConnected, hasClient: !!client });
      return;
    }

    console.log('[Tickets] ✅ WebSocket connected, registering new_order listener');

    const handleNewOrder = async (message: any) => {
      console.log('[Tickets] Received new_order via WebSocket:', message);

      const orderData = message.payload;

      // Play notification sound
      playSound();

      // Save to local database
      try {
        await kdsTicketLocal.saveTicket({
          id: orderData.ticket_id || `kds-${Date.now()}`,
          ticketNumber: String(orderData.ticket_number || `T${Date.now()}`),
          orderId: orderData.ticket_id || '',
          locationId: orderData.location_id || '',
          orderModeName: orderData.order_mode || 'Dine In',
          status: 'PENDING',
          items: JSON.stringify(orderData.items || []),
          totalAmount: orderData.total_amount || 0,
          tokenNumber: orderData.token_number || 0,
          createdAt: orderData.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log('[Tickets] Saved new ticket to database');

        // Reload tickets to show new one
        await loadTickets();

        // Emit local event for notification badge
        localEventBus.emit(LocalEventTypes.TICKET_CREATED, orderData);
      } catch (error) {
        console.error('[Tickets] Failed to save new ticket:', error);
      }
    };

    client.on('new_order', handleNewOrder);

    return () => {
      console.log('[Tickets] Cleaning up new_order listener');
      client.off('new_order', handleNewOrder);
    };
  }, [isConnected, client, playSound, loadTickets]);

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
  const handleMarkAsDone = async (ticketId: string) => {
    console.log('[Tickets] Marking ticket as done:', ticketId);

    // Optimistically remove from UI
    setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));

    // The actual deletion will be handled by kdsService.updateTicketStatus
    // which is called from the TicketCard component
  };

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
  }, [tickets, settings.autoMarkDone]);

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
        <div className="grid grid-cols-1 gap-3">
          {tickets.map((t) => (
            <MobileTicketCard
              key={t.id}
              ticket={t}
              theme={settings}
              onToggleItem={handleToggleItem}
              onMarkAsDone={handleMarkAsDone}
            />
          ))}
        </div>
      )}

      {/* DESKTOP */}
      {isDesktop && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${settings.pageGridCols}, minmax(0, 1fr))`,
            gap: settings.pageGap,
          }}
        >
          {tickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              theme={settings}
              onToggleItem={handleToggleItem}
              onMarkAsDone={handleMarkAsDone}
            />
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