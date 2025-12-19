import { useEffect } from "react";
import { X } from "lucide-react";

interface NotificationItemProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  message,
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = {
    success: "bg-green-600 border-green-700",
    error: "bg-red-600 border-red-700",
    warning: "bg-yellow-500 text-black border-yellow-600",
    info: "bg-blue-600 border-blue-700"
  }[type];

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[280px]
        max-w-[420px]
        px-4 py-3
        rounded-md shadow-lg border
        text-white flex items-center justify-between
        animate-slideDownFade
        ${style}
      `}
    >
      <span className="text-sm font-medium">{message}</span>

      <button
        onClick={onClose}
        className="ml-3 opacity-80 hover:opacity-100 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationItem;
