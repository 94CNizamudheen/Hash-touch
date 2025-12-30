
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { ThemeSettings, Ticket } from "../ticket.types";

interface Props {
  ticket: Ticket;
  theme: ThemeSettings;
  onToggleItem: (ticketId: string, itemId: string) => void;
  onMarkAsDone: (ticketId: string) => void;
}

const MobileTicketCard = ({ ticket, theme, onToggleItem, onMarkAsDone }: Props) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const received = new Date(ticket.receivedTime).getTime();
      const diff = Math.floor((now - received) / 1000 / 60);
      setElapsedTime(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket.receivedTime]);

  // Header color logic
  const getHeaderBgColor = () => {
    if (elapsedTime < 5) return theme.elapsedColor0to5;
    if (elapsedTime < 10) return theme.elapsedColor5to10;
    if (elapsedTime < 15) return theme.elapsedColor10to15;
    return theme.elapsedColor15plus;
  };

  const allDone = ticket.items.every((i) => i.status === "completed");

  return (
    <div
      className="rounded-lg overflow-hidden shadow-md w-full"
      style={{ backgroundColor: theme.cardBgColor }}
    >
      {/* MOBILE Header */}
      <div
        className="px-3 py-2 flex justify-between items-center"
        style={{
          backgroundColor: getHeaderBgColor(),
          color: theme.headerTextColor,
        }}
      >
        <div className="text-sm font-bold">
          #{ticket.orderNumber}
        </div>

        <div className="text-xs opacity-80">
          {new Date(ticket.receivedTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Body */}
      <div
        className="p-3 space-y-2"
        style={{
          backgroundColor: allDone ? theme.completedCardBg : theme.bodyBgColor,
          color: allDone ? theme.completedTextColor : theme.bodyTextColor,
        }}
      >
        {/* Table & Admin */}
        <div className="flex justify-between text-xs font-medium pb-1">
          <span>Table: {ticket.tableNumber}</span>
          {theme.showAdminId && <span>Admin: {ticket.adminId}</span>}
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-2">
          {ticket.items.map((item) => {
            const isCompleted = item.status === "completed";
            return (
              <div
                key={item.id}
                className="p-2 rounded-lg border-2 flex items-start gap-2 active:scale-[0.98] transition-all"
                onClick={() => onToggleItem(ticket.id, item.id)}
                style={{
                  backgroundColor: isCompleted
                    ? theme.itemCompletedBg
                    : theme.itemPendingBg,
                  borderColor: isCompleted
                    ? theme.itemCompletedBorder
                    : theme.itemPendingBorder,
                  color: isCompleted
                    ? theme.itemCompletedText
                    : theme.itemPendingText,
                }}
              >
                {/* Checkmark */}
                {isCompleted && (
                  <div className="bg-white rounded-full p-[2px] mt-0.5">
                    <Check
                      size={14}
                      style={{ color: theme.itemCompletedBg }}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {item.quantity} × {item.name}
                  </p>

                  {item.notes && (
                    <p className="text-xs italic opacity-80">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preparation Time */}
        {theme.showPreparationTime && (
          <p className="text-center pt-1 text-xs opacity-80">
            Prep:{" "}
            <span
              className="font-bold"
              style={{ color: getHeaderBgColor() }}
            >
              {ticket.preparationTime}
            </span>
          </p>
        )}

        {/* DONE BUTTON */}
        <button
          onClick={() => onMarkAsDone(ticket.id)}
          className="w-full py-2 text-sm rounded-lg font-semibold active:scale-[0.97] transition"
          style={{
            backgroundColor: theme.buttonBgColor,
            color: theme.buttonTextColor,
          }}
        >
          Mark Done
        </button>
      </div>
    </div>
  );
};

export default MobileTicketCard;
