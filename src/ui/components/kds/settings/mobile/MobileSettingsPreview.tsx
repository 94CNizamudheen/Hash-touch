
import { Check } from "lucide-react";
import { mockTicket } from "../mockTicket";

const MobileSettingsPreview = ({ settings }: any) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const allItemsCompleted = mockTicket.items.every(item => item.status === 'completed');

  return (
    <div
      className="flex-1 overflow-auto no-scrollbar p-3"
      style={{ backgroundColor: settings.pageBgColor }}
    >
      <div className="w-full max-w-[350px]">
        {/* Preview Card - Mobile Optimized */}
        <div
          className="rounded-lg overflow-hidden shadow-md w-full"
          style={{
            backgroundColor: settings.cardBgColor,
            borderRadius: settings.cardBorderRadius,
            boxShadow: settings.cardShadow,
          }}
        >
          {/* Header */}
          <div
            className="px-3 py-2"
            style={{
              backgroundColor: settings.elapsedColor0to5,
              color: settings.headerTextColor,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    fontSize: settings.headerFontSize,
                    fontWeight: settings.headerFontWeight,
                  }}
                >
                  Order #{mockTicket.orderNumber}
                </h3>
                <p className="text-sm opacity-90">{mockTicket.restaurant}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">
                  {formatTime(mockTicket.receivedTime)}
                </p>
                <p
                  className="font-bold"
                  style={{
                    fontSize: settings.headerFontSize,
                    fontWeight: settings.headerFontWeight,
                  }}
                >
                  {mockTicket.tableNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div
            className="p-3 space-y-3"
            style={{
              backgroundColor: allItemsCompleted ? settings.completedCardBg : settings.bodyBgColor,
              color: allItemsCompleted ? settings.completedTextColor : settings.bodyTextColor,
            }}
          >
            {/* Admin ID */}
            {settings.showAdminId && (
              <p
                className="text-sm font-medium"
                style={{ color: allItemsCompleted ? settings.completedTextColor : settings.bodyTextColor }}
              >
                Admin- {mockTicket.adminId}
              </p>
            )}

            {/* Items */}
            {mockTicket.items.map((item) => (
              <div
                key={item.id}
                className="cursor-pointer hover:opacity-90 transition-all border-2"
                style={{
                  backgroundColor: item.status === 'completed'
                    ? settings.itemCompletedBg
                    : settings.itemPendingBg,
                  borderColor: item.status === 'completed'
                    ? settings.itemCompletedBorder
                    : settings.itemPendingBorder,
                  color: item.status === 'completed'
                    ? settings.itemCompletedText
                    : settings.itemPendingText,
                  borderRadius: settings.itemBorderRadius,
                  padding: settings.itemPadding,
                }}
              >
                <div className="flex items-start gap-2">
                  {item.status === 'completed' && (
                    <div className="bg-white rounded-full p-0.5 mt-0.5">
                      <Check size={14} style={{ color: settings.itemCompletedBg }} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p
                      style={{
                        fontSize: settings.itemFontSize,
                        fontWeight: settings.itemFontWeight,
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
            ))}

            {/* Preparation Time */}
            {settings.showPreparationTime && (
              <div className="text-center pt-2">
                <p className="text-sm font-medium">
                  Preparation time:{" "}
                  <span
                    className="font-bold"
                    style={{ color: settings.elapsedColor0to5 }}
                  >
                    {mockTicket.preparationTime}
                  </span>
                </p>
              </div>
            )}

            {/* Mark as Done Button */}
            <button
              className="w-full rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: settings.buttonBgColor,
                color: settings.buttonTextColor,
                borderRadius: settings.buttonBorderRadius,
                fontSize: settings.buttonFontSize,
                fontWeight: settings.buttonFontWeight,
                padding: `${settings.buttonPadding} 0`,
              }}
            >
              Mark as done
            </button>
          </div>
        </div>

        {/* Live Preview Label */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500 font-medium">Live Preview</p>
        </div>
      </div>
    </div>
  );
};

export default MobileSettingsPreview;
