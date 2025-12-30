import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import type { ThemeSettings, Ticket } from "./ticket.types";


interface TicketCardProps {
  ticket: Ticket;
  theme: ThemeSettings;
  onMarkAsDone: (ticketId: string) => void;
  onToggleItem: (ticketId: string, itemId: string) => void;
}

const TicketCard = ({ ticket, theme, onMarkAsDone, onToggleItem }: TicketCardProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const received = new Date(ticket.receivedTime).getTime();
      const elapsed = Math.floor((now - received) / 1000 / 60);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [ticket.receivedTime]);

  const getHeaderBgColor = () => {
    if (elapsedTime < 5) return theme.elapsedColor0to5;
    if (elapsedTime < 10) return theme.elapsedColor5to10;
    if (elapsedTime < 15) return theme.elapsedColor10to15;
    return theme.elapsedColor15plus;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const allItemsCompleted = ticket.items.every(item => item.status === 'completed');

  return (
    <div 
      className="overflow-hidden w-full"
      style={{
        backgroundColor: theme.cardBgColor,
        borderRadius: theme.cardBorderRadius,
        boxShadow: theme.cardShadow,
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3"
        style={{ 
          backgroundColor: getHeaderBgColor(),
          color: theme.headerTextColor,
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 
              style={{ 
                fontSize: theme.headerFontSize,
                fontWeight: theme.headerFontWeight,
              }}
            >
              Order #{ticket.orderNumber}
            </h3>
            <p className="text-sm opacity-90">{ticket.restaurant}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{formatTime(ticket.receivedTime)}</p>
            <p 
              style={{ 
                fontSize: theme.headerFontSize,
                fontWeight: theme.headerFontWeight,
              }}
            >
              {ticket.tableNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div 
        className="p-4 space-y-3"
        style={{ 
          backgroundColor: allItemsCompleted ? theme.completedCardBg : theme.bodyBgColor,
          color: allItemsCompleted ? theme.completedTextColor : theme.bodyTextColor,
        }}
      >
        {/* Admin ID */}
        {theme.showAdminId && (
          <p 
            className="text-sm font-medium mb-2"
            style={{ 
              color: allItemsCompleted ? theme.completedTextColor : theme.bodyTextColor 
            }}
          >
            Admin- {ticket.adminId}
          </p>
        )}

        {/* Items */}
        {ticket.items.map((item) => {
          const isCompleted = item.status === 'completed';
          const bgColor = isCompleted 
            ? theme.itemCompletedBg 
            : (allItemsCompleted ? theme.allCompletedItemPendingBg : theme.itemPendingBg);
          const borderColor = isCompleted 
            ? theme.itemCompletedBorder 
            : (allItemsCompleted ? theme.allCompletedItemPendingBorder : theme.itemPendingBorder);
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

        {/* Preparation Time */}
        {theme.showPreparationTime && (
          <div 
            className="text-center pt-2"
            style={{ color: allItemsCompleted ? theme.completedTextColor : theme.bodyTextColor }}
          >
            <p className="text-sm font-medium">
              Preparation time: <span className="font-bold" style={{ color: getHeaderBgColor() }}>{ticket.preparationTime}</span>
            </p>
          </div>
        )}

        {/* Mark as Done Button */}
        <button
          onClick={() => onMarkAsDone(ticket.id)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="w-full font-semibold transition-colors"
          style={{
            backgroundColor: isHovering ? theme.buttonHoverBg : theme.buttonBgColor,
            color: theme.buttonTextColor,
            borderRadius: theme.buttonBorderRadius,
            fontSize: theme.buttonFontSize,
            fontWeight: theme.buttonFontWeight,
            padding: `${theme.buttonPadding} 0`,
          }}
        >
          Mark as done
        </button>
      </div>
    </div>
  );
};

export default TicketCard;