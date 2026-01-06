
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { ThemeSettings, Ticket } from "../ticket.types";

interface Props {
  ticket: Ticket;
  theme: ThemeSettings;
  onToggleItem: (ticketId: string, itemId: string) => void;
  onMarkAsDone?: (ticketId: string) => void;
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

  const formatQueueNumber = (queueNumber: number | string | undefined) => {
    if (queueNumber === undefined || queueNumber === null) return '000';
    const num = typeof queueNumber === 'string' ? parseInt(queueNumber, 10) : queueNumber;
    if (isNaN(num)) return '000';
    return num.toString().padStart(3, '0');
  };

  const allDone = ticket.items.every((i) => i.status === "completed");

  return (
    <div
      className="rounded-lg overflow-hidden shadow-md w-full"
      style={{ backgroundColor: theme.cardBgColor }}
    >
      {/* MOBILE Header */}
      <div
        className="px-3 py-2"
        style={{
          backgroundColor: getHeaderBgColor(),
          color: theme.headerTextColor,
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3
              className="font-semibold"
              style={{
                fontSize: theme.headerFontSize,
                fontWeight: theme.headerFontWeight,
              }}
            >
              Order #{ticket.orderNumber}
            </h3>
            <p className="text-sm opacity-90">{ticket.orderMode}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">
              {new Date(ticket.receivedTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </p>
            <p
              className="font-bold"
              style={{
                fontSize: theme.headerFontSize,
                fontWeight: theme.headerFontWeight,
              }}
            >
              {formatQueueNumber(ticket.queueNumber)}
            </p>
          </div>
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


        {/* ITEMS LIST */}
        <div className="space-y-3">
          {ticket.items.map((item) => {
            const isCompleted = item.status === "completed";
            const bgColor = isCompleted
              ? theme.itemCompletedBg
              : allDone
              ? theme.allCompletedItemPendingBg
              : theme.itemPendingBg;
            const borderColor = isCompleted
              ? theme.itemCompletedBorder
              : allDone
              ? theme.allCompletedItemPendingBorder
              : theme.itemPendingBorder;
            const textColor = isCompleted ? theme.itemCompletedText : theme.itemPendingText;

            return (
              <div
                key={item.id}
                onClick={() => onToggleItem(ticket.id, item.id)}
                className="cursor-pointer hover:opacity-90 transition-all border-2"
                style={{
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  color: textColor,
                  borderRadius: theme.itemBorderRadius,
                  padding: theme.itemPadding,
                }}
              >
                <div className="flex items-start gap-2">
                  {isCompleted && (
                    <div className="bg-white rounded-full p-0.5 mt-0.5">
                      <Check size={14} style={{ color: theme.itemCompletedBg }} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p
                      style={{
                        fontSize: theme.itemFontSize,
                        fontWeight: theme.itemFontWeight,
                      }}
                    >
                      {item.quantity}- {item.name}
                    </p>
                    <p className="text-sm opacity-90">Normal</p>
                    {item.notes && (
                      <p className="text-sm opacity-90 font-semibold">
                        (Notes: {item.notes})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preparation Time */}
        {theme.showPreparationTime && !allDone && (
          <div className="text-center pt-2">
            <p className="text-sm font-medium">
              Preparation time:{" "}
              <span
                className="font-bold"
                style={{ color: getHeaderBgColor() }}
              >
                {ticket.preparationTime}
              </span>
            </p>
          </div>
        )}

        {/* DONE BUTTON */}
        {!allDone && (
          <button
            onClick={() => onMarkAsDone(ticket.id)}
            className="w-full py-3 rounded-lg font-semibold active:scale-[0.97] transition"
            style={{
              backgroundColor: theme.buttonBgColor,
              color: theme.buttonTextColor,
              borderRadius: theme.buttonBorderRadius,
              fontSize: theme.buttonFontSize,
              fontWeight: theme.buttonFontWeight,
            }}
          >
            Mark as done
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileTicketCard;
