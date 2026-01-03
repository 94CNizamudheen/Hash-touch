import {  ListOrdered } from "lucide-react";
import { useState, useEffect } from "react";
import MobileLeftSidebar from "../../layouts/mobile/MobileLeftSidebar";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import type { Ticket, TicketItem } from "../ticket.types";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const kdsTickets = await kdsTicketLocal.getActiveTickets();
        const transformedTickets: Ticket[] = kdsTickets.map((kdsTicket) => {
          let items: TicketItem[] = [];
          try {
            const parsedItems = JSON.parse(kdsTicket.items);
            items = parsedItems.map((item: any, index: number) => ({
              id: item.id || `item-${index}`,
              name: item.name,
              quantity: item.quantity,
              status: (item.completed ? 'completed' : 'pending') as 'pending' | 'completed',
              notes: item.notes || '',
            }));
          } catch (error) {
            console.error('[LeftSidebar] Failed to parse items:', error);
          }
          return {
            id: kdsTicket.id,
            orderNumber: kdsTicket.ticketNumber,
            restaurant: kdsTicket.locationId || 'Location',
            adminId: kdsTicket.orderId || '',
            receivedTime: new Date(kdsTicket.createdAt),
            preparationTime: '10 min',
            tableNumber: kdsTicket.orderModeName || 'Dine In',
            items,
          };
        });
        setTickets(transformedTickets);
      } catch (error) {
        console.error('[LeftSidebar] Failed to load tickets:', error);
      }
    };

    // Load tickets when menu opens
    if (open) {
      loadTickets();
    }
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded bg-amber-300 shadow"
      >
        <ListOrdered size={22} className="stroke-primary" />
      </button>

      <MobileLeftSidebar tickets={tickets} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default LeftSidebar;
