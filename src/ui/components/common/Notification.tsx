import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

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
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration - 300);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const styles = {
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/80",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-500",
      text: "text-emerald-800 dark:text-emerald-200",
      progress: "bg-emerald-500"
    },
    error: {
      bg: "bg-red-50 dark:bg-red-950/80",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-500",
      text: "text-red-800 dark:text-red-200",
      progress: "bg-red-500"
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/80",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-500",
      text: "text-amber-800 dark:text-amber-200",
      progress: "bg-amber-500"
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/80",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-500",
      text: "text-blue-800 dark:text-blue-200",
      progress: "bg-blue-500"
    }
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }[type];

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[300px] max-w-[450px]
        rounded-xl shadow-2xl border backdrop-blur-sm
        overflow-hidden
        transform transition-all duration-300 ease-out
        ${isExiting ? "animate-toast-exit" : "animate-toast-enter"}
        ${styles.bg} ${styles.border}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
          <Icon size={20} strokeWidth={2} />
        </div>

        {/* Message */}
        <p className={`flex-1 text-sm font-medium leading-relaxed ${styles.text}`}>
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${styles.text}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-black/5 dark:bg-white/10">
        <div
          className={`h-full ${styles.progress} animate-progress-shrink`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};

export default NotificationItem;
